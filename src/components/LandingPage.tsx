"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Leaf, Users, Heart, ShieldCheck, FileText, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ReachOutDialog } from "@/components/ReachOutDialog"
import { useState } from "react"

interface Props {
  studentCount: number
  alumniCount: number
}

export default function LandingPage({ studentCount, alumniCount }: Props) {
  const [reachOutOpen, setReachOutOpen] = useState(false)
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  }

  const stats = [
    { label: "Active Students", value: studentCount.toLocaleString(), icon: "🎓" },
    { label: "Alumni Network", value: alumniCount > 0 ? alumniCount.toLocaleString() : "Growing", icon: "🌱" },
    { label: "Monthly Target", value: "₹30", icon: "💰" },
    { label: "Launched", value: "5 Sept 2021", icon: "🚀" },
  ]

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="VSF Logo" width={44} height={44} className="object-contain rounded-full" />
            <span className="font-bold text-xl tracking-tight">Vriksh <span className="text-primary">Students Federation</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Student Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full -z-10" />
        
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Official Federation Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Empowering Students, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
                Building Futures.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Join the Vriksh Students Federation. Manage your monthly contributions, track expenses transparently, and stay connected with alumni.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                  Access Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#about">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base bg-background/50 backdrop-blur">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Mission Section */}
      <section id="about" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 -z-10" />
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-widest uppercase mb-4 border border-primary/20">
              Who We Are
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
              Vriksh Students Federation
            </h2>
          </motion.div>

          {/* Quote Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mb-14"
          >
            <div className="bg-primary rounded-3xl px-8 py-10 md:px-16 md:py-12 text-center shadow-2xl shadow-primary/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="text-5xl md:text-6xl text-white/20 font-serif leading-none mb-2">&ldquo;</div>
              <p className="text-white text-xl md:text-3xl font-bold italic relative z-10 leading-snug">
                By the Students, For the Students,<br className="hidden md:block" /> Of the Students
              </p>
              <div className="text-5xl md:text-6xl text-white/20 font-serif leading-none mt-2 rotate-180">&ldquo;</div>
            </div>
          </motion.div>

          {/* Description + Mission */}
          <div className="grid md:grid-cols-2 gap-8 mb-14">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-2xl">🌿</div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Our Identity</h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                VRIKSH STUDENTS FEDERATION is a <span className="text-foreground font-semibold">student-driven initiative</span> dedicated to supporting students through unity, contribution, and collective growth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 text-2xl">🤝</div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                The federation works towards <span className="text-foreground font-semibold">helping students in times of need</span>, supporting educational activities, welfare initiatives, and building a stronger student community.
              </p>
            </motion.div>
          </div>

          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center gap-4 mb-14 shadow-sm"
          >
            <div className="text-3xl">📢</div>
            <p className="text-amber-900 dark:text-amber-200 text-base leading-relaxed text-center md:text-left">
              If any student requires <strong>assistance, support, or guidance</strong>, they may contact the federation admin or volunteer team directly through the student portal.
            </p>
            <Link href="/login" className="flex-shrink-0">
              <Button className="rounded-full px-6 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-md"
                onClick={e => { e.preventDefault(); setReachOutOpen(true) }}>
                Reach Out
              </Button>
            </Link>
          </motion.div>

          {/* Closing Motto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <span className="flex items-center gap-2 text-lg font-bold text-primary">
                <span>🌱</span> Together We Grow.
              </span>
              <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-primary/40" />
              <span className="flex items-center gap-2 text-lg font-bold text-emerald-600">
                <span>💚</span> Together We Support.
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Pillars</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to manage your federation membership and contributions effectively.</p>
          </div>


          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Heart, title: "Monthly Contributions", desc: "Easily track and pay your mandatory ₹30 monthly federation contribution securely." },
              { icon: ShieldCheck, title: "100% Transparent", desc: "Every single expense and collection is tracked, audited, and visible to verified members." },
              { icon: FileText, title: "Instant Receipts", desc: "Generate and download verifiable PDF receipts automatically after your payment is verified." },
              { icon: Users, title: "Alumni Network", desc: "Stay connected with Vriksh Pathshala alumni and participate in welfare activities." },
              { icon: TrendingUp, title: "Advance Payments", desc: "Pay for multiple months in advance or make custom donations seamlessly." },
              { icon: Leaf, title: "Welfare Programs", desc: "Your contributions directly support student welfare, emergencies, and educational events." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10 text-primary-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to make an impact?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            Log in to your student portal to view your dues, submit payment proofs, and stay updated with federation activities.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="rounded-full h-14 px-10 text-lg shadow-2xl hover:scale-105 transition-transform text-primary font-semibold">
              Student Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="VSF Logo" width={36} height={36} className="object-contain rounded-full" />
            <span className="font-semibold text-foreground">Vriksh Students Federation</span>
          </div>
          <p>© {new Date().getFullYear()} Vriksh Pathshala. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      <ReachOutDialog open={reachOutOpen} onClose={() => setReachOutOpen(false)} />
    </div>
  )
}
