import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const currentRefreshToken = authHeader?.split(' ')[1];
  
  if (currentRefreshToken?.startsWith('refresh_')) {
    // Create JWT structure
    const header = { alg: "HS256", typ: "JWT" };
    const payload = { 
      sub: "1234567890", 
      name: "user", 
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };
    const signature = Math.random().toString(36).substring(2, 15);

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const encodedSignature = Buffer.from(signature).toString('base64');

    const newAccessToken = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    const newRefreshToken = `refresh_${crypto.randomUUID()}`;

    return new Response(JSON.stringify({ 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ 
      message: 'Invalid or expired refresh token' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};