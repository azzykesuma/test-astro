// src/utils/authFetch.ts

/**
 * Helper function to safely parse a cookie value.
 * @param {string} name The name of the cookie.
 * @returns {string|null} The decoded cookie value, or null if not found.
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");
  for (const element of cookies) {
    let cookie = element.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

// Internal reference to the message box element, to be initialized once.
let messageBoxElement: HTMLElement | null = null;

/**
 * Initializes the message box element. Call this once, e.g., on page load.
 * @param {string} elementId The ID of the HTML element to use as a message box.
 */
export function initMessageBox(elementId: string) {
  messageBoxElement = document.getElementById(elementId);
}

/**
 * Helper function to display messages to the user.
 * It uses the internally initialized messageBoxElement.
 * @param {string} message The message to display.
 * @param {boolean} isError True if it's an error message, false for success.
 */
export function displayMessage(message: string, isError: boolean): void {
  if (messageBoxElement) {
    messageBoxElement.textContent = message;
    messageBoxElement.classList.remove(
      "hidden",
      "bg-red-100",
      "text-red-700",
      "bg-green-100",
      "text-green-700"
    );
    if (isError) {
      messageBoxElement.classList.add("bg-red-100", "text-red-700");
    } else {
      messageBoxElement.classList.add("bg-green-100", "text-green-700");
    }
  } else {
    console.warn("MessageBox element not initialized. Message:", message);
  }
}

/**
 * Sets a cookie with a given name, value, and expiration days.
 * @param {string} name The name of the cookie.
 * @param {string} value The value of the cookie.
 * @param {number} days The number of days until the cookie expires.
 */
export function setCookie(name: string, value: string, days: number): void {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
  console.log(`Cookie "${name}" set: ${value}`);
}

/**
 * Simulates refreshing the access token using the refresh token.
 * @param {string} currentRefreshToken The current refresh token.
 * @returns {Promise<string|null>} The new access token if successful, otherwise null.
 */
async function refreshAccessToken(
  currentRefreshToken: string
): Promise<string | null> {
  console.log("Attempting to refresh token...");
  try {
    const response = await fetch("/api/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentRefreshToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to refresh token" }));
      throw new Error(
        `Refresh token failed: ${response.status} - ${errorData.message}`
      );
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken || currentRefreshToken;

    setCookie("accessToken", newAccessToken, 1 / 24); // e.g., new access token valid for 1 hour
    setCookie("refreshToken", newRefreshToken, 7); // e.g., refresh token valid for 7 days

    displayMessage("Token refreshed successfully!", false);
    return newAccessToken;
  } catch (error: any) {
    console.error("Error refreshing token:", error);
    displayMessage(
      `Token refresh failed: ${error.message}. Please log in again.`,
      true
    );
    return null;
  }
}

/**
 * A wrapper around `fetch` that handles access token injection,
 * 401 unauthorized errors, and automatic token refreshing.
 * @param {string} url The URL to fetch.
 * @param {RequestInit} options Fetch options (e.g., method, body, headers).
 * @param {number} retryCount Internal counter for retries.
 * @returns {Promise<Response>} The raw Response object from the fetch request.
 * @throws {Error} If the request ultimately fails after retries or refresh token issues.
 */
// Helper function to ensure we have a valid access token
async function ensureValidAccessToken(): Promise<string> {
  let accessToken = getCookie("accessToken");

  if (!accessToken) {
    const refreshToken = getCookie("refreshToken");
    if (!refreshToken) {
      throw new Error("No access token or refresh token found. Please log in.");
    }

    displayMessage("Access token missing. Attempting to refresh...", false);
    accessToken = await refreshAccessToken(refreshToken);

    if (!accessToken) {
      throw new Error("Could not obtain access token, refresh failed.");
    }
  }

  return accessToken;
}

// Helper function to prepare headers with authentication
function prepareHeaders(options: RequestInit, accessToken: string): Headers {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  // Only set Content-Type if not already set and body exists
  if (!headers.has("Content-Type") && options.body) {
    const needsJsonContentType =
      typeof options.body === "string" ||
      options.body instanceof URLSearchParams;
    if (needsJsonContentType) {
      headers.set("Content-Type", "application/json");
    }
  }

  return headers;
}

// Helper function to handle token refresh and retry
async function handleTokenRefreshAndRetry(
  url: string,
  options: RequestInit,
  retryCount: number
): Promise<Response> {
  const refreshToken = getCookie("refreshToken");
  if (!refreshToken) {
    throw new Error(
      "No refresh token found for retry. User must re-authenticate."
    );
  }

  displayMessage(
    "Access token expired. Attempting to refresh and retry...",
    true
  );
  console.warn("401 Unauthorized. Attempting token refresh...");

  const newAccessToken = await refreshAccessToken(refreshToken);
  if (!newAccessToken) {
    throw new Error("Token refresh failed. User must re-authenticate.");
  }

  displayMessage("Retrying request with new token...", false);
  return await authenticatedFetch(url, options, retryCount + 1);
}

// Helper function to handle error responses
async function handleErrorResponse(response: Response): Promise<never> {
  const errorData = await response
    .json()
    .catch(() => ({ message: "Unknown error" }));
  throw new Error(
    `API Request Failed: Status ${response.status} - ${
      errorData.message || response.statusText
    }`
  );
}

// Main function with reduced complexity
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  const maxRetries = 1;
  try {
    // Ensure we have a valid access token
    const accessToken = await ensureValidAccessToken();
    const headers = prepareHeaders(options, accessToken);

    // Perform the fetch request
    const response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized with retry
    if (response.status === 401 && retryCount < maxRetries) {
      return await handleTokenRefreshAndRetry(url, options, retryCount);
    }

    // Handle other error responses
    if (!response.ok) {
      await handleErrorResponse(response);
    }

    return response;
  } catch (error: any) {
    console.error("Error during authenticated fetch:", error);
    throw error;
  }
}
