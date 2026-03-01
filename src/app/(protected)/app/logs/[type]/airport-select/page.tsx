import { useRouter } from "next/navigation";

export default function LogsPage() {
  const router = useRouter();

  router.back();

  // This component never renders anything
  return null;
}