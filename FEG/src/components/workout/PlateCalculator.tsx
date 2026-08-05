/**
 * PlateCalculator - professional gym plate calculator.
 *
 * Members enter a target weight, barbell weight and unit (metric/imperial);
 * the component calculates the plates required per side and renders a visual
 * barbell preview showing plate placement. Supports the standard plate sizes.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STANDARD_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const STANDARD_LB = [45, 35, 25, 10, 5, 2.5, 1.25];

function calculatePlates(target: number, barbell: number, unit: 'kg' | 'lb') {
  const plates = unit === 'kg' ? STANDARD_KG : STANDARD_LB;
  let perSide = (target - barbell) / 2;
  const result: { plate: number; quantity: number }[] = [];
  for (const plate of plates) {
    if (perSide <= 0.001) break;
    const count = Math.floor(perSide / plate);
    if (count > 0) {
      result.push({ plate, quantity: count });
      perSide = Math.round((perSide - count * plate) * 100) / 100;
    }
  }
  return {
    plates: result,
    perSideTotal: Math.round(((target - barbell) / 2) * 100) / 100,
    exact: Math.abs(perSide) < 0.01,
  };
}

export default function PlateCalculator() {
  const [target, setTarget] = useState('100');
  const [barbell, setBarbell] = useState('20');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  const numericTarget = parseFloat(target) || 0;
  const numericBarbell = parseFloat(barbell) || 0;
  const isValid = numericTarget > numericBarbell && numericTarget > 0;

  const result = useMemo(
    () => (isValid ? calculatePlates(numericTarget, numericBarbell, unit) : null),
    [numericTarget, numericBarbell, unit, isValid]
  );

  // Normalise total "bar width" for the visual preview: plates scale inversely
  // so a heavy load shows a longer barbell.
  const visualWidth = useMemo(() => {
    if (!result) return 0;
    return Math.min(100, 40 + result.perSideTotal * 0.5);
  }, [result]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary-600" /> Plate Calculator
        </CardTitle>
        <CardDescription>Calculate plates per side for your target weight.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Target Weight</Label>
            <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} min={0} />
          </div>
          <div className="space-y-1.5">
            <Label>Barbell Weight</Label>
            <Input type="number" value={barbell} onChange={(e) => setBarbell(e.target.value)} min={0} />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as 'kg' | 'lb')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg (Metric)</SelectItem>
                <SelectItem value="lb">lb (Imperial)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isValid && (
          <p className="text-sm text-amber-600">Enter a target weight greater than the barbell weight.</p>
        )}

        {result && (
          <>
            {/* Visual barbell preview */}
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex items-center">
                {/* Collar */}
                <div className="h-20 w-3 rounded bg-charcoal-400 dark:bg-charcoal-600" />
                <div className="flex -space-x-1" style={{ width: `${visualWidth / 2}%` }}>
                  {result.plates.map((p, i) => (
                    <motion.div
                      key={`${p.plate}-${i}`}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-full border-2"
                      style={{
                        height: 44 + p.plate,
                        width: 8 + p.plate * 0.4,
                        background: p.plate >= 10 ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                        borderColor: 'rgba(255,255,255,0.2)',
                      }}
                      title={`${p.plate}${unit} x${p.quantity}`}
                    />
                  ))}
                </div>
                {/* Bar center */}
                <div className="h-3 w-16 rounded-full bg-charcoal-600 dark:bg-charcoal-300" />
                <div className="flex -space-x-1" style={{ width: `${visualWidth / 2}%` }}>
                  {[...result.plates].reverse().map((p, i) => (
                    <div
                      key={`r-${p.plate}-${i}`}
                      className="rounded-full border-2"
                      style={{
                        height: 44 + p.plate,
                        width: 8 + p.plate * 0.4,
                        background: p.plate >= 10 ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                        borderColor: 'rgba(255,255,255,0.2)',
                      }}
                    />
                  ))}
                </div>
                <div className="h-20 w-3 rounded bg-charcoal-400 dark:bg-charcoal-600" />
              </div>
              <p className="text-xs text-charcoal-500">{result.perSideTotal} {unit} per side</p>
            </div>

            {/* Plate breakdown */}
            <div className="rounded-lg bg-charcoal-50 p-3 dark:bg-charcoal-800/50">
              {result.plates.length === 0 ? (
                <p className="text-sm text-charcoal-500">No plates needed - use just the bar.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {result.plates.map((p, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{p.plate} {unit}</span>
                      <span className="font-medium">{p.quantity} per side</span>
                    </li>
                  ))}
                </ul>
              )}
              {!result.exact && (
                <p className="mt-2 text-xs text-amber-600">This combination isn't exact on standard plates.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
