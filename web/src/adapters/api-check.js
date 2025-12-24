const BASE_URL = "/api/health";

async function apiCheck() {
  try {
    const request = await fetch(BASE_URL);
    return request.status === 200;
  } catch {
    return false;
  }
}

export { apiCheck };
