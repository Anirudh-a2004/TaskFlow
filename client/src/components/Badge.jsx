const tones = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  Urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  Review: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
  'In Progress': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200',
  Todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Active: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  Archived: 'bg-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
};

export default function Badge({ children }) {
  return <span className={`pill ${tones[children] || tones.Medium}`}>{children}</span>;
}
