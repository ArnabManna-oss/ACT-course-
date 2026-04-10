import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, orderBy, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Video, CheckCircle, Play, BookOpen, ChevronRight, GraduationCap, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  gmeetLink?: string;
}

interface Lesson {
  id: string;
  title: string;
  youtubeLink: string;
  order: number;
}

interface Enrollment {
  id: string;
  progress: number;
  paid: boolean;
}

export default function CoursePlayer() {
  const { courseId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // 1. Check Enrollment & Access
  useEffect(() => {
    if (!courseId || !profile) return;
    console.log('CoursePlayer: Checking enrollment for', courseId);

    const enrollmentId = `${profile.uid}_${courseId}`;
    const unsubscribe = onSnapshot(doc(db, 'enrollments', enrollmentId), (docSnap) => {
      console.log('CoursePlayer: Enrollment snapshot received', docSnap.exists());
      if (docSnap.exists()) {
        const data = docSnap.data() as Enrollment;
        setEnrollment({ id: docSnap.id, ...data });
        
        if (!data.paid && profile.role !== 'admin') {
          console.log('CoursePlayer: Access denied (unpaid)');
          setAccessDenied(true);
          setLoading(false);
        } else {
          console.log('CoursePlayer: Access granted');
          setAccessDenied(false);
        }
      } else {
        if (profile.role !== 'admin') {
          console.log('CoursePlayer: Not enrolled, redirecting');
          toast.error('You are not enrolled in this course');
          navigate('/dashboard');
        } else {
          console.log('CoursePlayer: Admin access (no enrollment)');
          setAccessDenied(false);
        }
      }
    }, (err) => {
      console.error('CoursePlayer: Enrollment error', err);
      handleFirestoreError(err, OperationType.GET, `enrollments/${enrollmentId}`);
    });

    return () => unsubscribe();
  }, [courseId, profile, navigate]);

  // 2. Fetch Course Metadata
  useEffect(() => {
    if (!courseId || !profile) return;
    if (profile.role !== 'admin' && !enrollment) return;
    if (accessDenied && profile.role !== 'admin') return;

    console.log('CoursePlayer: Fetching course metadata');
    const unsubscribe = onSnapshot(doc(db, 'courses', courseId), (docSnap) => {
      console.log('CoursePlayer: Course snapshot received', docSnap.exists());
      if (docSnap.exists()) {
        setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
        setNotFound(false);
      } else {
        setNotFound(true);
        setLoading(false);
      }
    }, (err) => {
      console.error('CoursePlayer: Course metadata error', err);
      handleFirestoreError(err, OperationType.GET, `courses/${courseId}`);
    });

    return () => unsubscribe();
  }, [courseId, accessDenied, profile, enrollment]);

  // 3. Fetch Lessons
  useEffect(() => {
    if (!courseId || !profile) return;
    if (profile.role !== 'admin' && !enrollment) return;
    if (accessDenied && profile.role !== 'admin') return;

    console.log('CoursePlayer: Fetching lessons');
    const unsubscribe = onSnapshot(
      query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc')),
      (snapshot) => {
        console.log('CoursePlayer: Lessons snapshot received', snapshot.size);
        const lessonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
        setLessons(lessonsData);
        setCurrentLesson(prev => {
          if (!prev && lessonsData.length > 0) return lessonsData[0];
          return prev;
        });
        setLoading(false);
      },
      (err) => {
        console.error('CoursePlayer: Lessons error', err);
        handleFirestoreError(err, OperationType.LIST, `courses/${courseId}/lessons`);
      }
    );

    return () => unsubscribe();
  }, [courseId, accessDenied, profile, enrollment]);

  const markCompleted = async () => {
    if (!enrollment) return;
    try {
      await updateDoc(doc(db, 'enrollments', enrollment.id), { progress: 100 });
      toast.success('Course marked as completed!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `enrollments/${enrollment.id}`);
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold">Access Restricted</h1>
          <p className="text-white/60">
            You are enrolled in this course, but your payment status is currently pending. 
            Please contact the administrator to activate your access.
          </p>
          <Button asChild className="w-full bg-white text-slate-950 hover:bg-white/90 rounded-2xl h-12 font-bold">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold">Course Not Found</h1>
          <p className="text-white/60">
            The course you are looking for does not exist or has been removed.
          </p>
          <Button asChild className="w-full bg-white text-slate-950 hover:bg-white/90 rounded-2xl h-12 font-bold">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const videoId = currentLesson ? getYoutubeId(currentLesson.youtubeLink) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <div className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-white/60 hover:text-white hover:bg-white/10 rounded-full">
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-white/10"></div>
            <div>
              <h1 className="text-sm font-semibold truncate max-w-[200px] sm:max-w-md">{course.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Progress value={enrollment?.progress || 0} className="h-1 w-24 bg-white/10" />
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{enrollment?.progress || 0}% Complete</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {course.gmeetLink && (
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-full"
                onClick={() => window.open(course.gmeetLink, '_blank')}
              >
                <Video className="w-4 h-4 mr-2" /> Join Live Class
              </Button>
            )}
            <Button 
              size="sm" 
              className="bg-white text-slate-950 hover:bg-white/90 rounded-full px-6 font-semibold"
              onClick={markCompleted}
              disabled={enrollment?.progress === 100}
            >
              {enrollment?.progress === 100 ? <CheckCircle className="w-4 h-4 mr-2" /> : null}
              {enrollment?.progress === 100 ? 'Completed' : 'Mark as Done'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-0 lg:h-[calc(100vh-64px)]">
        {/* Video Player Area */}
        <div className="lg:col-span-2 bg-black flex flex-col">
          <div className="relative aspect-video w-full bg-slate-900">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={currentLesson?.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Video className="w-10 h-10 text-white/20" />
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {lessons.length === 0 ? 'No Lessons Available' : 'Select a Lesson'}
                </h2>
                <p className="text-white/40 max-w-xs">
                  {lessons.length === 0 ? 'The instructor hasn\'t added any lessons to this course yet.' : 'Please choose a lesson from the playlist to start watching.'}
                </p>
              </div>
            )}
          </div>
          
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 border-none">
                {currentLesson ? `Lesson ${currentLesson.order}` : 'Course Overview'}
              </Badge>
              <span className="text-white/20">•</span>
              <span className="text-sm text-white/40">{lessons.length} Lessons Total</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">{currentLesson?.title || course.title}</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-white/60 leading-relaxed text-lg">
                {course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / Playlist Area */}
        <div className="bg-slate-900/30 border-l border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Course Playlist
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id}
                onClick={() => setCurrentLesson(lesson)}
                className={`p-4 rounded-xl flex gap-4 transition-all duration-200 cursor-pointer ${currentLesson?.id === lesson.id ? 'bg-indigo-500/10 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white/40">
                  {currentLesson?.id === lesson.id ? <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" /> : lesson.order}
                </div>
                <div>
                  <h4 className={`text-sm font-medium mb-1 ${currentLesson?.id === lesson.id ? 'text-indigo-400' : 'text-white/80'}`}>
                    {lesson.title}
                  </h4>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Video Lesson</p>
                </div>
              </div>
            ))}
            {lessons.length === 0 && (
              <p className="text-center text-white/20 text-sm py-10">No lessons found.</p>
            )}
          </div>
          <div className="p-6 bg-slate-900/50 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Your Progress</span>
              <span className="text-xs font-bold text-indigo-400">{enrollment?.progress || 0}%</span>
            </div>
            <Progress value={enrollment?.progress || 0} className="h-2 bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
