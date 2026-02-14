
import React from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  GlobeAltIcon,
  UserGroupIcon,
  EnvelopeIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  // Mock data for the dashboard
  const scanData = [
    { name: 'Mon', scans: 45, threats: 12 },
    { name: 'Tue', scans: 52, threats: 15 },
    { name: 'Wed', scans: 38, threats: 8 },
    { name: 'Thu', scans: 65, threats: 24 },
    { name: 'Fri', scans: 48, threats: 18 },
    { name: 'Sat', scans: 25, threats: 5 },
    { name: 'Sun', scans: 32, threats: 7 },
  ];

  const distributionData = [
    { name: 'Safe', value: 65, color: '#10b981' },
    { name: 'Suspicious', value: 20, color: '#fbbf24' },
    { name: 'Dangerous', value: 15, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Security Overview</h1>
          <p className="text-slate-400">Your real-time fraud protection metrics and historical scan analysis.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Export Report</button>
          <button className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors">Upgrade Plan</button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Scans" value="2,845" change="+12%" icon={<GlobeAltIcon className="w-6 h-6" />} color="emerald" />
        <StatCard title="Threats Blocked" value="412" change="+5%" icon={<ShieldCheckIcon className="w-6 h-6" />} color="rose" />
        <StatCard title="Protection Score" value="94/100" icon={<CommandLineIcon className="w-6 h-6" />} color="blue" />
        <StatCard title="Active Agents" value="24" icon={<UserGroupIcon className="w-6 h-6" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Traffic & Threat Trends</h3>
            <select className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-2 py-1 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScans)" strokeWidth={2} />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-lg font-bold mb-8">Threat Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-400">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent Critical Alerts</h3>
          <button className="text-sm text-emerald-500 hover:underline">View All Alerts</button>
        </div>
        <div className="divide-y divide-slate-800">
          <AlertItem 
            type="CEO Fraud" 
            source="Email" 
            target="finance@acme.com" 
            time="2 minutes ago" 
            severity="high" 
          />
          <AlertItem 
            type="Bank Smishing" 
            source="SMS" 
            target="+1 (555) 0123" 
            time="15 minutes ago" 
            severity="high" 
          />
          <AlertItem 
            type="Look-alike URL" 
            source="URL Scan" 
            target="paypa1-security.com" 
            time="1 hour ago" 
            severity="medium" 
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color }: any) => {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>{icon}</div>
        {change && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
};

const AlertItem = ({ type, source, target, time, severity }: any) => (
  <div className="p-6 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-full ${severity === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
        <ExclamationTriangleIcon className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h5 className="font-bold">{type}</h5>
          <span className="text-[10px] uppercase tracking-widest font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-400">{source}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Target: {target}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs font-medium text-slate-400">{time}</p>
      <button className="text-xs text-blue-500 font-bold mt-1 hover:underline">View Forensic Report</button>
    </div>
  </div>
);

export default Dashboard;
