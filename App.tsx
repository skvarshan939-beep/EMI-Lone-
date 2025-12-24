
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  FileText, 
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { calculateEMI, generateSchedule, formatCurrency } from './utils/finance';
import { LoanSummary, ScheduleEntry } from './types';

const COLORS = ['#3b82f6', '#10b981'];

const App: React.FC = () => {
  // Input states
  const [amount, setAmount] = useState<number>(50000);
  const [interest, setInterest] = useState<number>(7.5);
  const [tenure, setTenure] = useState<number>(5);

  // AI State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Derived states
  const summary = useMemo(() => calculateEMI(amount, interest, tenure), [amount, interest, tenure]);
  const schedule = useMemo(() => generateSchedule(amount, interest, tenure, summary.monthlyEmi), [amount, interest, tenure, summary.monthlyEmi]);

  const chartData = [
    { name: 'Principal Amount', value: summary.principalAmount },
    { name: 'Total Interest', value: summary.totalInterest },
  ];

  const fetchAiInsight = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this loan and provide 3 brief financial tips: Loan Amount $${amount}, Interest Rate ${interest}%, Tenure ${tenure} years. Monthly EMI is $${summary.monthlyEmi.toFixed(2)}. Focus on interest savings and affordability. Keep it concise.`,
      });
      setAiInsight(response.text || "Unable to generate insights at this time.");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setAiInsight("Unable to fetch AI insights. Check your connection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ProEMI
            </h1>
          </div>
          <button 
            onClick={fetchAiInsight}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full font-medium transition-colors disabled:opacity-50"
          >
            <Sparkles size={18} />
            {isAiLoading ? "Thinking..." : "Get AI Insights"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs & Summary Cards */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Loan Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">Loan Amount</label>
                  <span className="text-blue-600 font-bold">{formatCurrency(amount)}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="1000000" 
                  step="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>$5K</span>
                  <span>$1M</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">Interest Rate (%)</label>
                  <span className="text-blue-600 font-bold">{interest}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="25" 
                  step="0.1"
                  value={interest}
                  onChange={(e) => setInterest(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>1%</span>
                  <span>25%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">Loan Tenure (Years)</label>
                  <span className="text-blue-600 font-bold">{tenure} yrs</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>1 yr</span>
                  <span>30 yrs</span>
                </div>
              </div>
            </div>
          </section>

          {/* AI Insights Panel */}
          {aiInsight && (
            <section className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} />
                <h3 className="font-semibold">AI Loan Analysis</h3>
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed whitespace-pre-line">
                {aiInsight}
              </p>
            </section>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 gap-4">
            <MetricCard 
              label="Monthly EMI" 
              value={formatCurrency(summary.monthlyEmi)} 
              icon={<DollarSign size={20} />} 
              color="blue"
            />
            <MetricCard 
              label="Total Interest" 
              value={formatCurrency(summary.totalInterest)} 
              icon={<TrendingUp size={20} />} 
              color="emerald"
            />
            <MetricCard 
              label="Total Payable" 
              value={formatCurrency(summary.totalPayable)} 
              icon={<FileText size={20} />} 
              color="slate"
            />
          </div>
        </div>

        {/* Right Column: Visualization & Schedule */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Visual Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[350px]">
              <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
                <Info size={16} /> Breakdown of Payment
              </h3>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[350px]">
              <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
                <Calendar size={16} /> Balance Reduction Over Time
              </h3>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={schedule.filter((_, i) => i % 12 === 0 || i === schedule.length - 1)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#dbeafe" />
                </AreaChart>
              </ResponsiveContainer>
            </section>
          </div>

          {/* Amortization Schedule Table */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ChevronRight size={20} className="text-blue-600" />
                Amortization Schedule
              </h3>
              <span className="text-xs px-3 py-1 bg-slate-100 rounded-full text-slate-500 font-medium">
                {schedule.length} Months
              </span>
            </div>
            <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Year</th>
                    <th className="px-6 py-4">EMI</th>
                    <th className="px-6 py-4">Principal</th>
                    <th className="px-6 py-4">Interest</th>
                    <th className="px-6 py-4">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.map((row) => (
                    <tr key={row.month + row.year} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-400">{row.month}</td>
                      <td className="px-6 py-4 text-slate-600">{row.year}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{formatCurrency(row.emi)}</td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">+{formatCurrency(row.principal)}</td>
                      <td className="px-6 py-4 text-rose-500 font-medium">-{formatCurrency(row.interest)}</td>
                      <td className="px-6 py-4 text-slate-900 font-bold">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 py-8 border-t border-slate-200 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} ProEMI Intelligence. Designed for precision financial planning.</p>
      </footer>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'slate';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        {icon}
      </div>
    </div>
  );
};

export default App;
