// src/lib/auth.js

export function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}${expires}; path=/`;
}

export function generateMockTokens(username: string) {
    const header = { "alg": "HS256", "typ": "JWT" };
    const payload = { 
        "sub": "1234567890", 
        "name": username, 
        "iat": Math.floor(Date.now() / 1000),
        "exp": Math.floor(Date.now() / 1000) + (60 * 60)
    };
    const signature = 'mock-signature';

    const isNode = typeof window === 'undefined';
    
    const encodedHeader = isNode 
        ? Buffer.from(JSON.stringify(header)).toString('base64')
        : btoa(JSON.stringify(header));
    
    const encodedPayload = isNode 
        ? Buffer.from(JSON.stringify(payload)).toString('base64')
        : btoa(JSON.stringify(payload));
    
    const encodedSignature = isNode 
        ? Buffer.from(signature).toString('base64')
        : btoa(signature);

    const mockAccessToken = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    const mockRefreshToken = `refresh_${crypto.randomUUID()}`;

    return { mockAccessToken, mockRefreshToken };
}

export function validateCredentials(email: string, password: string) {
    return email === 'user@example.com' && password === 'password123';
}

export async function processLogin(email: string, password: string, rememberMe = false) {
    try {
        if (!validateCredentials(email, password)) {
            throw new Error('Invalid email or password.');
        }
        const { mockAccessToken, mockRefreshToken } = generateMockTokens(email);

        const accessTokenExpiry = rememberMe ? 7 : 1/24;
        const refreshTokenExpiry = rememberMe ? 30 : 7;

        setCookie('accessToken', mockAccessToken, accessTokenExpiry);
        setCookie('refreshToken', mockRefreshToken, refreshTokenExpiry);

        console.log('Access Token:', mockAccessToken);
        console.log('Refresh Token:', mockRefreshToken);
        console.log('Cookies set. Check your browser\'s developer tools under Application -> Cookies.');

        return {
            success: true,
            message: 'Login successful! Generating tokens...',
            tokens: { mockAccessToken, mockRefreshToken }
        };

    } catch (error : any) {
        return {
            success: false,
            message: error.message
        };
    }
}