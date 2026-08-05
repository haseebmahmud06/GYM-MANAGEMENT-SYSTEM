/**
 * Fitness Tools page - plate calculator + rest timer in one place.
 */
import PlateCalculator from '@/components/workout/PlateCalculator';
import RestTimer from '@/components/workout/RestTimer';
import { Timer } from 'lucide-react';

export default function FitnessToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Fitness Tools</h2>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
          Handy tools to power your training
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Timer className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-charcoal-900 dark:text-white">Rest Timer</h3>
          </div>
          <RestTimer />
        </div>
        <div>
          <PlateCalculator />
        </div>
      </div>
    </div>
  );
}
