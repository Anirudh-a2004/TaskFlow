import { useEffect, useState } from 'react';
import { Bell, CheckCheck, MessageSquare, Sparkles, Timer } from 'lucide-react';
import { api } from '../utils/api.js';

const iconMap = {
  assignment: Sparkles,
  deadline: Timer,
  comment: MessageSquare,
  system: Bell
};

export default function Notifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api('/notifications').then((data) => setItems(data.items || data.notifications || []));
  }, []);

  const markAllRead = () => setItems((current) => current.map((item) => ({ ...item, read: true })));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-fuchsia-300">Signal center</p>
          <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
        </div>
        <button onClick={markAllRead} className="btn-secondary"><CheckCheck size={18} />Mark all read</button>
      </div>
      <section className="premium-card overflow-hidden">
        {items.map((item) => {
          const Icon = iconMap[item.type] || Bell;
          return (
            <article key={item._id} className="group flex gap-4 border-b border-white/10 p-5 transition last:border-0 hover:bg-white/[0.05]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/25 to-fuchsia-500/25 text-cyan-200 ring-1 ring-white/10">
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-black">{item.title}</h2>
                  {!item.read && <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.8)]" />}
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-400">{item.message}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
