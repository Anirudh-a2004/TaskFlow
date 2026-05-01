import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Clock, FolderKanban, TrendingUp, TriangleAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from '../components/Skeleton.jsx';
import { api } from '../utils/api.js';

const cards = [
  ['projects', 'Projects', FolderKanban, 'from-blue-500 to-cyan-500'],
  ['completed', 'Completed', CheckCircle2, 'from-emerald-500 to-teal-500'],
  ['pending', 'Pending', Clock, 'from-amber-500 to-orange-500'],
  ['overdue', 'Overdue', TriangleAlert, 'from-rose-500 to-red-500']
];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/dashboard').then(setData);
  }, []);

  if (!data) {
    return <div className="grid gap-5"><Skeleton className="h-28" /><Skeleton className="h-80" /></div>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-black uppercase text-fuchsia-300">Command center</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Dashboard</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([key, label, Icon, gradient], index) => (
          <motion.article key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="card overflow-hidden p-5">
            <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
              <Icon />
            </div>
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-4xl font-black">{data.cards[key]}</p>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="card min-w-0 p-5">
          <div className="mb-4 flex items-center gap-2"><TrendingUp className="text-blue-600" /><h2 className="text-xl font-black">Productivity analytics</h2></div>
          <div className="h-80 min-w-0">
            <ResponsiveContainer>
              <BarChart data={data.productivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,.18)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="created" fill="#93c5fd" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card min-w-0 p-5">
          <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-600" /><h2 className="text-xl font-black">Task status</h2></div>
          <div className="h-80 min-w-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.statusCounts} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={5}>
                  {['#94a3b8', '#06b6d4', '#8b5cf6', '#22c55e'].map((color) => <Cell key={color} fill={color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><CalendarDays className="text-blue-600" />Calendar view</h2>
          <div className="grid gap-3">
            {data.calendar.slice(0, 7).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div><p className="font-bold">{item.title}</p><p className="text-sm text-slate-400">{item.project}</p></div>
                <span className="text-sm font-black text-cyan-300">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-black">Recent activity</h2>
          <div className="grid gap-3">
            {data.recentActivity.map((item) => (
              <div key={item._id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="font-bold">{item.actor?.name} <span className="text-cyan-300">{item.action}</span></p>
                <p className="text-sm text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
