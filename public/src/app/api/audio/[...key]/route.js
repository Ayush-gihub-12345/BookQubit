import { getCf } from "@/lib/cf/env";

// GET /api/audio/<path>  → R2 object `audio/<path>` with HTTP Range support
// (needed for seeking in <audio>). Only mp3 files under audio/ are served.
export async function GET(request, { params }) {
  const { key: parts } = await params;
  const path = (parts || []).map((p) => decodeURIComponent(p)).join("/");
  if (!path || path.includes("..") || !path.endsWith(".mp3")) return new Response("Not found", { status: 404 });

  const { env } = await getCf();
  const bucket = env.MEDIA_BUCKET;
  if (!bucket) return new Response("Audio storage unavailable", { status: 503 });

  const wantsRange = request.headers.has("range");
  const obj = await bucket.get(`audio/${path}`, wantsRange ? { range: request.headers } : undefined);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400",
    ETag: obj.httpEtag,
  });

  if (wantsRange && obj.range) {
    const r = obj.range;
    const start = r.suffix !== undefined ? obj.size - r.suffix : r.offset ?? 0;
    const length = r.suffix !== undefined ? r.suffix : r.length ?? obj.size - start;
    headers.set("Content-Range", `bytes ${start}-${start + length - 1}/${obj.size}`);
    headers.set("Content-Length", String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(obj.size));
  return new Response(obj.body, { headers });
}
