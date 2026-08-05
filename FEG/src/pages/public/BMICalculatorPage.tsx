/**
 * BMI Calculator page for the public website.
 */
import { useState } from 'react';
import { Activity, Scale, Ruler } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

function getBMIStatus(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600 dark:text-blue-400' };
  if (bmi < 25) return { label: 'Normal Weight', color: 'text-green-600 dark:text-green-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Obese', color: 'text-red-600 dark:text-red-400' };
}

export default function BMICalculatorPage() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmi, setBmi] = useState<number | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      setBmi(calculateBMI(w, h));
    }
  };

  const status = bmi !== null ? getBMIStatus(bmi) : null;

  return (
    <div>
      <section className="bg-gradient-to-br from-charcoal-950 to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">BMI Calculator</h1>
          <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
            Calculate your Body Mass Index to understand your health status
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600" />
                Calculate Your BMI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                    <Input
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                    Height (cm)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                    <Input
                      type="number"
                      placeholder="175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleCalculate} disabled={!weight || !height} size="lg" className="w-full">
                Calculate BMI
              </Button>

              {bmi !== null && status && (
                <div className="p-6 rounded-xl bg-charcoal-50 dark:bg-charcoal-900/50 text-center">
                  <p className="text-sm text-charcoal-500 mb-2">Your BMI</p>
                  <p className="text-5xl font-bold mb-2">{bmi.toFixed(1)}</p>
                  <p className={`text-lg font-medium ${status.color}`}>{status.label}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}