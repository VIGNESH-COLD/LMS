import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// JWT interceptor
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('lms_token') || localStorage.getItem('lms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('lms_token')
      sessionStorage.removeItem('lms_user')
      localStorage.removeItem('lms_token')
      localStorage.removeItem('lms_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
}

// Courses
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  search: (keyword) => api.get(`/courses/search?keyword=${keyword}`),
  getInstructorCourses: () => api.get('/courses/instructor'),
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getModules: (courseId) => api.get(`/courses/${courseId}/modules`),
  addModule: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
  deleteModule: (moduleId) => api.delete(`/courses/modules/${moduleId}`),
  addMaterial: (moduleId, data) => api.post(`/courses/modules/${moduleId}/materials`, data),
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
  unenroll: (courseId) => api.delete(`/courses/${courseId}/enroll`),
  checkEnrollment: (courseId) => api.get(`/courses/${courseId}/enrolled`),
}

// Quizzes
export const quizAPI = {
  create: (data) => api.post('/quizzes', data),
  getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getById: (id) => api.get(`/quizzes/${id}`),
  delete: (id) => api.delete(`/quizzes/${id}`),
}

// Assignments
export const assignmentAPI = {
  create: (data) => api.post('/assignments', data),
  getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  getById: (id) => api.get(`/assignments/${id}`),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
}

// Submissions
export const submissionAPI = {
  submitQuiz: (data) => api.post('/submissions/quiz', data),
  submitAssignment: (data) => api.post('/submissions/assignment', data),
  gradeSubmission: (id, data) => api.put(`/submissions/${id}/grade`, data),
  getMySubmissions: () => api.get('/submissions/student'),
  getQuizSubmissions: (quizId) => api.get(`/submissions/quiz/${quizId}`),
  getAssignmentSubmissions: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
}

// Files
export const fileAPI = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getUrl: (fileName) => `/api/files/${fileName}`,
}

// Analytics
export const analyticsAPI = {
  getInstructorAnalytics: () => api.get('/analytics/instructor'),
  getStudentAnalytics: () => api.get('/analytics/student'),
}

// Internal Marks
export const internalMarkAPI = {
  getMyMarks: () => api.get('/internal-marks/student'),
  getByCourse: (courseId) => api.get(`/internal-marks/course/${courseId}`),
  upload: (data) => api.post('/internal-marks/upload', data),
  delete: (id) => api.delete(`/internal-marks/${id}`),
}

// Achievements
export const achievementAPI = {
  getMyAchievements: () => api.get('/achievements/student'),
  getByStudent: (studentId) => api.get(`/achievements/student/${studentId}`),
  getAllSubmissions: () => api.get('/achievements/all'),
  create: (data) => api.post('/achievements', data),
  submitAchievement: (formData) => api.post('/achievements/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id, status) => api.put(`/achievements/${id}/status`, { status }),
  delete: (id) => api.delete(`/achievements/${id}`),
}

// Events
export const eventAPI = {
  getAll: () => api.get('/events'),
  getUpcoming: () => api.get('/events/upcoming'),
  create: (data) => api.post('/events', data),
  delete: (id) => api.delete(`/events/${id}`),
}

// Announcements
export const announcementAPI = {
  getAll: () => api.get('/announcements'),
  getForRole: (role) => api.get(`/announcements/role/${role}`),
  create: (data) => api.post('/announcements', data),
  delete: (id) => api.delete(`/announcements/${id}`),
}

// Timetable
export const timetableAPI = {
  getAll: () => api.get('/timetable'),
  getByCourse: (courseId) => api.get(`/timetable/course/${courseId}`),
  getByDay: (day) => api.get(`/timetable/day/${day}`),
  getMy: () => api.get('/timetable/my'),
  getBySection: (sectionId) => api.get(`/timetable/section/${sectionId}`),
  create: (data) => api.post('/timetable', data),
  delete: (id) => api.delete(`/timetable/${id}`),
}

// Syllabus
export const syllabusAPI = {
  getByCourse: (courseId) => api.get(`/syllabus/course/${courseId}`),
  getProgress: (courseId) => api.get(`/syllabus/course/${courseId}/progress`),
  create: (data) => api.post('/syllabus', data),
  toggleComplete: (id) => api.put(`/syllabus/${id}/toggle`),
  delete: (id) => api.delete(`/syllabus/${id}`),
}

// Semester Calendar
export const semesterCalendarAPI = {
  getAll: () => api.get('/semester-calendar'),
  getUpcoming: () => api.get('/semester-calendar/upcoming'),
  create: (data) => api.post('/semester-calendar', data),
  delete: (id) => api.delete(`/semester-calendar/${id}`),
}

// Admin
export const structureAPI = {
  getDepartments: () => api.get('/admin/structure/departments'),
  createDepartment: (data) => api.post('/admin/structure/departments', data),
  deleteDepartment: (id) => api.delete(`/admin/structure/departments/${id}`),

  getClasses: (deptId) => api.get(`/admin/structure/departments/${deptId}/classes`),
  createClass: (deptId, data) => api.post(`/admin/structure/departments/${deptId}/classes`, data),
  deleteClass: (id) => api.delete(`/admin/structure/classes/${id}`),

  getSections: (classId) => api.get(`/admin/structure/classes/${classId}/sections`),
  createSection: (classId, data) => api.post(`/admin/structure/classes/${classId}/sections`, data),
  deleteSection: (id) => api.delete(`/admin/structure/sections/${id}`)
}

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  allocateCourse: (data) => api.post('/admin/allocate', data),
  enrollBulk: (data) => api.post('/admin/enroll-bulk', data),
  extendDeadline: (id, deadline) => api.put(`/admin/assignments/${id}/deadline`, { deadline }),
  getStats: () => api.get('/admin/stats'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
}

// Course Materials
export const courseMaterialAPI = {
  upload: (courseId, title, description, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('courseId', courseId)
    formData.append('title', title)
    formData.append('description', description || '')
    return api.post('/course-materials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getByCourse: (courseId) => api.get(`/course-materials/course/${courseId}`),
  getMyMaterials: () => api.get('/course-materials/instructor'),
  delete: (id) => api.delete(`/course-materials/${id}`),
  getDownloadUrl: (storedFileName) => `/api/files/${storedFileName}`,
}

// Chatbot
export const chatAPI = {
  sendMessage: (message, history) => api.post('/chat', { message, history }),
}

export default api
