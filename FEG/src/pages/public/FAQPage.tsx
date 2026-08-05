/**
 * FAQ page for the public website.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    q: 'How do I become a member?',
    a: 'Simply click "Join Now" and complete the registration form. You can then purchase a membership package of your choice.',
  },
  {
    q: 'What are the membership options?',
    a: 'We offer flexible plans including daily passes, monthly memberships, and annual packages. Visit our Membership page for full details.',
  },
  {
    q: 'Can I freeze my membership?',
    a: 'Yes, active members can freeze their membership for up to 30 days per year. Contact our front desk to arrange this.',
  },
  {
    q: 'What should I bring on my first visit?',
    a: 'Bring comfortable workout clothes, proper shoes, a towel, and a water bottle. We recommend arriving 15 minutes early for a facility tour.',
  },
  {
    q: 'Do you offer personal training?',
    a: 'Yes, we have certified personal trainers available for one-on-one sessions. You can book through the member portal or at the front desk.',
  },
  {
    q: 'Are group classes included in membership?',
    a: 'Most membership packages include access to group classes. Check your specific package details on the Membership page.',
  },
  {
    q: 'What are the gym operating hours?',
    a: 'We are open Monday to Friday from 5 AM to 10 PM, Saturdays from 7 AM to 9 PM, and Sundays from 8 AM to 6 PM.',
  },
  {
    q: 'How do I cancel my membership?',
    a: 'Membership cancellation is handled by our front desk team. We require 30 days notice for monthly plans.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      <section className="bg-gradient-to-br from-charcoal-950 to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
            Everything you need to know about Fitness First Gym
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={index} className="cursor-pointer" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium pr-4">{faq.q}</h3>
                    <ChevronDown
                      className={`h-5 w-5 text-charcoal-400 flex-shrink-0 transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 pt-3">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}