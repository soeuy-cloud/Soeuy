import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  MapPin, 
  Percent, 
  DollarSign, 
  PieChart as PieIcon, 
  ArrowUpRight,
  Globe2
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const AnalyticsView: React.FC = () => {
  const { formatCurrency } = useAccounting();

  const destinationData = [
    { destination: 'Bangkok & Central', Revenue: 4200000, Cost: 2600000, Margin: 38.1 },
    { destination: 'Phuket & Andaman', Revenue: 3800000, Cost: 2300000, Margin: 39.5 },
    { destination: 'Chiang Mai & North', Revenue: 2100000, Cost: 1250000, Margin: 40.5 },
    { destination: 'Siem Reap (Cambodia)', Revenue: 1800000, Cost: 1050000, Margin: 41.6 },
    { destination: 'Vietnam & Danang', Revenue: 1400000, Cost: 840000, Margin: 40.0 },
  ];

  const packageTypeData = [
    { name: 'Inbound FIT Tours', value: 45, color: '#d65200' },
    { name: 'MICE & Corporate', value: 30, color: '#2563eb' },
    { name: 'VIP Luxury Custom', value: 15, color: '#059669' },
    { name: 'Hotel Accommodations', value: 10, color: '#8b5cf6' },
  ];

  const monthlyMarginTrend = [
    { month: 'Mar', GrossMargin: 38.2, NetMargin: 19.4 },
    { month: 'Apr', GrossMargin: 39.0, NetMargin: 20.1 },
    { month: 'May', GrossMargin: 38.5, NetMargin: 19.8 },
    { month: 'Jun', GrossMargin: 40.2, NetMargin: 22.0 },
    { month: 'Jul', GrossMargin: 41.0, NetMargin: 23.5 },
    { month: 'Aug', GrossMargin: 40.8, NetMargin: 22.8 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Financial Analytics & Profitability Intelligence
            </h1>
            <p className="text-xs text-gray-500">
              Margin analytics by business segment, operating destination, and cost center.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-orange-100 text-[#d65200] rounded">
              FY 2026 Live Model
            </span>
          </div>
        </div>
      </div>

      {/* Top Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Average Tour Gross Margin</span>
          <div className="text-2xl font-bold text-[#d65200] mt-1">40.8%</div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +2.1% YoY
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Top Profitable Route</span>
          <div className="text-xl font-bold text-gray-900 mt-1">Siem Reap / Angkor</div>
          <span className="text-[11px] text-gray-500 mt-1">41.6% Gross Margin</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Foreign Exchange Gain (MTD)</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(115000)}</div>
          <span className="text-[11px] text-gray-500 mt-1">EUR & USD Invoicing Gain</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Operating Expense Ratio</span>
          <div className="text-2xl font-bold text-blue-900 mt-1">18.2%</div>
          <span className="text-[11px] text-gray-500 mt-1">Well within 22% target</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Revenue & Cost by Destination */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
          <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
            Revenue vs Cost by Regional Destination & Markets (USD)
          </h2>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="destination" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Revenue" fill="#d65200" name="Revenue (USD)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cost" fill="#64748b" name="Direct Cost (USD)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Revenue Share by Business Segment */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
          <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
            Revenue Share by Segment (FIT vs MICE vs Custom)
          </h2>
          <div className="h-64 mt-4 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={packageTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {packageTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Share']}
                  contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
