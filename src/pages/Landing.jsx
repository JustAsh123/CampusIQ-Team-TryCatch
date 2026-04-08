import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CalendarCheck, BarChart3, Shield, Zap, Users, GraduationCap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  {
    icon: Building2,
    title: 'Resource Management',
    description: 'Browse and manage campus labs, rooms, and equipment in real-time.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: CalendarCheck,
    title: 'Smart Booking',
    description: 'Book resources with intelligent conflict detection and instant confirmation.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Track peak hours, popular resources, and availability trends.',
    color: 'from-purple-500 to-pink-500',
  },
];

const stats = [
  { value: '25+', label: 'Resources' },
  { value: '99.9%', label: 'Uptime' },
  { value: '500+', label: 'Bookings/mo' },
  { value: '24/7', label: 'Access' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Top bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-surface-900 dark:text-white">
            Campus<span className="gradient-text">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="btn-secondary text-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-16 pb-24 max-w-7xl mx-auto">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-6">
            <Zap size={13} />
            Intelligent Campus Resource Management
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 dark:text-white leading-tight mb-6">
            Optimize Your{' '}
            <span className="gradient-text">Campus Resources</span>{' '}
            Effortlessly
          </h1>

          <p className="text-lg text-surface-600 dark:text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Streamline booking, track availability in real-time, and gain actionable insights 
            into resource utilization across your entire campus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Start Optimizing
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              <Shield size={18} />
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold gradient-text">{stat.value}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">
            Everything You Need
          </h2>
          <p className="text-surface-600 dark:text-surface-400 max-w-lg mx-auto">
            Powerful tools to manage every aspect of your campus resources
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className="relative bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-7 overflow-hidden group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg shadow-primary-500/10`}>
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{feature.description}</p>
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary-500" />
            <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">CampusIQ</span>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-500">
            © {new Date().getFullYear()} Campus Resource Optimizer. Built by Team TryCatch.
          </p>
        </div>
      </footer>
    </div>
  );
}
