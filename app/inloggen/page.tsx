import { redirect } from "next/navigation";

export default function InloggenRedirect() {
  redirect("/login");
}
