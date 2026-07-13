import { redirect } from "next/navigation";

// The discussion thread now lives inside the WhatsApp-style /community chat
// UI — old links to a standalone thread page just deep-link into it.
export default async function DiscussionRedirect({ params }) {
  const { id } = await params;
  redirect(`/community?open=${encodeURIComponent(id)}`);
}
