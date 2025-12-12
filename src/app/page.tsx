import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="ASC" width={32} height={32} />
            <span className="text-xl font-bold">ASC</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight max-w-3xl mx-auto">
          Your startup&apos;s operations,{" "}
          <span className="text-primary">all in one place</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
          Connect GitHub, Deel, QuickBooks, Mercury and more. Get a unified view
          of your team, finances, and operations.
        </p>
        <div className="flex gap-4 justify-center mt-10">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Unified Dashboard</h3>
            <p className="text-muted-foreground mt-2">
              See all your metrics in one place. Revenue, burn rate, team size, and more.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Team Onboarding</h3>
            <p className="text-muted-foreground mt-2">
              Streamlined onboarding for new hires. Track progress and manage your org chart.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Integrations</h3>
            <p className="text-muted-foreground mt-2">
              Connect your favorite tools. GitHub, Deel, QuickBooks, Mercury, and more.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 ASC. Built for early-stage startups.</p>
        </div>
      </footer>
    </div>
  );
}
