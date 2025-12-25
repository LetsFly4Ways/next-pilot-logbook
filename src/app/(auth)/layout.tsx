const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="grid h-screen md:min-h-screen bg-card flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0"
      style={{ minHeight: "100dvh" }}
    >
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/auth-background.png')" }}
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <span>NEXT Logbook</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <footer className="text-sm">© Copyright</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-2 lg:p-8">{children}</div>
    </div>
  );
};

export default AuthLayout;
