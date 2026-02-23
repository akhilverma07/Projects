
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  ClockIcon, 
  QuestionMarkCircleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-900 bg-slate-950/40 backdrop-blur-2xl flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50">
            <ShieldCheckIcon className="w-6 h-6 text-emerald-950" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter leading-none block">PHISHGUARD</span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-500 uppercase leading-none mt-1 block">Advanced Security</span>
          </div>
        </div>

        <nav className="flex-1 px-5 py-8 space-y-2">
          <SidebarLink to="/" icon={<ChartBarIcon className="w-5 h-5" />} label="Security Hub" />
          <SidebarLink to="/scan" icon={<MagnifyingGlassIcon className="w-5 h-5" />} label="Live Scanner" />
          <SidebarLink to="/history" icon={<ClockIcon className="w-5 h-5" />} label="Evidence Vault" />
          <SidebarLink to="/threats" icon={<ShieldExclamationIcon className="w-5 h-5" />} label="Threat Intel" />
          <div className="pt-6 pb-2">
             <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Support</span>
          </div>
          <SidebarLink to="/help" icon={<QuestionMarkCircleIcon className="w-5 h-5" />} label="Documentation" />
        </nav>

        <div className="p-6 border-t border-slate-900/50">
          <div className="bg-slate-900/30 rounded-2xl p-5 border border-slate-800 shadow-inner group transition-all hover:bg-slate-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Threat Database v4.2</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Real-time heuristic synchronization active. All AI nodes operational.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-slate-900 flex items-center justify-between px-10 bg-slate-950/60 backdrop-blur-lg z-10">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Secure Environment</span>
                <span className="text-sm font-bold text-slate-200">PRODUCTION_GRID_ALPHA</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-xs font-black text-slate-300 mono tracking-tighter">v2.4.0-PRO</span>
             </div>
             <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-200">Admin_Terminal</p>
                  <p className="text-[10px] font-medium text-slate-500">Tier-3 Access</p>
               </div>
               <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden hover:border-emerald-500/50 transition-all ring-1 ring-transparent hover:ring-emerald-500/20">
                  <img src="https://picsum.photos/seed/cyber-user/40/40" alt="Profile" className="opacity-80 group-hover:opacity-100" />
               </button>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-0">
          {children}
        </div>
        
        {/* Modern Cyber Grid Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-emerald-500/5 via-transparent to-rose-500/5 opacity-50" />
      </main>
    </div>
  );
};

const SidebarLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
        isActive 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
          : 'text-slate-500 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
      }`
    }
  >
    <div className={`transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
      {icon}
    </div>
    <span className="font-bold tracking-tight">{label}</span>
    {label === "Live Scanner" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
  </NavLink>
);

export default Layout;
