import { AuthProvider } from "@/components/context/auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </AuthProvider>
  );
}
