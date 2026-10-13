import { redirect } from "next/navigation";

export default function SentencesPracticePage() {
  redirect("/practice?mode=sentences");
}