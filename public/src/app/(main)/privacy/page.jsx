export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <div className="text-muted mt-6 space-y-4 leading-relaxed">
        <p>This page describes, in plain language, what BookQubit stores and why.</p>
        <p>
          <strong className="text-[var(--fg)]">Account data.</strong> If you sign in with Google or
          email/password (via Firebase Authentication), we store your display name, email, and
          profile photo to show on your reader profile and reviews.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Reading activity.</strong> Your bookshelf status,
          ratings, reviews, reading goals, and progress are stored so we can show your dashboard,
          public reader profile, and the Bookworm Ranking leaderboard. Reviews and your profile
          name/photo are visible to other readers; your email is not shown publicly.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Cookies.</strong> We use cookies only for your
          language and theme preference — not for advertising or third-party tracking.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Newsletter.</strong> If you subscribe, we store only
          your email address to send book recommendations, and never sell or share it.
        </p>
        <p>
          Questions about your data? Contact us at{" "}
          <a href="mailto:hello@bookqubit.com" className="text-brand-600 hover:underline">hello@bookqubit.com</a>.
        </p>
      </div>
    </div>
  );
}
