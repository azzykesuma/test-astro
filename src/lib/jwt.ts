// src/lib/jwt.js

/**
 * Decode JWT token and return its parts
 * @param {string} token - JWT token to decode
 * @returns {Object} Object containing header, payload, and signature
 */
export function decodeJWT(token: string) {
    if (!token || typeof token !== 'string') {
        throw new Error('Invalid token provided');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    try {
        // Detect environment (Node.js vs Browser)
        const isNode = typeof window === 'undefined';

        const headerJson = isNode 
            ? Buffer.from(encodedHeader, 'base64').toString('utf-8')
            : atob(encodedHeader);
        const header = JSON.parse(headerJson);

        // Decode payload
        const payloadJson = isNode 
            ? Buffer.from(encodedPayload, 'base64').toString('utf-8')
            : atob(encodedPayload);
        const payload = JSON.parse(payloadJson);

        // Decode signature (usually just base64 decoded, not JSON)
        const signature = isNode 
            ? Buffer.from(encodedSignature, 'base64').toString('utf-8')
            : atob(encodedSignature);

        return {
            header,
            payload,
            signature,
            raw: {
                header: encodedHeader,
                payload: encodedPayload,
                signature: encodedSignature
            }
        };
    } catch (error) {
        throw new Error(`Failed to decode JWT: ${error}`);
    }
}

/**
 * Extract just the payload from a JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload object
 */
export function getJWTPayload(token: string) {
    const decoded = decodeJWT(token);
    return decoded.payload;
}

/**
 * Extract just the header from a JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded header object
 */
export function getJWTHeader(token: string) {
    const decoded = decodeJWT(token);
    return decoded.header;
}

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export function isJWTExpired(token: string) {
    try {
        const payload = getJWTPayload(token);
        
        if (!payload.exp) {
            // No expiration time set
            return false;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        // If we can't decode the token, consider it expired/invalid
        return true;
    }
}

/**
 * Get time until JWT token expires
 * @param {string} token - JWT token
 * @returns {number} Seconds until expiration, or null if no expiration
 */
export function getJWTTimeToExpiry(token: string) {
    try {
        const payload = getJWTPayload(token);
        
        if (!payload.exp) {
            return null;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const timeToExpiry = payload.exp - currentTime;
        
        return Math.max(0, timeToExpiry);
    } catch (error) {
        return 0;
    }
}

/**
 * Validate JWT token format and basic structure
 * @param {string} token - JWT token to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
export function validateJWTFormat(token: string) {
    try {
        const decoded = decodeJWT(token);
        
        // Basic validation checks
        if (!decoded.header.alg) {
            return { isValid: false, error: 'Missing algorithm in header' };
        }
        
        if (!decoded.header.typ || decoded.header.typ !== 'JWT') {
            return { isValid: false, error: 'Invalid or missing token type' };
        }
        
        if (!decoded.payload.iat) {
            return { isValid: false, error: 'Missing issued at time' };
        }
        
        return { isValid: true, decoded };
    } catch (error) {
        return { isValid: false, error: error };
    }
}