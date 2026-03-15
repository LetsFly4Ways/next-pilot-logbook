import { redirect } from "next/navigation";

export default function Page() {
  // Automatically redirect to /logs/
  redirect("/app/logs");

  // This component never renders anything
  return null;
}