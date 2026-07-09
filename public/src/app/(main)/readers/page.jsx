import { redirect } from "next/navigation";

export default function ReadersIndexRedirect() {
  redirect("/leaderboard");
}
