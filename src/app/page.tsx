import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Zap, Shield, DollarSign, GitBranch } from "lucide-react";

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
        <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6">
          The Operating System for Startups
        </div>
        <h1 className="text-5xl font-bold tracking-tight max-w-3xl mx-auto">
          Run your startup like a{" "}
          <span className="text-primary">well-oiled machine</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
          HR, payroll, compliance, and team management — all automated.
          Connect your tools, onboard employees in minutes, and focus on building your product.
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
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">People & HR</h3>
            <p className="text-muted-foreground mt-2">
              Hire, onboard, and manage your team. Automated provisioning to Slack, GitHub, and more.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Payroll & Finance</h3>
            <p className="text-muted-foreground mt-2">
              Track burn rate, runway, and expenses. Integrate with Deel, Mercury, and QuickBooks.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Compliance</h3>
            <p className="text-muted-foreground mt-2">
              Contracts, NDAs, and agreements. Keep your startup legally buttoned up.
            </p>
          </div>
        </div>

        {/* Second row of features */}
        <div className="grid md:grid-cols-3 gap-8 mt-8 text-left">
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <GitBranch className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold">Developer Tools</h3>
            <p className="text-muted-foreground mt-2">
              Auto-add engineers to GitHub repos, manage access, track PRs and commits.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold">Unified Dashboard</h3>
            <p className="text-muted-foreground mt-2">
              All your metrics in one place. Team size, burn rate, runway, and KPIs.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold">Automations</h3>
            <p className="text-muted-foreground mt-2">
              Set it and forget it. Automatic provisioning, notifications, and workflows.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 ASC. Built for early-stage startups.</p>
        </div>
      </footer>
    </div>
  );
}
