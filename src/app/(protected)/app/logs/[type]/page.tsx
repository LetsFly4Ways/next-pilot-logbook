import { redirect } from "next/navigation";

export default function LogsPage() {
  // Automatically redirect to /logs/
  redirect("/app/logs");

  // This component never renders anything
  return null;
}