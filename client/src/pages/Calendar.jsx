import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid, ListChecks, TimerReset } from 'lucide-react';
import Badge from '../components/Badge.jsx';
import { api } from '../utils/api.js';

const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [mode, setMode] = useState('month'); // month | week
  const [selectedKey, setSelectedKey] = useState(() => toKey(new Date()));

  const addDays = (key, days) => {
    const base = new Date(key);
    if (Number.isNaN(base.getTime())) return key;
    const next = new Date(base);
    next.setDate(base.getDate() + days);
    return toKey(next);
  };

  useEffect(() => {
    api('/tasks?limit=100').then((data) => setTasks(data.items || []));
  }, []);

  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      const key = task.dueDate?.slice(0, 10);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    });
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const startDay = new Date(monthStart);
    startDay.setDate(monthStart.getDate() - monthStart.getDay()); // Sunday start

    return Array.from({ length: 42 }).map((_, index) => {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + index);
      const key = toKey(date);
      const inMonth = date.getMonth() === monthStart.getMonth();
      const isToday = key === toKey(new Date());
      return {
        key,
        date,
        inMonth,
        isToday,
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        month: date.toLocaleDateString('en', { month: 'short' }),
        day: date.getDate(),
        tasks: tasksByDate.get(key) || []
      };
    });
  }, [cursor, tasksByDate]);

  const weekDays = useMemo(() => {
    const base = new Date(selectedKey);
    if (Number.isNaN(base.getTime())) return [];
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay());
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = toKey(date);
      return {
        key,
        date,
        inMonth: date.getMonth() === startOfMonth(cursor).getMonth(),
        isToday: key === toKey(new Date()),
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        month: date.toLocaleDateString('en', { month: 'short' }),
        day: date.getDate(),
        tasks: tasksByDate.get(key) || []
      };
    });
  }, [selectedKey, tasksByDate, cursor]);

  const scheduledTasks = tasks.filter((task) => task.dueDate);
  const overdueTasks = tasks.filter(isOverdue);
  const nextTasks = scheduledTasks
    .slice()
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0 grid gap-6 sm:gap-8">
      <header className="relative min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600/15 via-slate-900/80 to-emerald-600/15 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Timeline</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Productivity calendar</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
              Navigate past and future dates to plan deadlines, spot workload spikes, and keep delivery predictable.
            </p>
          </div>
          <div className="min-w-0 flex flex-wrap gap-3">
            <div className="min-w-[150px] flex-1 rounded-2xl border border-white/10 bg-white/[0.075] px-4 py-3 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Scheduled</p>
              <p className="mt-1 text-2xl font-black text-white">{scheduledTasks.length}</p>
            </div>
            <div className="min-w-[150px] flex-1 rounded-2xl border border-white/10 bg-white/[0.075] px-4 py-3 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Overdue</p>
              <p className="mt-1 text-2xl font-black text-rose-300">{overdueTasks.length}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="premium-card p-3 sm:p-4">
        <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-white/10">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Planner</p>
              <h2 className="text-lg font-black text-white sm:text-xl">
                {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl border border-white/10 bg-white/[0.05] p-1">
              {[
                { id: 'month', label: 'Month', icon: LayoutGrid },
                { id: 'week', label: 'Week', icon: ListChecks }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                      mode === item.id ? 'bg-white/12 text-cyan-200 ring-1 ring-white/10' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                if (mode === 'week') {
                  const nextKey = addDays(selectedKey, -7);
                  setSelectedKey(nextKey);
                  setCursor(startOfMonth(new Date(nextKey)));
                  return;
                }
                setCursor((d) => addMonths(d, -1));
              }}
              className="btn-secondary !px-3 !py-2"
              aria-label={mode === 'week' ? 'Previous week' : 'Previous month'}
            >
              <ChevronLeft size={18} />
              Prev
            </button>
            <button
              type="button"
              onClick={() => {
                setCursor(startOfMonth(new Date()));
                setSelectedKey(toKey(new Date()));
              }}
              className="btn-secondary !px-3 !py-2"
              aria-label="Jump to current month"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode === 'week') {
                  const nextKey = addDays(selectedKey, 7);
                  setSelectedKey(nextKey);
                  setCursor(startOfMonth(new Date(nextKey)));
                  return;
                }
                setCursor((d) => addMonths(d, 1));
              }}
              className="btn-secondary !px-3 !py-2"
              aria-label={mode === 'week' ? 'Next week' : 'Next month'}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0">
            <div className={`grid gap-2 ${mode === 'month' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-7' : 'grid-cols-1 sm:grid-cols-7'}`}>
              {(mode === 'month' ? days : weekDays).map((day, index) => {
                const isSelected = day.key === selectedKey;
                const count = day.tasks.length;
                const overdue = day.tasks.filter(isOverdue).length;
                const done = day.tasks.filter((t) => t.status === 'Completed').length;

                return (
                  <motion.button
                    key={day.key}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015 }}
                    onClick={() => setSelectedKey(day.key)}
                    className={`calendar-day-card min-w-0 overflow-hidden text-left rounded-[1.25rem] border p-3 sm:p-4 transition duration-200 ${
                      isSelected ? 'border-cyan-300/40 bg-white/[0.085] shadow-2xl shadow-cyan-500/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.075] hover:border-cyan-300/25'
                    } ${day.inMonth ? '' : 'opacity-60'} ${day.isToday ? 'ring-1 ring-cyan-300/35' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{day.label}</p>
                        <div className="mt-1 flex items-end gap-2">
                          <p className="text-2xl font-black text-white">{day.day}</p>
                          <p className="pb-1 text-[10px] font-bold uppercase text-slate-500">{day.month}</p>
                        </div>
                      </div>
                      {count > 0 && (
                        <span className={`pill max-w-full shrink-0 !px-2.5 !py-1 text-xs ${overdue > 0 ? 'bg-rose-500/10 text-rose-200' : 'bg-white/10 text-slate-200'}`}>
                          {count}
                        </span>
                      )}
                    </div>
                    <div className="calendar-day-badges mt-3 grid min-w-0 gap-1.5">
                      {count === 0 ? (
                        <span className="text-xs font-semibold text-slate-500">No deadlines</span>
                      ) : (
                        <>
                          <span className="pill max-w-full !w-full justify-start bg-white/10 text-slate-200 text-xs !whitespace-normal break-words">
                            <Clock size={13} />
                            {count - done} active
                          </span>
                          {done > 0 && (
                            <span className="pill max-w-full !w-full justify-start bg-emerald-500/10 text-emerald-200 text-xs !whitespace-normal break-words">
                              {done} done
                            </span>
                          )}
                          {overdue > 0 && (
                            <span className="pill max-w-full !w-full justify-start bg-rose-500/10 text-rose-200 text-xs !whitespace-normal break-words">
                              {overdue} overdue
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <aside className="card p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Selected day</p>
            <h3 className="mt-2 text-xl font-black text-white">
              {new Date(selectedKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <div className="mt-4 grid max-h-[520px] gap-3 overflow-auto pr-1 [scrollbar-width:thin]">
              {(tasksByDate.get(selectedKey) || []).length ? (
                (tasksByDate.get(selectedKey) || [])
                  .slice()
                  .sort((a, b) => {
                    const aDone = a.status === 'Completed';
                    const bDone = b.status === 'Completed';
                    if (aDone !== bDone) return aDone ? 1 : -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                  })
                  .map((task) => (
                    <div
                      key={task._id}
                      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08] ${
                        isOverdue(task) ? 'border-rose-400/25 bg-rose-500/10' : ''
                      } ${task.status === 'Completed' ? 'border-emerald-400/20 bg-emerald-500/10' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-black text-white">{task.title}</p>
                          {task.project?.name && <p className="mt-1 truncate text-xs font-semibold text-slate-500">{task.project.name}</p>}
                        </div>
                        <span className="pill bg-white/10 text-slate-200 text-xs">{task.status}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        {task.priority && <span className="pill bg-white/10 text-slate-200 text-xs">{task.priority}</span>}
                        {task.assignee?.name && <span className="pill bg-white/10 text-slate-200 text-xs">{task.assignee.name}</span>}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center">
                  <TimerReset size={22} className="mx-auto text-slate-600" />
                  <p className="mt-2 text-sm font-semibold text-slate-500">No tasks scheduled</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">Add a due date to see items here.</p>
                </div>
              )}
            </div>
          </aside>
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
            {days.filter((day) => day.inMonth).slice(0, 7).map((day) => (
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
