import { permanentRedirect } from "next/navigation";

// Short profile URL: /xx/u/<name-or-id> → the existing reader profile.
export default async function UserAlias({ params }) {
  const { lang, username } = await params;
  permanentRedirect(`/${lang}/readers/${encodeURIComponent(username)}`);
}
