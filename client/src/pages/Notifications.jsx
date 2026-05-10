import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, MessageSquare, Sparkles, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Skeleton, { EmptyState, SkeletonStack } from '../components/Skeleton.jsx';
import { useApp } from '../context/AppContext.jsx';

const iconMap = {
  assignment: Sparkles,
  deadline: Timer,
  comment: MessageSquare,
  system: Bell
};

const filters = ['All', 'Unread', 'System'];

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, loadNotifications, markNotificationsRead } = useApp();
  const [filter, setFilter] = useState('All');
  const [openingId, setOpeningId] = useState(null);

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, []);

  const items = notifications;
  const markAllRead = () => markNotificationsRead();

  const resolveLink = (link) => {
    if (!link) return null;
    if (link.startsWith('/dashboard')) return link;
    const taskMatch = link.match(/^\/tasks\/([a-f0-9]{24})/i);
    if (taskMatch) return `/dashboard/tasks?task=${taskMatch[1]}`;
    const projectMatch = link.match(/^\/projects\/([a-f0-9]{24})/i);
    if (projectMatch) return `/dashboard/projects?project=${projectMatch[1]}`;
    if (link.startsWith('/notifications')) return '/dashboard/notifications';
    return `/dashboard${link.startsWith('/') ? '' : '/'}${link}`;
  };

  const openItem = async (item) => {
    if (!item?._id) return;
    setOpeningId(item._id);
    if (!item.read) {
      await markNotificationsRead([item._id]);
    }
    const next = resolveLink(item.link);
    if (next) navigate(next);
    window.setTimeout(() => setOpeningId(null), 350);
  };

  const visibleItems = useMemo(() => {
    if (!items) return [];
    if (filter === 'Unread') return items.filter((item) => !item.read);
    if (filter === 'System') return items.filter((item) => item.type === 'system');
    return items;
  }, [filter, items]);

  if (!items) {
    return (
      <div className="grid gap-6 sm:gap-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-fuchsia-500/10 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-8 w-56 max-w-full" />
          <Skeleton className="mt-3 h-3 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Skeleton className="h-20 rounded-[2rem] sm:w-32" />
            <Skeleton className="h-20 rounded-[2rem] sm:w-32" />
          </div>
          <Skeleton className="h-12 rounded-2xl sm:w-64" />
        </div>
        <SkeletonStack rows={5} className="premium-card p-4" />
      </div>
    );
  }

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 sm:gap-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/15 via-slate-900/80 to-fuchsia-500/15 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Signal center</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Notifications</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
              A clean activity timeline for assignments, comments, deadlines, and system updates.
            </p>
          </div>
          <button onClick={markAllRead} disabled={!unreadCount} className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            <CheckCheck size={18} />
            Mark all read
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="card group relative overflow-hidden p-4 sm:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Unread</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-white">{unreadCount}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Needs attention</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-200 ring-1 ring-white/10">
                <Bell size={18} />
              </div>
            </div>
          </div>
          <div className="card group relative overflow-hidden p-4 sm:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-indigo-500/10 opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Total</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-white">{items.length}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">All activity</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-200 ring-1 ring-white/10">
                <Sparkles size={18} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex rounded-2xl border border-white/10 bg-white/[0.055] p-1 backdrop-blur-xl">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition sm:flex-none ${
                filter === item ? 'bg-white/15 text-white shadow-lg shadow-black/10' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {visibleItems.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'All' ? 'No notifications right now' : "You're all caught up"}
          description="No alerts match this view. Your team is on track, and important updates will appear here."
        />
      ) : (
        <section className="premium-card overflow-hidden p-3 sm:p-4">
          <div className="relative grid gap-3 sm:pl-7">
            <div className="absolute left-7 top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-cyan-400/50 via-blue-400/20 to-transparent sm:block" />
            {visibleItems.map((item, index) => {
              const Icon = iconMap[item.type] || Bell;
              const isUnread = !item.read;
              return (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.045 }}
                  className={`group relative rounded-[1.5rem] border p-4 transition duration-300 sm:p-5 ${
                    isUnread
                      ? 'border-cyan-300/25 bg-white/[0.07] shadow-lg shadow-cyan-500/5'
                      : 'border-white/10 bg-white/[0.045]'
                  } hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.085]`}
                >
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className="w-full text-left"
                    aria-label={`Open notification: ${item.title}`}
                  >
                    <motion.div
                      whileTap={{ scale: 0.99 }}
                      animate={openingId === item._id ? { scale: 0.99 } : { scale: 1 }}
                      className="flex gap-4"
                    >
                    <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/25 to-fuchsia-500/25 text-cyan-200 ring-1 ring-white/10">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-black text-white">{item.title}</h2>
                          <p className={`mt-1 text-sm font-semibold leading-6 ${isUnread ? 'text-slate-200' : 'text-slate-400'}`}>{item.message}</p>
                        </div>
                        {isUnread && (
                          <motion.span
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.8)]"
                          />
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className={`pill ${isUnread ? 'bg-cyan-500/10 text-cyan-200' : 'bg-white/10 text-slate-300'}`}>{item.type || 'update'}</span>
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    </motion.div>
                  </button>
                </motion.article>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
