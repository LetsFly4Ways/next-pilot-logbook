"use client";

import Link from "next/link";
import { ChevronsRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md border-b py-3" : "bg-background py-5"
      )}
    >
      <div className="container flex items-center justify-between">
        {/* Brand - Left */}
        <Link href="/" className="flex gap-2 items-center flex-1">
          <div className="relative h-9 w-9 overflow-hidden rounded-md bg-primary dark:bg-secondary flex items-center justify-center">
            <ChevronsRight className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden lg:block">NEXT Pilot Logbook</span>
        </Link>

        {/* Desktop Nav - Center */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link href="#features" className="text-baseline font-medium text-muted-foreground hover:underline underline-offset-4 hover:text-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="font-medium text-muted-foreground hover:underline underline-offset-4 hover:text-primary transition-colors">How it Works</Link>
          <Link href="#faq" className="font-medium text-muted-foreground hover:underline underline-offset-4 hover:text-primary transition-colors">FAQ</Link>
        </nav>

        {/* Auth - Right */}
        <div className="flex items-center justify-end flex-1 gap-6">
          <>
            <Link href="/login" className="font-medium hidden hover:underline underline-offset-4 sm:block">Login</Link>
            <Link href="/register">
              <Button className="bg-primary dark:bg-secondary hover:bg-secondary-hover text-white cursor-pointer">Get Started</Button>
            </Link>
          </>
        </div>
      </div>
    </header>
  );
}