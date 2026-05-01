import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Flag } from 'lucide-react';
import Badge from '../components/Badge.jsx';
import { api } from '../utils/api.js';

export default function Calendar() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api('/tasks?limit=100').then((data) => setTasks(data.items));
  }, []);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        day: date.getDate(),
        tasks: tasks.filter((task) => task.dueDate?.slice(0, 10) === key)
      };
    });
  }, [tasks]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-black uppercase text-fuchsia-300">Timeline</p>
        <h1 className="text-3xl font-black tracking-tight">Calendar</h1>
      </div>
      <section className="premium-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {days.map((day) => (
            <article key={day.key} className="min-h-44 rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-1 hover:bg-white/[0.07]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">{day.label}</p>
                  <p className="text-2xl font-black">{day.day}</p>
                </div>
                <CalendarDays size={18} className="text-cyan-300" />
              </div>
              <div className="grid gap-2">
                {day.tasks.length ? day.tasks.map((task) => (
                  <div key={task._id} className="rounded-2xl bg-slate-950/60 p-3">
                    <p className="line-clamp-1 text-sm font-black">{task.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-400"><Clock size={12} />{task.status}</p>
                  </div>
                )) : <p className="text-sm font-semibold text-slate-500">No deadlines</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {tasks.slice(0, 6).map((task) => (
          <article key={task._id} className="premium-card p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="font-black">{task.title}</h2>
              <Badge>{task.priority}</Badge>
            </div>
            <p className="flex items-center gap-2 text-sm font-bold text-slate-400"><Flag size={15} />{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
