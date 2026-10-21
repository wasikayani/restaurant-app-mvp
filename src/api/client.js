// src/api/client.js
// Assignment 2 – Q6: the ONE place where the app talks to the Express server.
//
// Every screen calls request('/api/...') instead of using fetch() directly, so:
//   - the server address is written only once (BASE_URL)
//   - the JSON header and the login token are added automatically
//   - a failed request always throws an Error with the SERVER's message
//     (e.g. "Invalid email or password"), which screens can show in an Alert.

// ⚠️ Change this to YOUR laptop's IP address (the server prints it when it starts:
//    "From your phone open: http://192.168.x.x:5000/api/health").
//    Do NOT use "localhost" – on the phone, localhost means the phone itself.
export const BASE_URL = 'http://192.168.100.9:5000';

const TIMEOUT_MS = 10000; // give up after 10 seconds (e.g. laptop is off or wrong Wi-Fi)

// The token of the logged-in user. AuthContext sets it after login and clears it on logout.
let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

// MongoDB calls the id "_id", but the app's components use "id".
// This copies _id into id for one document or a list of documents.
function addIds(data) {
  if (Array.isArray(data)) return data.map(addIds);
  if (data && typeof data === 'object' && data._id && !data.id) return { ...data, id: data._id };
  return data;
}

// request('/api/menu')                                       -> GET
// request('/api/menu', { method: 'POST', body: { ... } })    -> POST with JSON body
export async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }; // we always send and expect JSON
  if (authToken) headers.Authorization = `Bearer ${authToken}`; // checked by protect on the server

  // AbortController lets us cancel the request if it takes too long
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (networkError) {
    // fetch only throws when the server could not be reached at all
    throw new Error(
      `Cannot reach the server (${BASE_URL}). Is it running, and is your phone on the same Wi-Fi?`,
    );
  } finally {
    clearTimeout(timer);
  }

  // Our server always answers with JSON – read it even for errors (it has a "message")
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // 400 / 401 / 403 / 404 / 409 / 500 -> throw the server's own message
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return addIds(data);
}
