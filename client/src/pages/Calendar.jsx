import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Flag, ListChecks, TimerReset } from 'lucide-react';
import Badge from '../components/Badge.jsx';
import { api } from '../utils/api.js';

const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

export default function Calendar() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api('/tasks?limit=100').then((data) => setTasks(data.items || []));
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
        month: date.toLocaleDateString('en', { month: 'short' }),
        day: date.getDate(),
        tasks: tasks.filter((task) => task.dueDate?.slice(0, 10) === key)
      };
    });
  }, [tasks]);

  const scheduledTasks = tasks.filter((task) => task.dueDate);
  const overdueTasks = tasks.filter(isOverdue);
  const nextTasks = scheduledTasks
    .slice()
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 sm:gap-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600/15 via-slate-900/80 to-emerald-600/15 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Timeline</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Productivity calendar</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
              A two-week delivery view for deadlines, workload rhythm, and upcoming priority work.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="rounded-2xl border border-white/10 bg-white/[0.075] px-4 py-3 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Scheduled</p>
              <p className="mt-1 text-2xl font-black text-white">{scheduledTasks.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.075] px-4 py-3 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Overdue</p>
              <p className="mt-1 text-2xl font-black text-rose-300">{overdueTasks.length}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="premium-card p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {days.map((day, index) => (
            <motion.article
              key={day.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group min-h-48 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.075]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{day.label}</p>
                  <div className="mt-1 flex items-end gap-2">
                    <p className="text-3xl font-black text-white">{day.day}</p>
                    <p className="pb-1 text-xs font-bold uppercase text-slate-500">{day.month}</p>
                  </div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                  <CalendarDays size={18} />
                </div>
              </div>
              <div className="grid gap-2">
                {day.tasks.length ? (
                  day.tasks.map((task) => (
                    <div key={task._id} className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 transition hover:bg-slate-900/80">
                      <p className="line-clamp-1 text-sm font-black text-white">{task.title}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-400">
                        <Clock size={12} />
                        {task.status}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-3 py-6 text-center">
                    <TimerReset size={20} className="mx-auto text-slate-600" />
                    <p className="mt-2 text-sm font-semibold text-slate-500">No deadlines</p>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="premium-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
              <ListChecks size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Next up</p>
              <h2 className="text-xl font-black text-white">Upcoming deadlines</h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {nextTasks.length ? (
              nextTasks.map((task, index) => (
                <motion.article
                  key={task._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08]"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-black text-white">{task.title}</h3>
                    <Badge>{task.priority}</Badge>
                  </div>
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-400">
                    <Flag size={15} className={isOverdue(task) ? 'text-rose-300' : 'text-cyan-300'} />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </p>
                </motion.article>
              ))
            ) : (
              <div className="empty-state md:col-span-2">
                <p className="text-lg font-black text-white">No scheduled tasks</p>
                <p className="mt-2 text-sm text-slate-400">Add due dates to tasks to build a delivery rhythm here.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="card p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Focus</p>
          <h2 className="mt-2 text-xl font-black text-white">Workload pulse</h2>
          <div className="mt-5 grid gap-3">
            {days.slice(0, 7).map((day) => (
              <div key={day.key} className="flex items-center gap-3">
                <div className="w-14 text-xs font-black uppercase text-slate-500">{day.label}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400"
                    style={{ width: `${Math.min(day.tasks.length * 28, 100)}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-black text-white">{day.tasks.length}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </motion.div>
  );
}
