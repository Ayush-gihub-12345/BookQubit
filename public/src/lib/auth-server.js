// Server-side Firebase ID-token verification via the Identity Toolkit REST
// API — no Admin SDK needed (works on Workers).
export async function verifyUser(idToken) {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key || !idToken) return null;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const u = data.users?.[0];
  if (!u) return null;
  return { uid: u.localId, name: u.displayName || u.email?.split("@")[0] || "Reader", photo: u.photoUrl || null };
}
