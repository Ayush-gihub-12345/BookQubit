import OfflineList from "@/components/OfflineList";

export const metadata = { title: "Offline", robots: { index: false } };

// Precached by sw.js; shown when a navigation fails with no cached copy.
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-editorial text-3xl font-semibold">You&apos;re offline</h1>
      <p className="text-muted mt-2">Pages you saved for offline are below. Everything else will be back when you reconnect.</p>
      <OfflineList />
    </div>
  );
}
