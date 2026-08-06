/**
 * Equipment page for the public website showing gym equipment.
 */
import { motion } from 'framer-motion';
import { Dumbbell, Wrench, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEquipment } from '@/hooks/useEquipment';
import { assetUrl } from '@/lib/utils';

const categories = [
  { name: 'Cardio Zone', description: 'Treadmills, stationary bikes, rowing machines, and more.' },
  { name: 'Strength Training', description: 'Free weights, benches, squat racks, and cable machines.' },
  { name: 'Functional Area', description: 'Kettlebells, battle ropes, TRX, and functional training tools.' },
];

export default function EquipmentPage() {
  const { data: equipmentData, isLoading } = useEquipment();
  const equipment = equipmentData?.data?.results || [];

  return (
    <div>
      <section className="bg-gradient-to-br from-charcoal-950 to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Our Equipment</h1>
          <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
            State-of-the-art equipment for every type of workout
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                      <Dumbbell className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{cat.name}</h3>
                    <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{cat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment List */}
      <section className="py-16 bg-charcoal-50 dark:bg-charcoal-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Available Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            ) : (
              equipment.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all duration-300 overflow-hidden">
                    {/* Equipment image */}
                    {item.image ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={assetUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center bg-charcoal-100 dark:bg-charcoal-800">
                        <Dumbbell className="h-10 w-10 text-charcoal-300 dark:text-charcoal-600" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-charcoal-500">{item.location || 'Gym Floor'}</p>
                          </div>
                        </div>
                        <Badge variant={item.status === 'operational' ? 'success' : 'warning'}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="mt-2 text-sm text-charcoal-500 line-clamp-2">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-6">
              <Shield className="h-8 w-8 mx-auto text-green-500 mb-3" />
              <h3 className="font-semibold mb-2">Regular Maintenance</h3>
              <p className="text-sm text-charcoal-500">All equipment is serviced on a scheduled basis for your safety.</p>
            </div>
            <div className="p-6">
              <Wrench className="h-8 w-8 mx-auto text-amber-500 mb-3" />
              <h3 className="font-semibold mb-2">Immediate Repairs</h3>
              <p className="text-sm text-charcoal-500">Any equipment issues are resolved by our maintenance team promptly.</p>
            </div>
            <div className="p-6">
              <CheckCircle className="h-8 w-8 mx-auto text-blue-500 mb-3" />
              <h3 className="font-semibold mb-2">Staff Guidance</h3>
              <p className="text-sm text-charcoal-500">Our staff will show you how to use equipment safely and correctly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}