/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DrinkRecord } from './types';
import { DrinkCard } from './components/DrinkCard';
import { AddDrinkModal } from './components/AddDrinkModal';
import { AIAdvisor } from './components/AIAdvisor';
import { 
  Plus, 
  History, 
  BarChart3, 
  Settings as SettingsIcon,
  Coffee,
  Calendar as CalendarIcon,
  TrendingUp,
  Wallet,
  Flame,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function App() {
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'stats'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status}. ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      // You could add a toast here
    }
  };

  const handleAddRecord = async (data: any) => {
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to save: ${res.status}`);
      }
      
      await fetchRecords();
      return true;
    } catch (err) {
      console.error('Failed to add record:', err);
      alert(err instanceof Error ? err.message : 'Failed to add record');
      return false;
    }
  };

  const handleDeleteRecord = async (id: number) => {
    try {
      await fetch(`/api/records/${id}`, { method: 'DELETE' });
      fetchRecords();
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  // Statistics calculations
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const monthlyRecords = records.filter(r => 
    isWithinInterval(new Date(r.timestamp), { start: monthStart, end: monthEnd })
  );

  const totalSpent = monthlyRecords.reduce((sum, r) => sum + (r.price || 0), 0);
  const totalCalories = monthlyRecords.reduce((sum, r) => sum + (r.calories || 0), 0);
  const drinkCount = monthlyRecords.length;

  const chartData = records.slice(0, 7).reverse().map(r => ({
    name: format(new Date(r.timestamp), 'MM/dd'),
    price: r.price || 0,
    calories: r.calories || 0,
  }));

  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.tags && r.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-amber-500/30 pb-24 sm:pb-0">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 hidden md:flex flex-col">
        <div className="p-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">Daily Cup</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<History />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <NavItem 
            icon={<BarChart3 />} 
            label="Statistics" 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
          />
        </nav>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <img src="https://picsum.photos/seed/drinker/100/100" alt="User" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-sm font-bold">Conscious Drinker</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Level 12</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 z-50 flex md:hidden items-center justify-around p-4 pb-8">
        <MobileNavItem 
          icon={<LayoutDashboard />} 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <MobileNavItem 
          icon={<History />} 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
        />
        <div className="relative -top-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/40 active:scale-90 transition-transform"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
        <MobileNavItem 
          icon={<BarChart3 />} 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')} 
        />
        <MobileNavItem 
          icon={<SettingsIcon />} 
          active={false} 
          onClick={() => {}} 
        />
      </nav>

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 sm:px-8 bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="md:hidden w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Coffee className="text-white w-4 h-4" />
            </div>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-amber-500/50 rounded-2xl py-2 pl-10 pr-4 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Record Now</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Summary Cards */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard icon={<Coffee />} label="This Month" value={`${drinkCount}`} color="amber" />
                    <StatCard icon={<Wallet />} label="Spent" value={`¥${totalSpent.toFixed(0)}`} color="emerald" />
                    <StatCard icon={<Flame />} label="Calories" value={`${totalCalories}`} color="orange" className="col-span-2 sm:col-span-1" />
                  </div>

                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-black tracking-tight">Recent Records</h2>
                      <button onClick={() => setActiveTab('history')} className="text-sm text-amber-500 font-bold hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {records.slice(0, 4).map(record => (
                        <DrinkCard key={record.id} record={record} onDelete={handleDeleteRecord} />
                      ))}
                      {records.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                          <Coffee className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                          <p className="text-zinc-500 font-medium">No records yet. Start your journey today!</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-amber-500" />
                      Spending Trend
                    </h2>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 'bold' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 'bold' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                          />
                          <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={6} dot={{ r: 8, fill: '#f59e0b', strokeWidth: 4, stroke: '#fff' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>

                {/* AI Advisor Column */}
                <div className="lg:col-span-4 h-auto lg:h-[calc(100vh-12rem)] lg:sticky lg:top-28">
                  <AIAdvisor records={records} />
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black tracking-tight">History</h2>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold">
                    <CalendarIcon className="w-4 h-4 text-amber-500" />
                    {format(now, 'MMM yyyy')}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecords.map(record => (
                    <DrinkCard key={record.id} record={record} onDelete={handleDeleteRecord} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <section className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                  <h2 className="text-2xl font-black mb-8">Calorie Intake</h2>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontWeight: 'bold' }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '24px', padding: '16px' }} />
                        <Bar dataKey="calories" radius={[12, 12, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.calories > 300 ? '#ef4444' : '#f59e0b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
                  <h2 className="text-2xl font-black mb-8">Monthly Insights</h2>
                  <div className="space-y-8">
                    <InsightRow label="Daily Average" value={`¥${(totalSpent / 30).toFixed(1)}`} />
                    <InsightRow label="Highest Calorie" value={`${Math.max(...records.map(r => r.calories || 0), 0)} kcal`} />
                    <InsightRow label="Most Frequent" value={records.length > 0 ? records[0].name : 'N/A'} />
                    <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 font-bold leading-relaxed">
                          You've saved approximately ¥240 this month by brewing at home 4 times. Keep it up!
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AddDrinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddRecord} 
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactElement, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group
        ${active ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'}
      `}
    >
      <span className={`${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
        {React.cloneElement(icon, { size: 20 } as any)}
      </span>
      <span className="hidden md:block font-black text-sm uppercase tracking-wider">{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactElement, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all ${active ? 'text-amber-500' : 'text-zinc-400'}`}
    >
      {React.cloneElement(icon, { size: 28 } as any)}
    </button>
  );
}

function StatCard({ icon, label, value, color, className }: { icon: React.ReactElement, label: string, value: string, color: 'amber' | 'emerald' | 'orange', className?: string }) {
  const colors = {
    amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className={`bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm ${className}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 } as any)}
      </div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}
function InsightRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-500 font-medium">{label}</span>
      <span className="font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}
