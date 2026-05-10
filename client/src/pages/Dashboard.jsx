import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Calendar, CalendarClock, CheckCircle2, Clock, FolderKanban, MessageSquare, TrendingUp, TriangleAlert, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton, { EmptyState, SkeletonStack } from '../components/Skeleton.jsx';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';

const cards = [
  { key: 'projects', label: 'Active Projects', icon: FolderKanban, gradient: 'from-blue-500 to-cyan-500', trend: '+2.5%' },
  { key: 'completed', label: 'Completed Tasks', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500', trend: '+12.3%' },
  { key: 'pending', label: 'Pending Work', icon: Clock, gradient: 'from-amber-500 to-orange-500', trend: '-3.1%' },
  { key: 'overdue', label: 'Overdue Items', icon: TriangleAlert, gradient: 'from-rose-500 to-red-500', trend: '-5.2%' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const rangeLabels = {
  day: 'Daily analytics',
  week: 'Weekly analytics',
  month: 'Monthly analytics'
};

const quickActions = [
  { label: 'Create Project', icon: FolderKanban, to: '/dashboard/projects#create-project' },
  { label: 'Add Task', icon: CheckCircle2, to: '/dashboard/tasks#create-task' },
  { label: 'Invite Team', icon: Users, to: '/dashboard/team#invite-member' }
];

const actionMeta = [
  {
    match: ['completed', 'task.completed'],
    label: 'completed a task',
    icon: CheckCircle2,
    tone: 'from-emerald-500 to-teal-400',
    chip: 'Task completed'
  },
  {
    match: ['project.created', 'project.restored'],
    label: 'created a project',
    icon: FolderKanban,
    tone: 'from-blue-500 to-cyan-400',
    chip: 'Project'
  },
  {
    match: ['assigned', 'member.assigned'],
    label: 'assigned a teammate',
    icon: UserPlus,
    tone: 'from-violet-500 to-fuchsia-400',
    chip: 'Assignment'
  },
  {
    match: ['deadline', 'due', 'date'],
    label: 'updated a deadline',
    icon: CalendarClock,
    tone: 'from-amber-500 to-orange-400',
    chip: 'Deadline'
  },
  {
    match: ['comment', 'message'],
    label: 'added a comment',
    icon: MessageSquare,
    tone: 'from-sky-500 to-blue-500',
    chip: 'Comment'
  },
  {
    match: ['status', 'updated', 'changed', 'role.changed'],
    label: 'changed status',
    icon: ArrowRightLeft,
    tone: 'from-indigo-500 to-violet-500',
    chip: 'Status'
  }
];

function getInitials(name = 'System') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'S';
}

function relativeTime(value) {
  const date = value ? new Date(value) : new Date();
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(date.getTime())) return 'just now';
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hr ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} day${Math.floor(diff / day) === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getActivityMeta(item) {
  const action = `${item.action || ''} ${item.detail || ''}`.toLowerCase();
  return actionMeta.find((meta) => meta.match.some((key) => action.includes(key))) || {
    label: 'updated the workspace',
    icon: TrendingUp,
    tone: 'from-cyan-500 to-blue-500',
    chip: 'Activity'
  };
}

function formatAction(action = '') {
  return action
    .replaceAll('.', ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function distributeCount(count = 0, buckets = 6) {
  return Array.from({ length: buckets }).map((_, index) => Math.floor(count / buckets) + (index < count % buckets ? 1 : 0));
}

function getProductivitySeries(productivity = [], range) {
  if (range === 'day') {
    const today = productivity.at(-1) || { created: 0, completed: 0 };
    const created = distributeCount(today.created, 6);
    const completed = distributeCount(today.completed, 6);
    return ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'].map((label, index) => ({
      label,
      created: created[index],
      completed: completed[index]
    }));
  }

  if (range === 'month') {
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, index) => {
      const slice = productivity.slice(index * 2, index * 2 + (index === 3 ? 1 : 2));
      return {
        label,
        created: slice.reduce((sum, item) => sum + (item.created || 0), 0),
        completed: slice.reduce((sum, item) => sum + (item.completed || 0), 0)
      };
    });
  }

  return productivity.map((item) => ({ ...item, label: item.day }));
}

function PremiumChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const title = label || payload[0]?.name || 'Metric';

  return (
    <div className="chart-tooltip rounded-2xl border px-4 py-3 text-xs shadow-2xl backdrop-blur-2xl">
      <p className="mb-2 font-black text-white">{title}</p>
      <div className="grid gap-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-2 font-semibold capitalize text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
              {entry.dataKey}
            </span>
            <span className="font-black text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dark } = useApp();
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const chartTheme = {
    axis: dark ? '#94a3b8' : '#64748b',
    grid: dark ? 'rgba(148,163,184,.1)' : 'rgba(100,116,139,.18)',
    tooltipBg: dark ? '#020617' : 'rgba(255,255,255,.96)',
    tooltipText: dark ? '#ffffff' : '#0f172a',
    tooltipBorder: dark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.32)',
    tooltipShadow: dark ? '0 20px 60px rgba(0,0,0,0.3)' : '0 18px 48px rgba(15,23,42,0.16)'
  };

  useEffect(() => {
    api('/dashboard').then(setData);
  }, []);

  const productivitySeries = useMemo(() => getProductivitySeries(data?.productivity || [], timeRange), [data?.productivity, timeRange]);
  const chartTotals = useMemo(() => productivitySeries.reduce(
    (totals, item) => ({
      created: totals.created + (item.created || 0),
      completed: totals.completed + (item.completed || 0)
    }),
    { created: 0, completed: 0 }
  ), [productivitySeries]);

  if (!data) {
    return (
      <div className="grid gap-6 sm:gap-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600/10 via-slate-900/75 to-fuchsia-600/10 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-3xl sm:h-16 sm:w-16" />
            <div className="grid flex-1 gap-3">
              <Skeleton className="h-5 w-56 max-w-full" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-12 w-12 rounded-3xl" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="mt-5 h-3 w-28" />
              <Skeleton className="mt-3 h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-[2rem] lg:col-span-2" />
          <Skeleton className="h-80 rounded-[2rem]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonStack rows={4} className="card p-4" />
          <SkeletonStack rows={4} className="card p-4" />
        </div>
      </div>
    );
  }

  const upcomingItems = data.calendar?.slice(0, 6) || [];
  const recentItems = data.recentActivity?.slice(0, 6) || [];
  const hasProductivity = (data.productivity || []).length > 0;
  const hasStatusCounts = (data.statusCounts || []).some((item) => item.value > 0);

  return (
    <motion.div initial="hidden" animate="show" className="grid gap-8">
      {/* Welcome Section */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-fuchsia-600/15 p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-fuchsia-500/10" />
        <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 shadow-lg shadow-blue-500/30 ring-2 ring-white/10 sm:h-16 sm:w-16"
            >
              <span className="text-xl font-black text-white sm:text-2xl">{user?.name?.[0] || 'U'}</span>
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Welcome back, {user?.name?.split(' ')[0]}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400 sm:mt-2">Ready to make an impact today?</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/projects')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 px-4 py-3 font-black text-white shadow-lg shadow-blue-600/25 transition hover:shadow-lg hover:shadow-fuchsia-600/30 sm:w-auto sm:px-6"
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={containerVariants} className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, gradient, trend }, index) => (
          <motion.article key={key} variants={cardVariants} className="group card overflow-hidden p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-3xl bg-gradient-to-br ${gradient} shadow-lg sm:h-14 sm:w-14`}>
                <Icon size={18} className="text-white sm:size-22" />
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`text-xs font-black sm:text-sm ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {trend}
              </motion.div>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:mt-4 sm:text-sm">{label}</p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="mt-2 text-2xl font-black text-white sm:mt-3 sm:text-4xl"
            >
              {data.cards[key]}
            </motion.p>
            <motion.div className="mt-3 h-1 rounded-full bg-white/10 sm:mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(data.cards[key] * 15, 100)}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                className={`h-1 rounded-full bg-gradient-to-r ${gradient}`}
              />
            </motion.div>
          </motion.article>
        ))}
      </motion.div>

      {/* Analytics Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Productivity Chart */}
        <motion.div
          variants={cardVariants}
          className="col-span-full rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-2xl sm:p-6 lg:col-span-2"
        >
          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300 sm:text-sm">Productivity</p>
              <h3 className="mt-1 text-xl font-black text-white sm:mt-2 sm:text-2xl">{rangeLabels[timeRange]}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {chartTotals.created} created / {chartTotals.completed} completed
              </p>
            </div>
            <div className="flex rounded-2xl border border-white/10 bg-white/[0.055] p-1 shadow-inner shadow-black/10">
              {['day', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  aria-pressed={timeRange === range}
                  className={`relative rounded-xl px-3 py-2 text-xs font-black uppercase transition sm:px-4 ${
                    timeRange === range ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {timeRange === range && (
                    <motion.span
                      layoutId="productivityRange"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 shadow-lg shadow-blue-600/20"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{range}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 sm:h-80 lg:h-96">
            {hasProductivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart key={timeRange} data={productivitySeries} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chartTheme.grid} />
                <XAxis
                  dataKey="label"
                  stroke={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '10px' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  stroke={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '10px' }}
                  width={30}
                />
                <Tooltip content={<PremiumChartTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.08)' }} />
                <Bar dataKey="created" fill="url(#grad1)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="url(#grad2)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={FolderKanban} title="Create your first task to get started" description="Productivity analytics will appear once your team starts creating and completing work." />
            )}
          </div>
        </motion.div>

        {/* Task Status Pie */}
        <motion.div
          variants={cardVariants}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-2xl sm:p-6"
        >
          <div className="mb-4 sm:mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300 sm:text-sm">Distribution</p>
            <h3 className="mt-1 text-xl font-black text-white sm:mt-2 sm:text-2xl">Task status</h3>
          </div>
          <div className="h-64 sm:h-80">
            {hasStatusCounts ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={data.statusCounts}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={4}
                  startAngle={90}
                  endAngle={-270}
                >
                  {['#94a3b8', '#06b6d4', '#8b5cf6', '#22c55e'].map((color) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Pie>
                <Tooltip content={<PremiumChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={CheckCircle2} title="No task status data yet" description="Status distribution fills in as tasks move through the board." />
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Upcoming Calendar */}
        <motion.div
          variants={cardVariants}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-2xl sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
            <Calendar className="text-blue-400" size={20} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-sm">Schedule</p>
              <h3 className="text-lg font-black text-white sm:text-xl">Upcoming tasks</h3>
            </div>
          </div>
          <div className="space-y-3">
            {upcomingItems.length ? upcomingItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 transition hover:bg-white/[0.08] sm:px-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.project}</p>
                </div>
                <span className="pill ml-2 flex-shrink-0 bg-cyan-500/10 text-cyan-200 text-xs">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </motion.div>
            )) : (
              <EmptyState icon={Calendar} title="You're all caught up" description="No upcoming tasks are scheduled. Add due dates to keep the week visible." />
            )}
          </div>
        </motion.div>

        <ActivityFeed items={recentItems} />
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={cardVariants}
        className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-fuchsia-600/10 p-4 shadow-2xl backdrop-blur-2xl sm:p-6"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 sm:mb-4 sm:text-sm">Quick Actions</p>
        <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.to)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.08] px-3 py-3 font-semibold text-white transition hover:bg-white/[0.12] text-sm sm:px-4 sm:text-base"
              >
                <Icon size={16} className="sm:size-18" />
                {action.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActivityFeed({ items }) {
  return (
    <motion.section
      variants={cardVariants}
      className="activity-feed relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-2xl sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/40 to-transparent" />
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            className="activity-feed-icon grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 text-fuchsia-300 ring-1 ring-white/10"
          >
            <TrendingUp size={20} />
          </motion.div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-sm">Recent Activity</p>
            <h3 className="text-lg font-black text-white sm:text-xl">Collaboration feed</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill bg-white/10 text-slate-200 text-xs">{items.length ? `${items.length} updates` : 'Quiet'}</span>
          <motion.span whileHover={{ scale: 1.04 }} className="pill bg-emerald-400/10 text-emerald-200 text-xs">
            Live
          </motion.span>
        </div>
      </div>

      {items.length ? (
        <div className="relative">
          <div className="activity-rail absolute bottom-7 left-5 top-6 w-px sm:left-6" />
          <div className="grid gap-3">
            {items.map((item, index) => {
              const actor = item.actor?.name || 'System';
              const meta = getActivityMeta(item);
              const Icon = meta.icon;
              const detail = item.detail || item.task?.title || item.project?.name || formatAction(item.action);

              return (
                <motion.article
                  key={item._id || `${item.action}-${index}`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.32 }}
                  whileHover={{ y: -3 }}
                  className="activity-item group relative grid grid-cols-[2.75rem_1fr] gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3 shadow-lg shadow-black/5 backdrop-blur-xl sm:grid-cols-[3.25rem_1fr] sm:p-4"
                >
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className={`activity-avatar grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${meta.tone} text-sm font-black shadow-lg ring-1 ring-white/20 sm:h-12 sm:w-12`}
                    >
                      {item.actor?.avatar ? (
                        <img src={item.actor.avatar} alt="" className="h-full w-full rounded-2xl object-cover" />
                      ) : (
                        getInitials(actor)
                      )}
                    </motion.div>
                    <div className="activity-badge absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-xl border border-white/20 bg-slate-950 text-white shadow-lg">
                      <Icon size={13} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-6 text-slate-400">
                          <span className="font-black text-white">{actor}</span>{' '}
                          <span className="text-slate-300">{meta.label}</span>
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-white">{detail}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{relativeTime(item.createdAt)}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="pill bg-white/10 text-xs">{meta.chip}</span>
                      {item.severity && item.severity !== 'info' && (
                        <span className={`pill text-xs ${item.severity === 'critical' ? 'bg-rose-400/10 text-rose-200' : 'bg-amber-400/10 text-amber-200'}`}>
                          {item.severity}
                        </span>
                      )}
                      <span className="hidden text-xs font-semibold text-slate-500 sm:inline">{formatAction(item.action)}</span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState icon={TrendingUp} title="No recent activity yet" description="Task completions, new projects, assignments, comments, deadline changes, and status updates will appear here." />
      )}
    </motion.section>
  );
}
