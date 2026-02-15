import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/pages/landing/navigation";
import Footer from "@/components/pages/landing/footer";
import Features from "@/components/pages/landing/features";
import FAQ from "@/components/pages/landing/faq";
import HowItWorks from "@/components/pages/landing/how-it-works";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-48 md:pb-32">
          <div className="container">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                More Flying, <span className="text-secondary">Less Paperwork</span>
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl leading-relaxed">
                Your NEXT logbook is digital, smart, and always with you. Designed for pilots who value precision and simplicity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-white bg-primary dark:bg-secondary hover:bg-secondary-hover px-8 cursor-pointer">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="px-8 cursor-pointer hover:bg-muted">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>

            {/* Main Product Preview */}
            {/* <div className="mt-16 aspect-video bg-muted rounded-2xl border shadow-2xl flex items-center justify-center overflow-hidden mx-auto max-w-5xl">
              <span className="text-muted-foreground">Product Interface Preview</span>
            </div> */}
          </div>
        </section>

        <Features />

        <HowItWorks />

        <FAQ />
      </main>
      <Footer />
    </div>
  );
}