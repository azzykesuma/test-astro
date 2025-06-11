// src/pages/api/proxied-data.ts
export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // 1. Get the Authorization header from the incoming request (from your frontend)
  const authHeader = request.headers.get('Authorization');
   if (authHeader?.includes('expired-token-mock')) {
     console.log('Simulating 401 for expired token.');
     return new Response(JSON.stringify({ message: 'Access token expired. Please refresh.' }), {
         status: 401,
         headers: { 'Content-Type': 'application/json' }
     });
  }


  if (!authHeader) {
    return new Response(JSON.stringify({ message: 'Authorization header missing' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 2. Make the actual request to the external API from the server
    const externalApiUrl = 'https://jsonplaceholder.typicode.com/todos/1'; // Your actual external API endpoint

    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 3. Forward the Authorization header (or any other necessary headers)
        // This ensures the external API also gets the token.
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      // If the external API returns an error, pass it back to the client
      const errorData = await response.json().catch(() => ({ message: 'External API error' }));
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Parse the response from the external API
    const data = await response.json();

    // 5. Send the external API's data back to your frontend
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching data from external API:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};