import { getRequestUser } from "@/lib/api-auth";

// Thin wrapper over the site's request authentication (src/lib/api-auth.js: Bearer token, verified
// via Identity Toolkit and memoised for 60 s). Returns { uid, name, photo, email } or null; never throws
// (an upstream verification outage reads as signed-out here, which the routes answer with 401).
export async function requireUser(request) {
  try {
    return await getRequestUser(request);
  } catch {
    return null;
  }
}

export const unauthorized = () => Response.json({ error: "unauthorized" }, { status: 401 });
