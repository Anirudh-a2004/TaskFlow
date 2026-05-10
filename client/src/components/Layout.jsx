import { Bell, CalendarDays, KanbanSquare, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, ShieldCheck, Sun, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useState } from 'react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: KanbanSquare },
  { to: '/tasks', label: 'Kanban', icon: CalendarDays },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: 3 }, // Example badge count
  { to: '/profile', label: 'Profile', icon: Settings },
  { to: '/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggleDark, search, setSearch } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,.22),transparent_24%),radial-gradient(circle_at_85%_5%,rgba(20,184,166,.14),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(217,70,239,.12),transparent_26%)]" />

      {/* Desktop Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={{ width: 288 }}
          animate={{ width: sidebarCollapsed ? 80 : 288 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-slate-950/90 p-6 text-white shadow-2xl shadow-black/40 backdrop-blur-3xl lg:block"
        >
          {/* Logo Section */}
          <motion.div
            layout
            className="mb-10 flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-blue-500/25 ring-1 ring-white/20"
            >
              <KanbanSquare size={24} />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xl font-black tracking-tight">TaskFlow</p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">Modern team task manager</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Navigation */}
          <nav className="grid gap-2">
            {nav.filter((item) => !item.adminOnly || user?.role === 'Admin').map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.to} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-fuchsia-600/20 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-500/30'
                          : 'text-slate-400 hover:bg-white/10 hover:text-white hover:shadow-md'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active Glow Effect */}
                        {isActive && (
                          <motion.div
                            layoutId="activeGlow"
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-fuchsia-600/10 blur-xl"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}

                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          className={`relative ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}
                        >
                          <Icon size={20} />
                          {/* Notification Badge */}
                          {item.badge && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-black text-white"
                            >
                              {item.badge}
                            </motion.span>
                          )}
                        </motion.div>

                        {/* Label */}
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="truncate"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <motion.div
            layout
            className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20"
              >
                {user?.name?.[0]}
              </motion.div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-0 flex-1"
                  >
                    <p className="text-sm font-black text-white truncate">{user?.name}</p>
                    <p className="text-xs font-semibold text-slate-400 truncate">{user?.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  onClick={logout}
                  className="btn-secondary mt-4 w-full justify-center py-2 text-xs"
                >
                  <LogOut size={14} className="mr-2" />
                  Logout
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Collapse Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-slate-950/90 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-white"
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={16} />
            </motion.div>
          </motion.button>
        </motion.aside>
      </AnimatePresence>

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-2xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(true)}
                className="btn-secondary !p-3 lg:hidden"
              >
                <Menu size={18} />
              </motion.button>
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects, tasks, people..."
                  className="input pl-11"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary !p-3"
                onClick={toggleDark}
                aria-label="Toggle theme"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink to="/notifications" className="btn-secondary relative !p-3" aria-label="Notifications">
                  <Bell size={18} />
                  {/* Notification Badge */}
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-black text-white"
                  >
                    3
                  </motion.span>
                </NavLink>
              </motion.div>
              <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 shadow-xl backdrop-blur-xl sm:flex">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 text-sm font-black text-white shadow-lg shadow-blue-500/20"
                >
                  {user?.name?.[0]}
                </motion.div>
                <div>
                  <p className="text-sm font-black text-white">{user?.name}</p>
                  <p className="text-xs font-semibold text-slate-400">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="p-4 pb-28 sm:p-6 lg:pb-6"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-80 border-r border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl shadow-black/40 backdrop-blur-3xl lg:hidden"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </motion.button>

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10 flex items-center gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-blue-500/25 ring-1 ring-white/20"
                >
                  <KanbanSquare size={24} />
                </motion.div>
                <div>
                  <p className="text-xl font-black tracking-tight">TaskFlow</p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">Modern team task manager</p>
                </div>
              </motion.div>

              {/* Navigation */}
              <nav className="grid gap-2">
                {nav.filter((item) => !item.adminOnly || user?.role === 'Admin').map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <NavLink
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-fuchsia-600/20 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-500/30'
                              : 'text-slate-400 hover:bg-white/10 hover:text-white hover:shadow-md'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active Glow Effect */}
                            {isActive && (
                              <motion.div
                                layoutId="mobileActiveGlow"
                                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-fuchsia-600/10 blur-xl"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}

                            {/* Icon */}
                            <motion.div
                              whileHover={{ rotate: 5 }}
                              className={`relative ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}
                            >
                              <Icon size={20} />
                              {/* Notification Badge */}
                              {item.badge && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-black text-white"
                                >
                                  {item.badge}
                                </motion.span>
                              )}
                            </motion.div>

                            {/* Label */}
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </nav>

              {/* User Profile Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20"
                  >
                    {user?.name?.[0]}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white truncate">{user?.name}</p>
                    <p className="text-xs font-semibold text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-secondary mt-4 w-full justify-center py-2 text-xs"
                >
                  <LogOut size={14} className="mr-2" />
                  Logout
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:hidden">
        {nav.filter((item) => !item.adminOnly || user?.role === 'Admin').slice(0, 5).map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `relative grid place-items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-fuchsia-600/20 text-blue-300 shadow-lg shadow-blue-600/20 ring-1 ring-blue-500/30'
                      : 'text-slate-500 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Glow Effect */}
                    {isActive && (
                      <motion.div
                        layoutId="bottomActiveGlow"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-fuchsia-600/10 blur-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative">
                      <Icon size={18} />
                      {/* Notification Badge */}
                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-1 -top-1 grid h-3 w-3 place-items-center rounded-full bg-rose-500 text-[8px] font-black text-white"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </div>

                    {/* Label */}
                    <span className="max-w-full truncate">{item.label.split(' ')[0]}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}
