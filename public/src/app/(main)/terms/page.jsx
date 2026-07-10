export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <div className="text-muted mt-6 space-y-4 leading-relaxed">
        <p>By using BookQubit, you agree to the following:</p>
        <p>
          <strong className="text-[var(--fg)]">Content.</strong> Book summaries, ratings, and
          descriptions are provided for informational purposes. Reviews and discussion posts are
          written by community members and reflect their own opinions, not BookQubit's.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Community conduct.</strong> Keep reviews and
          discussions respectful and on-topic. Content that is abusive, spam, or infringes on
          others' rights may be removed.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Availability.</strong> BookQubit is provided
          "as is." We aim for accuracy but can't guarantee every listing is complete or error-free.
        </p>
        <p>
          Questions about these terms? Contact{" "}
          <a href="mailto:contact@bookqubit.com" className="text-brand-600 hover:underline">contact@bookqubit.com</a>.
        </p>
      </div>
    </div>
  );
}
