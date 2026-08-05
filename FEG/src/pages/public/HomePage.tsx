/**
 * Landing page for Fitness First Gym public website.
 * Features an interactive 3D hero scene rendered with React Three Fiber.
 */
import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Users, HeartPulse, Trophy, ArrowRight, Clock, Shield, Sparkles, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Lazy-load the heavy 3D scene so the initial page paint stays fast
const HeroScene = lazy(() => import('@/components/three/HeroScene'));

const features = [
  { icon: <Dumbbell className="h-6 w-6" />, title: 'Modern Equipment', description: 'State-of-the-art machines and free weights for every fitness level.' },
  { icon: <Users className="h-6 w-6" />, title: 'Expert Trainers', description: 'Certified professionals dedicated to your personal fitness journey.' },
  { icon: <HeartPulse className="h-6 w-6" />, title: 'Group Classes', description: 'Yoga, HIIT, Spinning, Zumba and more energizing group sessions.' },
  { icon: <Trophy className="h-6 w-6" />, title: 'Proven Results', description: 'Thousands of members have transformed their lives with us.' },
];

const testimonials = [
  {
    quote: 'Fitness First transformed my life. The trainers are incredible and the facilities are world-class.',
    name: 'Sarah Johnson',
    role: 'Member since 2023',
  },
  {
    quote: 'Best gym in the city. Clean, modern, and the community is so supportive.',
    name: 'Mike Brown',
    role: 'Member since 2022',
  },
  {
    quote: 'The group classes are amazing. I look forward to every session!',
    name: 'Emma Wilson',
    role: 'Member since 2024',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        {/* Subtle grid background + ambient glow - Vercel-inspired */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-primary-700/10 blur-[120px]" />

        <div className="container mx-auto px-6 py-24 lg:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge
                variant="outline"
                className="mb-6 border-charcoal-700 bg-charcoal-900/60 text-charcoal-200"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary-400" />
                Premium Fitness Club
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-semibold leading-[1.05] tracking-tight mb-6">
                Train better.
                <br />
                <span className="text-white/70">Live stronger.</span>
              </h1>
              <p className="text-lg text-charcoal-400 mb-8 max-w-lg leading-relaxed">
                Join Fitness First Gym for premium equipment, expert trainers, and a
                community that pushes you to be your best — every single day.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-white text-charcoal-950 hover:bg-charcoal-200 dark:bg-white dark:text-charcoal-950 dark:hover:bg-charcoal-200" asChild>
                  <Link to="/register">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-charcoal-700 text-white hover:bg-charcoal-800" asChild>
                  <Link to="/membership">View Membership</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative h-[420px] lg:h-[520px]"
            >
              {/* 3D interactive gym scene (lazy-loaded for fast first paint) */}
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-charcoal-500">Loading 3D scene…</div>}>
                <HeroScene />
              </Suspense>

              {/* Floating stat badges */}
              <div className="absolute bottom-6 left-4 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/10 px-4 py-2">
                <span className="text-2xl font-semibold text-white">10,000+</span>
                <span className="text-xs text-charcoal-400 ml-2">Active Members</span>
              </div>
              <div className="absolute top-6 right-4 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/10 px-4 py-2">
                <span className="text-2xl font-semibold text-white">24/7</span>
                <span className="text-xs text-charcoal-400 ml-2">Member Access</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-3">Why Choose Fitness First?</h2>
            <p className="text-charcoal-500 dark:text-charcoal-500 max-w-2xl mx-auto">
              Everything you need to achieve your fitness goals in one premium facility.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-900 dark:text-white flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-base mb-1.5 text-charcoal-900 dark:text-white">{feature.title}</h3>
                    <p className="text-sm text-charcoal-500 dark:text-charcoal-500 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Opening Hours */}
      <section className="py-16 bg-charcoal-50 dark:bg-charcoal-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1">
              <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 shadow-sm border border-charcoal-200 dark:border-charcoal-800">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-lg">Opening Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Mon - Fri</span><span className="font-medium">5:00 AM - 10:00 PM</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span className="font-medium">7:00 AM - 9:00 PM</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span className="font-medium">8:00 AM - 6:00 PM</span></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 text-center">
                  <Shield className="h-6 w-6 mx-auto text-green-500 mb-2" />
                  <p className="text-sm font-medium">Safe Environment</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 text-center">
                  <HeartPulse className="h-6 w-6 mx-auto text-red-500 mb-2" />
                  <p className="text-sm font-medium">Health Assessment</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 text-center">
                  <Trophy className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                  <p className="text-sm font-medium">Fitness Challenges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-3">Member Success Stories</h2>
            <p className="text-charcoal-500 dark:text-charcoal-500 max-w-2xl mx-auto">
              Real results from real members of the Fitness First family.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="h-6 w-6 text-primary-600 mb-3" />
                    <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-4">"{t.quote}"</p>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-charcoal-500">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Join Fitness First today and take the first step towards a healthier, stronger you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Join Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}