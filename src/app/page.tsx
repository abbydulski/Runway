import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Zap, Shield, DollarSign, GitBranch, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/RunwayLogo.png" alt="Runway" width={28} height={28} />
            <span className="text-lg font-bold">Runway</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 pt-32 pb-16">
        {/* Large centered logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full scale-150" />
            <Image
              src="/RunwayLogo.png"
              alt="Runway"
              width={120}
              height={120}
              className="relative drop-shadow-xl"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-full text-sm font-medium text-slate-700 mb-6">
            <Sparkles className="h-4 w-4 text-purple-500" />
            The Operating System for Startups
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            Launch your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              startup operations
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            HR, payroll, compliance, and team management — all automated.
            Connect your tools, onboard employees in minutes, and focus on building your product.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="px-8">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Free for small teams
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Setup in 5 minutes
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Everything you need to scale</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              From hiring your first employee to managing a growing team, Runway has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group p-8 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">People & HR</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Hire, onboard, and manage your team. Automated provisioning to Slack, GitHub, and more.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Payroll & Finance</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Track burn rate, runway, and expenses. Integrate with Deel, Mercury, and QuickBooks.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Compliance</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Contracts, NDAs, and agreements. Keep your startup legally buttoned up.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <GitBranch className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Developer Tools</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Auto-add engineers to GitHub repos, manage access, track PRs and commits.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Unified Dashboard</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                All your metrics in one place. Team size, burn rate, runway, and KPIs.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Automations</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Set it and forget it. Automatic provisioning, notifications, and workflows.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="max-w-2xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <h2 className="text-3xl font-bold">Ready to streamline your startup?</h2>
            <p className="text-slate-300 mt-4">
              Join hundreds of founders who trust Runway to manage their operations.
            </p>
            <Link href="/signup">
              <Button size="lg" className="mt-8 bg-white text-slate-900 hover:bg-slate-100 gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/RunwayLogo.png" alt="Runway" width={24} height={24} />
              <span className="font-semibold">Runway</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Runway. Built for early-stage startups.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
