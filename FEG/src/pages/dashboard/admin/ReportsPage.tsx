/**
 * Reports page for admin to generate and export analytical reports.
 *
 * Downloads real CSV data from the backend `/dashboard/reports/export/` endpoint,
 * optionally filtered by the selected date range, and can trigger the R
 * analytics pipeline to produce ggplot2 visualisations.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FileText, Download, Calendar, Users, DollarSign, TrendingUp,
  Clock, BarChart3, Printer, FlaskConical, Loader2, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { dashboardApi } from '@/lib/api';
import type { ReactNode } from 'react';

interface Report {
  id: number;
  name: string;
  type: string;
  description: string;
  icon: ReactNode;
  format: string;
}

/**
 * Report catalogue — each entry maps to the backend `report` query param.
 * The export endpoint streams real data filtered by the selected date range.
 */
const reports: Report[] = [
  { id: 1, name: 'Registered Users Report', type: 'users', description: 'All registered users with membership status and join date', icon: <Users className="h-5 w-5" />, format: 'CSV' },
  { id: 2, name: 'Bookings Report', type: 'bookings', description: 'All bookings with user, trainer, package, and status details', icon: <Calendar className="h-5 w-5" />, format: 'CSV' },
  { id: 3, name: 'Payments Report', type: 'payments', description: 'All payment transactions with amounts, methods, and statuses', icon: <DollarSign className="h-5 w-5" />, format: 'CSV' },
  { id: 4, name: 'Attendance Report', type: 'attendance', description: 'Member check-ins with check-in/out times and lateness flags', icon: <Clock className="h-5 w-5" />, format: 'CSV' },
  { id: 5, name: 'Trainers Report', type: 'trainers', description: 'All trainers with specialties, contact details, and status', icon: <TrendingUp className="h-5 w-5" />, format: 'CSV' },
  { id: 6, name: 'Equipment Report', type: 'equipment', description: 'All gym equipment with category, status, and purchase date', icon: <BarChart3 className="h-5 w-5" />, format: 'CSV' },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);
  const [rRunning, setRRunning] = useState(false);
  const [rCharts, setRCharts] = useState<string[]>([]);
  const [wRunning, setWRunning] = useState(false);
  const [wCharts, setWCharts] = useState<string[]>([]);

  // Filter the report cards by the selected category
  const filteredReports = reports.filter((r) => selectedType === 'all' || r.type === selectedType);

  /**
   * Download a real CSV export from the backend for the selected report.
   * The blob is converted to a temporary object URL and auto-downloaded.
   */
  const downloadReport = async (report: Report) => {
    setExporting(report.type);
    try {
      const response = await dashboardApi.exportReport(report.type, startDate || undefined, endDate || undefined);
      // Create a downloadable link from the blob response
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${report.name} exported successfully`);
    } catch {
      toast.error('Failed to export report. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  /**
   * Trigger the R analytics pipeline on the backend.
   * The backend exports live DB data to CSVs and runs the R script
   * to produce ggplot2 visualisations, returning the chart filenames.
   */
  const runRReport = async () => {
    setRRunning(true);
    try {
      const { data } = await dashboardApi.generateRReport();
      if (data.status === 'success') {
        setRCharts(data.generated_charts || []);
        toast.success(`R report generated: ${(data.generated_charts || []).length} charts`);
      } else {
        toast.error(data.message || data.std_err || 'R script failed. Check R installation.');
      }
    } catch {
      toast.error('Failed to run R analytics. Is R/Rscript installed?');
    } finally {
      setRRunning(false);
    }
  };

  /**
   * Trigger the workout & training analytics R pipeline.
   * Generates volume trends, frequency, workout types, member weight trends,
   * top members by volume, and duration trends.
   */
  const runWorkoutRReport = async () => {
    setWRunning(true);
    try {
      const { data } = await dashboardApi.generateWorkoutRReport();
      if (data.status === 'success') {
        setWCharts(data.generated_charts || []);
        toast.success(`Workout R report generated: ${(data.generated_charts || []).length} charts`);
      } else {
        toast.error(data.message || data.std_err || 'Workout R script failed.');
      }
    } catch {
      toast.error('Failed to run workout R analytics.');
    } finally {
      setWRunning(false);
    }
  };

  /**
   * Print-friendly view of the report metadata and selected period.
   */
  const printReport = (report: Report) => {
    const printContent = `
      <html>
        <head><title>${report.name}</title></head>
        <body>
          <h1>${report.name}</h1>
          <p>${report.description}</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <p>Period: ${startDate || 'All time'} to ${endDate || 'Today'} — export CSV for full data.</p>
        </body>
      </html>`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Reports</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Generate and export real analytical reports</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="secondary" size="sm" onClick={runWorkoutRReport} disabled={wRunning}>
            {wRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
            {wRunning ? 'Running...' : 'Run Training Analytics'}
          </Button>
          <Button variant="secondary" size="sm" onClick={runRReport} disabled={rRunning}>
            {rRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FlaskConical className="h-4 w-4 mr-2" />}
            {rRunning ? 'Running R...' : 'Run R Analytics'}
          </Button>
        </div>
      </div>

      {/* Date range filter + category tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'users', 'bookings', 'payments', 'attendance', 'trainers', 'equipment'].map((type) => (
                <Button key={type} variant={selectedType === type ? 'default' : 'outline'} size="sm" onClick={() => setSelectedType(type)} className="capitalize">
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* R-generated charts preview */}
      {rCharts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rCharts.map((chart) => (
            <Card key={chart}>
              <CardContent className="p-3">
                <img
                  src={`/api/dashboard/reports/r-output/${chart}/`}
                  alt={chart.replace('.png', '')}
                  className="w-full h-auto rounded-lg"
                />
                <p className="text-xs text-center mt-2 text-charcoal-500 capitalize">
                  {chart.replace('.png', '').replace(/_/g, ' ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Workout / Training analytics charts preview */}
      {wCharts.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-charcoal-900 dark:text-white">Training Analytics (R)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wCharts.map((chart) => (
              <Card key={chart}>
                <CardContent className="p-3">
                  <img
                    src={`/api/dashboard/reports/r-output/${chart}/`}
                    alt={chart.replace('.png', '')}
                    className="w-full h-auto rounded-lg"
                  />
                  <p className="text-xs text-center mt-2 text-charcoal-500 capitalize">
                    {chart.replace('.png', '').replace(/_/g, ' ')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      {report.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5 capitalize">{report.type} Report</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400">{report.description}</p>
                <div className="flex items-center justify-between text-xs text-charcoal-500">
                  <span>Available format:</span>
                  <Badge variant="info">{report.format}</Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => downloadReport(report)} disabled={exporting === report.type}>
                    {exporting === report.type ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    {exporting === report.type ? 'Exporting...' : 'Export CSV'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => printReport(report)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}