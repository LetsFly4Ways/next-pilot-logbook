import Link from "next/link";
import Image from "next/image";

import { ThemeToggle } from "@/components/pages/landing/theme-toggle";
import { CopyrightYear } from "@/components/pages/landing/copyright-year";

import { FaGithub } from "react-icons/fa";
import { ChevronsRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Main Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded bg-primary dark:bg-secondary flex items-center justify-center">
                <ChevronsRight className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">NEXT Pilot Logbook</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Modern flight logging for pilots who value precision. Built to be fast, secure, and always at your fingertips.
            </p>
            {/* LetsFly4Ways Branding */}
            <Link
              href="https://github.com/LetsFly4Ways"
              className="flex items-center gap-3 group border w-fit p-2 pr-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded">
                <Image
                  src="/assets/letsfly4ways-logo.png"
                  alt="LetsFly4Ways Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground">Maintained by</span>
                <span className="text-sm font-bold group-hover:text-primary transition-colors">LetsFly4Ways!</span>
              </div>
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/70">Legal</h4>
            <Link href="/license" className="text-sm text-muted-foreground hover:text-primary transition-colors">License</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Statement</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>

          {/* Github / Community */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/70">Project</h4>
            <Link
              href="https://github.com/LetsFly4Ways/next-pilot-logbook"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
            >
              <FaGithub className="h-4 w-4" /> Repository
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">
            © <CopyrightYear /> NEXT Pilot Logbook. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}