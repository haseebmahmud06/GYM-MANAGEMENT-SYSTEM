/**
 * About page for Fitness First Gym public website.
 */
import { motion } from 'framer-motion';
import { Dumbbell, HeartPulse, Shield, Trophy, Users, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const values = [
  { icon: <Target className="h-6 w-6" />, title: 'Our Mission', description: 'To empower every individual to achieve their fitness goals through expert guidance, modern facilities, and a supportive community.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Safety First', description: 'Your health and safety are our top priority. Our facilities are maintained to the highest standards with professional staff always on hand.' },
  { icon: <HeartPulse className="h-6 w-6" />, title: 'Holistic Health', description: 'We believe in complete wellness - physical, mental, and emotional. Our programs are designed to transform your entire lifestyle.' },
  { icon: <Trophy className="h-6 w-6" />, title: 'Proven Results', description: 'With over 10,000 success stories, we have established ourselves as the leading fitness destination in the region.' },
];

const stats = [
  { value: '10,000+', label: 'Active Members' },
  { value: '15+', label: 'Expert Trainers' },
  { value: '50+', label: 'Weekly Classes' },
  { value: '10+', label: 'Years of Excellence' },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-charcoal-950 to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">About Fitness First</h1>
          <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
            Your trusted partner in health and fitness since 2014
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">{stat.value}</div>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-charcoal-50 dark:bg-charcoal-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-charcoal-600 dark:text-charcoal-400">
                <p>
                  Fitness First was founded in 2014 with a simple vision: to create a premium fitness facility that makes world-class training accessible to everyone.
                </p>
                <p>
                  What started as a small gym with a handful of dedicated members has grown into one of the region's most trusted fitness destinations.
                </p>
                <p>
                  Today, we're proud to serve over 10,000 members with state-of-the-art equipment, expert trainers, and a community that feels like family.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Our Commitment</p>
                  <p className="text-sm text-charcoal-500">To help you become the best version of yourself.</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {values.map((value, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="w-11 h-11 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                      {value.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{value.title}</h3>
                    <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Users className="h-10 w-10 mx-auto text-primary-600 mb-4" />
          <h2 className="text-3xl font-bold mb-4">Meet Our Expert Team</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 max-w-2xl mx-auto mb-8">
            Our certified trainers bring years of experience and a passion for helping you succeed.
          </p>
          <p className="text-lg text-charcoal-600 dark:text-charcoal-400">
            Browse our <a href="/trainers" className="text-primary-600 font-medium hover:underline">trainers page</a> to meet the team!
          </p>
        </div>
      </section>
    </div>
  );
}