// src/pages/api/refresh-token.ts
export const prerender = false
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const currentRefreshToken = authHeader?.split(' ')[1]; // Assuming Bearer token
  console.log( authHeader, currentRefreshToken)

  // --- Mock Refresh Token Logic ---
  if (currentRefreshToken?.startsWith('refresh_')) {
    console.log('suksesny')
    // Simulate successful refresh
    const newAccessToken = btoa(JSON.stringify({ header: 'mock-header', payload: 'new-mock-access-payload', sig: Math.random().toString(36).substring(2, 15) }));
    const newRefreshToken = `refresh_${crypto.randomUUID()}`;

    return new Response(JSON.stringify({ accessToken: newAccessToken, refreshToken: newRefreshToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ message: 'Invalid or expired refresh token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};