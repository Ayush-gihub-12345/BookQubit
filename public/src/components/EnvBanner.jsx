import { isDevEnv } from "@/lib/env";

// A strip across the top of every page on the dev deployment, so nobody mistakes
// it for the live site (or enters real details into it). Renders nothing in
// production. Marker colour is the one highlight in the design system, used here
// because this is exactly "look at this first" information.
export default function EnvBanner() {
  if (!isDevEnv()) return null;
  return (
    <div role="status" className="bg-marker px-4 py-1.5 text-center text-xs font-semibold text-marker-ink">
      Dev environment: test data only, not the live BookQubit site
    </div>
  );
}
