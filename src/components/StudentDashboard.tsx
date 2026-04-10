import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, query, where, doc, setDoc, addDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Clock, Play, CheckCircle, Video, GraduationCap, LayoutDashboard, LogOut, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  gmeetLink?: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  progress: number;
  paid: boolean;
}

export default function StudentDashboard() {
  const { profile, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'explore' | 'my-courses'>('explore');

  useEffect(() => {
    if (!profile) return;

    const unsubscribeCourses = onSnapshot(
      collection(db, 'courses'),
      (snapshot) => {
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'courses')
    );

    const enrollQuery = query(
      collection(db, 'enrollments'),
      where('studentUid', '==', profile.uid)
    );

    const unsubscribeEnrollments = onSnapshot(
      enrollQuery,
      (snapshot) => {
        setEnrollments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment)));
        setLoading(false);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments')
    );

    return () => {
      unsubscribeCourses();
      unsubscribeEnrollments();
    };
  }, [profile]);

  const handleEnroll = async (courseId: string) => {
    if (!profile) return;
    
    // Predictable ID: studentUid + "_" + courseId
    const enrollmentId = `${profile.uid}_${courseId}`;
    
    try {
      await setDoc(doc(db, 'enrollments', enrollmentId), {
        studentUid: profile.uid,
        courseId: courseId,
        progress: 0,
        paid: false,
        enrolledAt: new Date().toISOString()
      });
      toast.success('Enrollment requested! Please complete payment to access course content.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'enrollments');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-40">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">ACT</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button 
            variant="ghost" 
            className={`w-full justify-start rounded-xl ${activeTab === 'explore' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
            onClick={() => setActiveTab('explore')}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start rounded-xl ${activeTab === 'my-courses' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
            onClick={() => setActiveTab('my-courses')}
          >
            <BookOpen className="w-5 h-5 mr-3" /> My Courses
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{profile?.displayName}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={logout}>
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Student Dashboard</h2>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                <span className="text-sm font-semibold text-emerald-600">Active</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold">
                {profile?.displayName?.[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* Welcome Section */}
          <section className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 sm:p-12 text-white">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">Welcome back, {profile?.displayName}! 👋</h1>
              <p className="text-indigo-100 text-lg mb-8 opacity-90">
                Ready to continue your learning journey? You have {enrollments.filter(e => e.paid).length} active courses.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Courses Enrolled</p>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Completed</p>
                  <p className="text-2xl font-bold">{enrollments.filter(e => e.progress === 100).length}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl -ml-24 -mb-24"></div>
          </section>

          {/* Available Courses Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">
                {activeTab === 'explore' ? 'Explore Courses' : 'My Enrolled Courses'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BookOpen className="w-4 h-4" />
                <span>
                  {activeTab === 'explore' 
                    ? `${courses.length} Courses Available` 
                    : `${enrollments.length} Courses Enrolled`}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses
                .filter(course => {
                  if (activeTab === 'my-courses') {
                    return enrollments.some(e => e.courseId === course.id);
                  }
                  return true;
                })
                .map((course) => {
                  const enrollment = enrollments.find(e => e.courseId === course.id);
                  const isEnrolled = !!enrollment;
                  const isPaid = enrollment?.paid || false;

                  return (
                    <Card key={course.id} className="group bg-white border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden flex flex-col">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={course.thumbnailUrl || `https://picsum.photos/seed/${course.id}/640/360`} 
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {isEnrolled && (
                          <div className="absolute top-4 right-4">
                            <Badge className={isPaid ? "bg-emerald-500 text-white border-none" : "bg-amber-500 text-white border-none"}>
                              {isPaid ? 'Active' : 'Payment Pending'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader className="flex-1">
                        <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-slate-500 leading-relaxed">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {isEnrolled ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-500 font-medium">Course Progress</span>
                              <span className="text-indigo-600 font-bold">{enrollment.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 transition-all duration-500" 
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                            
                            {isPaid ? (
                              <Link to={`/course/${course.id}`} className="block">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-indigo-200">
                                  <Play className="w-4 h-4 mr-2 fill-current" /> Continue Learning
                                </Button>
                              </Link>
                            ) : (
                              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Access Restricted</p>
                                  <p className="text-xs text-amber-700">Please contact admin to confirm your payment for this course.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 font-bold"
                          >
                            <CreditCard className="w-4 h-4 mr-2" /> Enroll Now
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
            {activeTab === 'my-courses' && enrollments.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">No courses enrolled yet</h4>
                <p className="text-slate-500 mb-8">Explore our catalog and start your learning journey today!</p>
                <Button onClick={() => setActiveTab('explore')} className="bg-indigo-600 text-white rounded-xl">
                  Browse Courses
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
