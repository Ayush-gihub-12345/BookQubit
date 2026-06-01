function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

export function getBearerToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

export function getRequestUserId(request) {
  const token = getBearerToken(request);
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length === 3) {
    try {
      const payload = decodeBase64Url(parts[1]);
      return payload.user_id || payload.sub || payload.uid || null;
    } catch {
      return null;
    }
  }

  return token;
}
