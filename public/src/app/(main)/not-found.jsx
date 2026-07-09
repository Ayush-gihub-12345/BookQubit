import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <p className="text-7xl">📚</p>
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist or was moved.</p>
        <Link href="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    </div>
  );
}
