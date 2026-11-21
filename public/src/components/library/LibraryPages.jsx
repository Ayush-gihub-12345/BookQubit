"use client";

import LibraryShell from "./LibraryShell";
import LibraryView from "./LibraryView";
import StatsView from "./StatsView";
import ImportView from "./ImportView";

// The three /library pages. LibraryShell takes a render function (it needs the signed-in user), and a function cannot be
// passed from a Server Component page to a Client Component (that is what crashed signed-in readers with "An error occurred
// in the Server Components render"). So the functions are created here, inside a client module.
export function LibraryHome() {
  return <LibraryShell>{(user) => <LibraryView user={user} />}</LibraryShell>;
}
export function LibraryStats() {
  return <LibraryShell>{() => <StatsView />}</LibraryShell>;
}
export function LibraryImport() {
  return <LibraryShell>{() => <ImportView />}</LibraryShell>;
}
