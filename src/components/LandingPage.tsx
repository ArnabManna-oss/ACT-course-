import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Users, Video, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">ACT</span>
            </div>
            <Button 
              onClick={signIn}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full font-medium transition-all duration-200"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                Next-Gen Learning Platform
              </div>
              <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
                Master Your Skills with <span className="text-indigo-600">ACT</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                The most advanced online learning platform for modern students. Private courses, live sessions, and progress tracking all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={signIn}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-7 text-lg rounded-2xl font-semibold transition-all duration-200 shadow-xl shadow-indigo-200 flex items-center gap-2"
                >
                  Start Learning Now <ArrowRight className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-4 px-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <img 
                        key={i}
                        src={`https://picsum.photos/seed/user${i}/100/100`}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        alt="User"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-500">Joined by 2,000+ students</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden border-8 border-slate-800">
                <img 
                  src="https://picsum.photos/seed/learning/1200/800"
                  alt="Platform Preview"
                  className="rounded-[1.5rem] w-full h-auto object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Video className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Live Session Starting</p>
                      <p className="text-white/60 text-sm">Advanced React Patterns • 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform is designed to provide the best learning experience with state-of-the-art features.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'Private Courses', desc: 'Secure access to exclusive course content hosted on YouTube.' },
              { icon: Video, title: 'Live GMeet Classes', desc: 'Interactive live sessions with instructors using Google Meet.' },
              { icon: ShieldCheck, title: 'Secure Payments', desc: 'Verified enrollment process ensures only paid students have access.' },
              { icon: Users, title: 'Expert Instructors', desc: 'Learn from industry leaders with years of practical experience.' },
              { icon: GraduationCap, title: 'Progress Tracking', desc: 'Track your learning journey with detailed progress analytics.' },
              { icon: ArrowRight, title: 'Future Ready', desc: 'Constant updates and new features to keep you ahead of the curve.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ACT</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 ACT Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
