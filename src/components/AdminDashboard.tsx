import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { LogOut, Plus, Trash2, Edit, Video, Users, BookOpen, Search, Check, X, ShieldCheck, ListOrdered, UserPlus, ShieldAlert, Play } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  gmeetLink?: string;
  createdAt: any;
}

interface Lesson {
  id: string;
  title: string;
  youtubeLink: string;
  order: number;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

interface Enrollment {
  id: string;
  studentUid: string;
  courseId: string;
  progress: number;
  paid: boolean;
  enrolledAt: string;
}

export default function AdminDashboard() {
  const { profile, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newCourse, setNewCourse] = useState({ title: '', description: '', gmeetLink: '', thumbnailUrl: '' });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Lesson states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLessonsDialogOpen, setIsLessonsDialogOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', youtubeLink: '', order: 0 });

  // Admin management
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    type: 'course' | 'user' | 'lesson'; 
    id: string; 
    title: string;
    courseId?: string; // for lessons
  } | null>(null);

  useEffect(() => {
    const unsubscribeCourses = onSnapshot(
      query(collection(db, 'courses'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'courses')
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );

    const unsubscribeEnrollments = onSnapshot(
      collection(db, 'enrollments'),
      (snapshot) => {
        setEnrollments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment)));
        setLoading(false);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments')
    );

    return () => {
      unsubscribeCourses();
      unsubscribeUsers();
      unsubscribeEnrollments();
    };
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const unsubscribeLessons = onSnapshot(
        query(collection(db, 'courses', selectedCourse.id, 'lessons'), orderBy('order', 'asc')),
        (snapshot) => {
          setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson)));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, `courses/${selectedCourse.id}/lessons`)
      );
      return () => unsubscribeLessons();
    } else {
      setLessons([]);
    }
  }, [selectedCourse]);

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        thumbnailUrl: newCourse.thumbnailUrl || `https://picsum.photos/seed/${Date.now()}/640/360`,
        createdAt: new Date().toISOString()
      });
      toast.success('Course added successfully');
      setNewCourse({ title: '', description: '', gmeetLink: '', thumbnailUrl: '' });
      setIsAddDialogOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'courses');
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      const courseRef = doc(db, 'courses', editingCourse.id);
      await updateDoc(courseRef, {
        title: editingCourse.title,
        description: editingCourse.description,
        gmeetLink: editingCourse.gmeetLink || '',
        thumbnailUrl: editingCourse.thumbnailUrl
      });
      toast.success('Course updated successfully');
      setIsEditDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `courses/${editingCourse.id}`);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      toast.success('Course deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${id}`);
    }
  };

  const handleAddLesson = async () => {
    if (!selectedCourse || !newLesson.title || !newLesson.youtubeLink) {
      toast.error('Please fill in all lesson fields');
      return;
    }

    try {
      await addDoc(collection(db, 'courses', selectedCourse.id, 'lessons'), {
        ...newLesson,
        createdAt: new Date().toISOString()
      });
      toast.success('Lesson added successfully');
      setNewLesson({ title: '', youtubeLink: '', order: lessons.length + 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `courses/${selectedCourse.id}/lessons`);
    }
  };

  const handleDeleteLesson = async (lessonId: string, courseId: string) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId, 'lessons', lessonId));
      toast.success('Lesson deleted');
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}/lessons/${lessonId}`);
    }
  };

  const toggleEnrollmentPayment = async (enrollmentId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'enrollments', enrollmentId), { paid: !currentStatus });
      toast.success(`Payment status updated`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `enrollments/${enrollmentId}`);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      toast.success('User profile deleted');
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  const toggleUserRole = async (uid: string, currentRole: string) => {
    if (uid === profile?.uid) {
      toast.error('You cannot change your own role');
      return;
    }
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">ACT Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Admin Panel</p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="text-slate-500 hover:text-red-600">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs defaultValue="courses" className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
              <TabsTrigger value="courses" className="rounded-lg px-6 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <BookOpen className="w-4 h-4 mr-2" /> Courses
              </TabsTrigger>
              <TabsTrigger value="enrollments" className="rounded-lg px-6 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" /> Enrollments
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg px-6 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <ShieldAlert className="w-4 h-4 mr-2" /> User Management
              </TabsTrigger>
            </TabsList>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6">
                  <Plus className="w-4 h-4 mr-2" /> Add New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>Create a new course category.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input id="title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="e.g. Web Development Bootcamp" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Description</Label>
                    <Input id="desc" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Brief overview of the course" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gmeet">GMeet Link (Optional)</Label>
                    <Input id="gmeet" value={newCourse.gmeetLink} onChange={(e) => setNewCourse({ ...newCourse, gmeetLink: e.target.value })} placeholder="https://meet.google.com/..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="thumb">Thumbnail URL (Optional)</Label>
                    <Input id="thumb" value={newCourse.thumbnailUrl} onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCourse} className="bg-indigo-600 text-white">Save Course</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Courses Content */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="bg-white border-none shadow-sm overflow-hidden group">
                  <div className="aspect-video relative">
                    <img 
                      src={course.thumbnailUrl || `https://picsum.photos/seed/${course.id}/640/360`}
                      className="w-full h-full object-cover"
                      alt={course.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white"
                        onClick={() => {
                          setEditingCourse(course);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 rounded-full bg-red-500/90 backdrop-blur shadow-sm hover:bg-red-500"
                        onClick={() => setDeleteConfirm({ 
                          type: 'course', 
                          id: course.id, 
                          title: course.title 
                        })}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsLessonsDialogOpen(true);
                          setNewLesson({ title: '', youtubeLink: '', order: 1 });
                        }}
                      >
                        <ListOrdered className="w-4 h-4 mr-2" /> Lessons
                      </Button>
                      <Link to={`/course/${course.id}`} className="block">
                        <Button 
                          variant="outline" 
                          className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <Play className="w-4 h-4 mr-2" /> Preview
                        </Button>
                      </Link>
                    </div>
                    {course.gmeetLink && (
                      <div className="flex items-center gap-2 text-xs text-indigo-600 mt-2">
                        <Video className="w-3 h-3" />
                        <span className="truncate">{course.gmeetLink}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enrollments Content */}
          <TabsContent value="enrollments">
            <Card className="bg-white border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => {
                    const student = users.find(u => u.uid === enrollment.studentUid);
                    const course = courses.find(c => c.id === enrollment.courseId);
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="font-medium">{student?.displayName || 'Unknown'}</div>
                          <div className="text-xs text-slate-400">{student?.email}</div>
                        </TableCell>
                        <TableCell className="font-medium">{course?.title || 'Unknown Course'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600" style={{ width: `${enrollment.progress}%` }}></div>
                            </div>
                            <span className="text-xs text-slate-500">{enrollment.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.paid ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Paid</Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={enrollment.paid ? "text-amber-600" : "text-emerald-600"}
                            onClick={() => toggleEnrollmentPayment(enrollment.id, enrollment.paid)}
                          >
                            {enrollment.paid ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                            {enrollment.paid ? 'Mark Unpaid' : 'Mark Paid'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* User Management Content */}
          <TabsContent value="users">
            <Card className="bg-white border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.displayName}</TableCell>
                      <TableCell className="text-slate-500">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className={user.role === 'admin' ? 'bg-indigo-600' : ''}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600"
                          onClick={() => toggleUserRole(user.uid, user.role)}
                          disabled={user.uid === profile?.uid}
                        >
                          <ShieldAlert className="w-4 h-4 mr-1" />
                          Make {user.role === 'admin' ? 'Student' : 'Admin'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => setDeleteConfirm({ 
                            type: 'user', 
                            id: user.uid, 
                            title: user.displayName || user.email 
                          })}
                          disabled={user.uid === profile?.uid}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course details.</DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input id="edit-title" value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Input id="edit-desc" value={editingCourse.description} onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-gmeet">GMeet Link</Label>
                <Input id="edit-gmeet" value={editingCourse.gmeetLink || ''} onChange={(e) => setEditingCourse({ ...editingCourse, gmeetLink: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-thumb">Thumbnail URL</Label>
                <Input id="edit-thumb" value={editingCourse.thumbnailUrl} onChange={(e) => setEditingCourse({ ...editingCourse, thumbnailUrl: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCourse} className="bg-indigo-600 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Lessons Dialog */}
      <Dialog open={isLessonsDialogOpen} onOpenChange={setIsLessonsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Lessons: {selectedCourse?.title}</DialogTitle>
            <DialogDescription>Add and remove video lessons for this course.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Add Lesson Form */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Add New Lesson</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Lesson Title</Label>
                  <Input value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} placeholder="e.g. Introduction to React" />
                </div>
                <div className="grid gap-2">
                  <Label>YouTube Link</Label>
                  <Input value={newLesson.youtubeLink} onChange={(e) => setNewLesson({ ...newLesson, youtubeLink: e.target.value })} placeholder="https://youtube.com/..." />
                </div>
                <div className="grid gap-2">
                  <Label>Order</Label>
                  <Input type="number" value={newLesson.order} onChange={(e) => setNewLesson({ ...newLesson, order: parseInt(e.target.value) })} />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddLesson} className="w-full bg-indigo-600 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Lesson
                  </Button>
                </div>
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Current Lessons</h4>
              {lessons.length === 0 && <p className="text-center text-slate-400 py-4">No lessons added yet.</p>}
              {lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                      {lesson.order}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{lesson.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[300px]">{lesson.youtubeLink}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50" 
                    onClick={() => setDeleteConfirm({ 
                      type: 'lesson', 
                      id: lesson.id, 
                      title: lesson.title,
                      courseId: selectedCourse.id
                    })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLessonsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
              {deleteConfirm?.type === 'user' && " This will only delete their profile data, not their login account."}
              {deleteConfirm?.type === 'course' && " All lessons within this course will also be inaccessible."}
            </DialogDescription>
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-bold text-slate-900">{deleteConfirm?.title}</p>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl">Cancel</Button>
            <Button 
              variant="destructive" 
              className="rounded-xl"
              onClick={() => {
                if (!deleteConfirm) return;
                if (deleteConfirm.type === 'course') handleDeleteCourse(deleteConfirm.id);
                if (deleteConfirm.type === 'user') handleDeleteUser(deleteConfirm.id);
                if (deleteConfirm.type === 'lesson' && deleteConfirm.courseId) handleDeleteLesson(deleteConfirm.id, deleteConfirm.courseId);
              }}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
