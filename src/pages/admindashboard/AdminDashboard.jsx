import { useMemo, useState, useEffect, useRef } from "react"
import { mockData as initialMockData } from "../../data/mockData"
import { facultiesApi, departmentsApi, teachersApi, reviewsApi, uploadApi } from "../../lib/api"
import FacultiesTable from "./FacultiesTable"
import DepartamentTable from "./DepartamentTable"
import TeachersTable from "./TeachersTable"
import CommentsTable from "./CommentsTable"
import AboutUsjsx from "./AboutUs"
// QRCode modal removed; QR is shown on public teacher cards instead.
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Info,
  LogOut,
  Menu,
  Moon,
  Sun,
  Plus,
  X,
  Eye,
  Pencil,
  Trash2,
  Search,
  GraduationCap,
  Landmark,
  CheckCircle2,
  Download,
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import * as XLSX from "xlsx"

const SCORE_FIELDS = [
  { key: "overall", label: "Umumiy" },
  { key: "knowledge", label: "Kasbiy kompetensiya" },
  { key: "teaching", label: "O'qitish samaradorligi" },
  { key: "communication", label: "Muloqot madaniyati" },
  { key: "engagement", label: "Talabalarga munosabati" },
]

const createInitialTeacherForm = () => ({
  fullName: "",
  position: "",
  phone: "",
  email: "",
  bio: "",
  departmentId: "",
  department: "",
})

const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", "")
}

const calculateTeacherMetrics = (teacherId, reviews) => {
  const teacherReviews = reviews.filter((review) => Number(review.teacherId) === Number(teacherId))
  if (!teacherReviews.length) {
    return {
      total: 0,
      overall: 0,
      averages: SCORE_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: 0 }), {}),
    }
  }

  const totals = SCORE_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: 0 }), {})
  teacherReviews.forEach((review) => {
    SCORE_FIELDS.forEach(({ key }) => {
      totals[key] += review.scores?.[key] ?? review.rating ?? 0
    })
  })

  const averages = SCORE_FIELDS.reduce((acc, { key }) => {
    acc[key] = Number((totals[key] / teacherReviews.length).toFixed(1))
    return acc
  }, {})

  return {
    total: teacherReviews.length,
    overall: averages.overall ?? 0,
    averages,
  }
}

export default function AdminDashboard({ onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState("faculties")
  const [activeNavItem, setActiveNavItem] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminTheme")
      return saved ? saved === "dark" : true
    }
    return true
  })
  const [facultyForm, setFacultyForm] = useState({ nameUz: "", nameRu: "" })
  const [showFacultyForm, setShowFacultyForm] = useState(false)
  const [editingFacultyId, setEditingFacultyId] = useState(null)
  const [viewFaculty, setViewFaculty] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [showDeleteTeacherConfirm, setShowDeleteTeacherConfirm] = useState(false)
  const [deleteTeacherId, setDeleteTeacherId] = useState(null)
  const [deleteTeacherName, setDeleteTeacherName] = useState("")
  const [teacherForm, setTeacherForm] = useState(createInitialTeacherForm)
  const [imagePreview, setImagePreview] = useState(null)
  const [teacherImageFile, setTeacherImageFile] = useState(null)
  const [editingTeacherId, setEditingTeacherId] = useState(null)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [viewTeacher, setViewTeacher] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [reviews, setReviews] = useState([])
  const [faculties, setFaculties] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("")
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("")
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("")
  const [showDepartmentForm, setShowDepartmentForm] = useState(false)
  const [editingDepartmentId, setEditingDepartmentId] = useState(null)
  const [showDeleteDepartmentConfirm, setShowDeleteDepartmentConfirm] = useState(false)
  const [deleteDepartmentId, setDeleteDepartmentId] = useState(null)
  const [viewDepartment, setViewDepartment] = useState(null)
  const [departmentForm, setDepartmentFormState] = useState({
    nameUz: "",
    nameRu: "",
    facultyId: "",
  })
  const [showDeleteReviewConfirm, setShowDeleteReviewConfirm] = useState(false)
  const [deleteReviewId, setDeleteReviewId] = useState(null)
  const [viewReview, setViewReview] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const successTimeoutRef = useRef(null)
  const [createdTeacherLink, setCreatedTeacherLink] = useState("")

  const loadMockData = () => {
    // No longer read mock data from localStorage (prevents stale cached demo data).
    return initialMockData
  }

  const saveMockData = (updater) => {
    // Intentionally no-op: we don't persist mock data anymore.
    void updater
  }

  // Prevent body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen =
      showFacultyForm ||
      viewFaculty ||
      showDeleteConfirm ||
      showDeleteTeacherConfirm ||
      showTeacherModal ||
      viewTeacher ||
      showDepartmentForm ||
      showDeleteDepartmentConfirm ||
      viewDepartment ||
      showDeleteReviewConfirm ||
      viewReview

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [
    showFacultyForm,
    viewFaculty,
    showDeleteConfirm,
    showDeleteTeacherConfirm,
    showTeacherModal,
    viewTeacher,
    showDepartmentForm,
    showDeleteDepartmentConfirm,
    viewDepartment,
    showDeleteReviewConfirm,
      viewReview,
  ])

  const fetchData = async () => {
    setIsLoadingData(true)
    const fallback = loadMockData()
    try {
      const [facultiesRes, departmentsRes, teachersRes, reviewsRes] = await Promise.allSettled([
        facultiesApi.getAll(),
        departmentsApi.getAll(),
        teachersApi.getAll(),
        reviewsApi.getAll(),
      ])
      setFaculties(
        facultiesRes.status === "fulfilled" && Array.isArray(facultiesRes.value)
          ? facultiesRes.value
          : Array.isArray(fallback.faculties) ? fallback.faculties : [],
      )
      setDepartments(
        departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value)
          ? departmentsRes.value
          : Array.isArray(fallback.departments) ? fallback.departments : [],
      )
      setTeachers(
        teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value)
          ? teachersRes.value
          : Array.isArray(fallback.teachers) ? fallback.teachers : [],
      )
      setReviews(
        reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value)
          ? reviewsRes.value
          : Array.isArray(fallback.reviews) ? fallback.reviews : [],
      )
      // API dan ma'lumot kelsa, eski keshlangan mockData ni tozalash
      const fromApi =
        (facultiesRes.status === "fulfilled" && Array.isArray(facultiesRes.value)) ||
        (departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value)) ||
        (teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value)) ||
        (reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value))
      if (fromApi && typeof window !== "undefined") {
        try {
          window.localStorage.removeItem("mockData")
        } catch (_) {}
      }
    } catch (e) {
      setFaculties(Array.isArray(fallback.faculties) ? fallback.faculties : [])
      setDepartments(Array.isArray(fallback.departments) ? fallback.departments : [])
      setTeachers(Array.isArray(fallback.teachers) ? fallback.teachers : [])
      setReviews(Array.isArray(fallback.reviews) ? fallback.reviews : [])
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const showSuccess = (message) => {
    setSuccessMessage(message)
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
    }
    successTimeoutRef.current = setTimeout(() => {
      setSuccessMessage("")
      successTimeoutRef.current = null
    }, 2500)
  }

  const resetTeacherForm = () => {
    const initialForm = createInitialTeacherForm()
    
    setTeacherForm(initialForm)
    setImagePreview(null)
    setTeacherImageFile(null)
    setEditingTeacherId(null)
    setShowTeacherModal(false)
  }


  // const persistData = (updatedTeachers, updatedReviews = reviews) => {
  //   mockData.teachers = updatedTeachers
  //   mockData.reviews = updatedReviews
  //   localStorage.setItem(
  //     "mockData",
  //     JSON.stringify({
  //       ...mockData,
  //       teachers: updatedTeachers,
  //       reviews: updatedReviews,
  //     }),
  //   )
  // }


  const handleDownloadStatistics = () => {
    const data = teachers.map((teacher) => {
      const department = departments.find((d) => d.id === Number(teacher.departmentId))
      const faculty = department ? faculties.find((f) => f.id === Number(department.facultyId)) : null
      const metrics = calculateTeacherMetrics(teacher.id, reviews)
      
      return {
        "Fakultet": faculty ? faculty.nameUz : "Noma'lum",
        "Kafedra": department ? department.nameUz : "Noma'lum",
        "F.I.O": teacher.name,
        "Tel_raqam": teacher.phone || "",
        "Rayting": metrics.overall,
        "Sharhlar soni": metrics.total
      }
    })

    // Ma'lumotlarni saralash: Fakultet -> Kafedra -> F.I.O
    data.sort((a, b) => {
      if (a["Fakultet"] !== b["Fakultet"]) return a["Fakultet"].localeCompare(b["Fakultet"])
      if (a["Kafedra"] !== b["Kafedra"]) return a["Kafedra"].localeCompare(b["Kafedra"])
      return a["F.I.O"].localeCompare(b["F.I.O"])
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // Ustunlar kengligini sozlash
    const wscols = [
      { wch: 30 }, // Fakultet
      { wch: 30 }, // Kafedra
      { wch: 30 }, // F.I.O
      { wch: 20 }, // Tel_raqam
      { wch: 10 }, // Rayting
      { wch: 15 }  // Sharhlar soni
    ]
    worksheet['!cols'] = wscols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistika")
    XLSX.writeFile(workbook, "Statistika.xlsx")
  }

  const stats = useMemo(() => {
    const activeReviews = reviews.filter((r) => r.isActive)
    const avg =
      activeReviews.length > 0
        ? (
            activeReviews.reduce(
              (sum, review) => sum + (review.scores?.overall ?? review.rating ?? 0),
              0,
            ) / activeReviews.length
          ).toFixed(1)
        : "0.0"

    return {
      faculties: faculties.length,
      departments: departments.length,
      teachers: teachers.length,
      reviews: activeReviews.length,
      avgRating: avg,
    }
  }, [teachers.length, reviews, faculties.length, departments.length])

  // Chart data for Pie Chart - Rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((review) => {
      const rating = Math.round(review.scores?.overall ?? review.rating ?? 0)
      if (rating >= 1 && rating <= 5) {
        distribution[rating] = (distribution[rating] || 0) + 1
      }
    })
    return [
      { name: "1 yulduz", value: distribution[1], color: "#ef4444" },
      { name: "2 yulduz", value: distribution[2], color: "#f97316" },
      { name: "3 yulduz", value: distribution[3], color: "#eab308" },
      { name: "4 yulduz", value: distribution[4], color: "#22c55e" },
      { name: "5 yulduz", value: distribution[5], color: "#00d4aa" },
    ]
  }, [reviews])

  // Chart data for Bar Chart - Teachers by department
  const teachersByDepartment = useMemo(() => {
    const deptCount = {}
    teachers.forEach((teacher) => {
      const deptName = teacher.department || "Noma'lum"
      deptCount[deptName] = (deptCount[deptName] || 0) + 1
    })
    return Object.entries(deptCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 departments
  }, [teachers])

  // Chart data for Bar Chart - Average ratings by category
  const ratingsByCategory = useMemo(() => {
    if (reviews.length === 0) return []
    const categoryTotals = SCORE_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: { sum: 0, count: 0 } }), {})
    
    reviews.forEach((review) => {
      SCORE_FIELDS.forEach(({ key }) => {
        const score = review.scores?.[key] ?? (key === "overall" ? review.rating : 0)
        if (score > 0) {
          categoryTotals[key].sum += score
          categoryTotals[key].count += 1
        }
      })
    })

    return SCORE_FIELDS.map(({ key, label }) => ({
      name: label,
      rating: categoryTotals[key].count > 0 
        ? Number((categoryTotals[key].sum / categoryTotals[key].count).toFixed(1))
        : 0,
    }))
  }, [reviews])

  const handleAddFaculty = async (event) => {
    event.preventDefault()
    if (!facultyForm.nameUz || !facultyForm.nameRu) {
      alert("Iltimos, barcha maydonlarni to'ldiring")
      return
    }

    try {
      const body = { nameUz: facultyForm.nameUz, nameRu: facultyForm.nameRu }
      if (editingFacultyId) {
        await facultiesApi.update(editingFacultyId, body)
        showSuccess("Fakultet muvaffaqiyatli yangilandi")
      } else {
        await facultiesApi.save(body)
        showSuccess("Fakultet muvaffaqiyatli qo'shildi")
      }
      setFacultyForm({ nameUz: "", nameRu: "" })
      setEditingFacultyId(null)
      setShowFacultyForm(false)
      fetchData()
    } catch (error) {
      console.error("Error saving faculty:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    }
  }

  const handleEditFaculty = (faculty) => {
    setFacultyForm({ nameUz: faculty.nameUz, nameRu: faculty.nameRu })
    setEditingFacultyId(faculty.id)
    setShowFacultyForm(true)
  }

  const handleDeleteFaculty = (facultyId) => {
    setDeleteConfirmId(facultyId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteFaculty = async () => {
    if (!deleteConfirmId) return

    try {
      await facultiesApi.delete(deleteConfirmId)
      setFaculties((prev) => prev.filter((f) => f.id !== deleteConfirmId))
      showSuccess("Fakultet muvaffaqiyatli o'chirildi")

      if (editingFacultyId === deleteConfirmId) {
        setFacultyForm({ nameUz: "", nameRu: "" })
        setEditingFacultyId(null)
        setShowFacultyForm(false)
      }
    } catch (error) {
      console.error("Error deleting faculty:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    } finally {
      setShowDeleteConfirm(false)
      setDeleteConfirmId(null)
    }
  }

  const cancelDeleteFaculty = () => {
    setShowDeleteConfirm(false)
    setDeleteConfirmId(null)
  }

  const handleViewFaculty = (faculty) => {
    setViewFaculty(faculty)
  }

  const handleViewTeacher = (teacher) => {
    setViewTeacher(teacher)
  }

  const handleAddDepartment = async (event) => {
    event.preventDefault()
    if (!departmentForm.nameUz || !departmentForm.nameRu || !departmentForm.facultyId) {
      alert("Iltimos, barcha maydonlarni to'ldiring")
      return
    }

    try {
      const body = {
        facultyId: Number.parseInt(departmentForm.facultyId),
        nameUz: departmentForm.nameUz,
        nameRu: departmentForm.nameRu,
      }
      if (editingDepartmentId) {
        await departmentsApi.update(editingDepartmentId, body)
        showSuccess("Kafedra muvaffaqiyatli yangilandi")
      } else {
        await departmentsApi.save(body)
        showSuccess("Kafedra muvaffaqiyatli qo'shildi")
      }
      setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
      setEditingDepartmentId(null)
      setShowDepartmentForm(false)
      fetchData()
    } catch (error) {
      console.error("Error saving department:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    }
  }

  const handleViewDepartment = (department, faculty) => {
    setViewDepartment({
      ...department,
      facultyName: faculty ? faculty.nameUz : "",
    })
  }

  const handleEditDepartment = (department) => {
    setDepartmentFormState({
      nameUz: department.nameUz,
      nameRu: department.nameRu,
      facultyId: String(department.facultyId),
    })
    setEditingDepartmentId(department.id)
    setShowDepartmentForm(true)
  }

  const handleDeleteDepartment = (departmentId) => {
    setDeleteDepartmentId(departmentId)
    setShowDeleteDepartmentConfirm(true)
  }

  const confirmDeleteDepartment = async () => {
    if (!deleteDepartmentId) return
    try {
      await departmentsApi.delete(deleteDepartmentId)
      setDepartments((prev) => prev.filter((d) => d.id !== deleteDepartmentId))
      showSuccess("Kafedra muvaffaqiyatli o'chirildi")
    } catch (error) {
      console.error("Error deleting department:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    } finally {
      setShowDeleteDepartmentConfirm(false)
      setDeleteDepartmentId(null)
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null

    if (!file) {
      setTeacherImageFile(null)
      setImagePreview(null)
      return
    }

    setTeacherImageFile(file)

    setImagePreview(URL.createObjectURL(file))
  }

  const handleAddOrUpdateTeacher = async (event) => {
    event.preventDefault()
    
    if (
      !teacherForm.fullName ||
      !teacherForm.position ||
      !teacherForm.departmentId ||
      !teacherForm.email ||
      (!imagePreview && !teacherImageFile)
    ) {
      alert(
        "Iltimos, barcha majburiy maydonlarni to'ldiring: F.I.Sh, Lavozim, Kafedra, E-pochta va Rasm",
      )
      return
    }

    try {
      const formData = new FormData()

      formData.append("fullName", teacherForm.fullName)
      formData.append("position", teacherForm.position || "O'qituvchi")
      formData.append("phone", teacherForm.phone || "")
      formData.append("email", teacherForm.email)
      formData.append("bio", teacherForm.bio || "")
      formData.append("departmentId", String(Number.parseInt(teacherForm.departmentId)))

      if (teacherImageFile) {
        formData.append("image", teacherImageFile)
      }
      if (editingTeacherId) {
        await teachersApi.update(editingTeacherId, formData)
        showSuccess("O'qituvchi ma'lumotlari muvaffaqiyatli yangilandi")
      } else {
        const created = await teachersApi.save(formData)
        const createdId =
          created?.id ??
          created?.data?.id ??
          created?.content?.id ??
          created?.teacher?.id ??
          created?.data?.teacher?.id ??
          null

        if (!createdId) {
          throw new Error("O'qituvchi qo'shildi, lekin server id qaytarmadi")
        }

        const teacherLink = `https://feedback.urspi.uz/teacher/${createdId}`

        setCreatedTeacherLink(teacherLink)

        const dept = departments.find((d) => Number(d.id) === Number(teacherForm.departmentId))
        const optimistic = {
          id: createdId,
          fullName: teacherForm.fullName,
          name: teacherForm.fullName,
          position: teacherForm.position,
          title: teacherForm.position,
          phone: teacherForm.phone,
          email: teacherForm.email,
          bio: teacherForm.bio,
          departmentId: teacherForm.departmentId,
          department: dept ? dept.nameUz : "",
          qrData: teacherLink,
          image: imagePreview || null,
        }
        setTeachers((prev) => {
          const exists = prev.some((t) => Number(t.id) === Number(createdId))
          return exists ? prev : [optimistic, ...prev]
        })
        showSuccess("O'qituvchi muvaffaqiyatli qo'shildi")
      }
      resetTeacherForm()
      setShowTeacherModal(false)
      fetchData()
    } catch (error) {
      console.error("Error saving teacher:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    }
  }

  const handleEditTeacher = (teacher) => {
    setActiveTab("teachers")
    setEditingTeacherId(teacher.id)
    setTeacherForm({
      fullName: teacher.fullName || teacher.name || "",
      position: teacher.position || teacher.title || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      bio: teacher.bio || "",
      departmentId: teacher.departmentId ? String(teacher.departmentId) : "",
      department: teacher.department,
    })
    setImagePreview(teacher.image || null)
    setTeacherImageFile(null)
    setShowTeacherModal(true)
  }

  const handleDeleteTeacher = (teacherId) => {
    const teacher = teachers.find((t) => Number(t.id) === Number(teacherId))
    if (teacher) {
      setDeleteTeacherId(teacherId)
      setDeleteTeacherName(teacher.fullName || teacher.name || "")
      setShowDeleteTeacherConfirm(true)
    }
  }

  const confirmDeleteTeacher = async () => {
    if (!deleteTeacherId) return

    try {
      await teachersApi.delete(deleteTeacherId)
      setTeachers((prev) => prev.filter((t) => Number(t.id) !== Number(deleteTeacherId)))
      setReviews((prev) => prev.filter((r) => Number(r.teacherId) !== Number(deleteTeacherId)))
      showSuccess("O'qituvchi muvaffaqiyatli o'chirildi")

      if (editingTeacherId && Number(editingTeacherId) === Number(deleteTeacherId)) {
        resetTeacherForm()
      }
    } catch (error) {
      console.error("Error deleting teacher:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    } finally {
      setShowDeleteTeacherConfirm(false)
      setDeleteTeacherId(null)
      setDeleteTeacherName("")
    }
  }

  const cancelDeleteTeacher = () => {
    setShowDeleteTeacherConfirm(false)
    setDeleteTeacherId(null)
    setDeleteTeacherName("")
  }

  const handleDeleteReview = (reviewId) => {
    setDeleteReviewId(reviewId)
    setShowDeleteReviewConfirm(true)
  }

  const confirmDeleteReview = async () => {
    if (!deleteReviewId) return

    try {
      await reviewsApi.delete(deleteReviewId)
      setReviews((prev) => prev.filter((r) => r.id !== deleteReviewId))
      showSuccess("Sharh muvaffaqiyatli o'chirildi")
    } catch (error) {
      console.error("Error deleting review:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    } finally {
      setShowDeleteReviewConfirm(false)
      setDeleteReviewId(null)
    }
  }

  const cancelDeleteReview = () => {
    setShowDeleteReviewConfirm(false)
    setDeleteReviewId(null)
  }

  const handleViewReview = (review) => {
    setViewReview(review)
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "categories", label: "Fakultetlar", icon: Landmark },
    { id: "departments", label: "Kafedralar", icon: GraduationCap },
    { id: "doctors", label: "O'qituvchilar", icon: Users },
    { id: "news", label: "Sharhlar", icon: FileText },
    { id: "about", label: "Biz haqimizda", icon: Info },
  ]

  const handleNavClick = (itemId) => {
    setActiveNavItem(itemId)
    if (itemId === "doctors" || itemId === "dashboard" || itemId === "categories") {
      if (itemId === "doctors") {
        setActiveTab("teachers")
      } else {
        setActiveTab("faculties")
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem("adminTheme", newTheme ? "dark" : "light")
      document.documentElement.classList.toggle("dark", newTheme)
    }
  }

  // Apply theme on mount and add modal animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", isDarkMode)
      
      // Add modal animations CSS
      const styleId = 'modal-animations'
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `
          @keyframes fadeIn {
            from {
              opacity: 0;
              background-color: rgba(0, 0, 0, 0);
            }
            to {
              opacity: 1;
              background-color: rgba(0, 0, 0, 0.5);
            }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `
        document.head.appendChild(style)
      }
    }
  }, [isDarkMode])

  const handleToggleReviewStatus = async (reviewId, newStatus) => {
    try {
      const updated = reviews.map((r) => (r.id === reviewId ? { ...r, isActive: newStatus } : r))
      setReviews(updated)
      saveMockData((current) => ({ ...current, reviews: updated }))
      showSuccess(`Sharh statusi ${newStatus ? "Faol" : "Faol emas"} holatiga o'zgartirildi`)
    } catch (error) {
      console.error("Error updating review status:", error)
      alert("Xatolik yuz berdi")
    }
  }

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? "bg-[#0e1a22]" : "bg-slate-50"}`}
    >
      {/* QR modal removed */}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } ${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border-r transition-all duration-500 flex flex-col fixed h-full z-40`}
      >
        {/* Logo Section */}
        <div
          className={`p-4 border-b transition-colors duration-300 ${isDarkMode ? "border-[#1a2d3a]" : "border-slate-200"}`}
        >
          <div className="flex items-center gap-3">

            {sidebarOpen && (
              <div>
                <h2
                  className={`font-semibold text-sm transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                      UrSPI Admin
                </h2>
                <p
                  className={`text-xs transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}
                >
                  Admin Panel
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeNavItem === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#00d4aa] text-white shadow-lg"
                        : isDarkMode
                          ? "text-[#8b9ba8] hover:bg-[#1a2d3a] hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Success toast */}
        {successMessage && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none">
            <div
              className={`mt-6 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border pointer-events-auto ${
                isDarkMode
                  ? "bg-[#14232c] border-[#1a2d3a] text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-sm font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Top Navbar */}
        <header
          className={`${isDarkMode ? "bg-[#0e1a22] border-[#14232c]" : "bg-white border-slate-200"} border-b px-6 py-4 transition-colors duration-300`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1
                  className={`text-xl font-semibold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className={`transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                title={isDarkMode ? "Kunduzi rejim" : "Tungi rejim"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  admin
                </p>
                <p
                  className={`text-xs transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}
                >
                  Superuser
                </p>
              </div>
              <button
                onClick={onLogout}
                className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                title="Chiqish"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ${isDarkMode ? "bg-[#0e1a22]" : "bg-slate-50"}`}
        >
          <div className="max-w-7xl mx-auto">

            {activeNavItem === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Fakultetlar
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                >
                  {stats.faculties}
                </p>
              </div>
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Kafedralar
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-green-400" : "text-green-600"}`}
                >
                  {stats.departments}
                </p>
              </div>
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  O'qituvchilar
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
                >
                  {stats.teachers}
                </p>
              </div>
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Sharhlar
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}
                >
                  {stats.reviews}
                </p>
              </div>
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  O'rt. Reyting
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                >
                  {stats.avgRating}
                </p>
              </div>
            </div>
            )}

            {/* Charts Section */}
            {activeNavItem === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart - Rating Distribution */}
                <div
                  className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Reytinglar Taqsimoti
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ratingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#14232c" : "#fff",
                          border: isDarkMode ? "1px solid #1a2d3a" : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: isDarkMode ? "#fff" : "#000",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: isDarkMode ? "#fff" : "#000",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart - Ratings by Category */}
                <div
                  className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Kategoriyalar Bo'yicha O'rtacha Reytinglar
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1a2d3a" : "#e2e8f0"} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: isDarkMode ? "#8b9ba8" : "#64748b", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        domain={[0, 5]}
                        tick={{ fill: isDarkMode ? "#8b9ba8" : "#64748b", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#14232c" : "#fff",
                          border: isDarkMode ? "1px solid #1a2d3a" : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: isDarkMode ? "#fff" : "#000",
                        }}
                      />
                      <Bar dataKey="rating" fill="#00d4aa" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeNavItem === "categories" && (
              <FacultiesTable
                isDarkMode={isDarkMode}
                faculties={faculties}
                facultyForm={facultyForm}
                editingFacultyId={editingFacultyId}
                showFacultyForm={showFacultyForm}
                viewFaculty={viewFaculty}
                showDeleteConfirm={showDeleteConfirm}
                setFacultyForm={setFacultyForm}
                setEditingFacultyId={setEditingFacultyId}
                setShowFacultyForm={setShowFacultyForm}
                setViewFaculty={setViewFaculty}
                handleAddFaculty={handleAddFaculty}
                handleEditFaculty={handleEditFaculty}
                handleDeleteFaculty={handleDeleteFaculty}
                handleViewFaculty={handleViewFaculty}
                confirmDeleteFaculty={confirmDeleteFaculty}
                cancelDeleteFaculty={cancelDeleteFaculty}
              />
            )}

            {activeNavItem === "departments" && (
              <DepartamentTable
                isDarkMode={isDarkMode}
                faculties={faculties}
                departments={departments}
                departmentForm={departmentForm}
                editingDepartmentId={editingDepartmentId}
                showDepartmentForm={showDepartmentForm}
                viewDepartment={viewDepartment}
                showDeleteDepartmentConfirm={showDeleteDepartmentConfirm}
                departmentSearchQuery={departmentSearchQuery}
                departmentSearchTerm={departmentSearchTerm}
                setDepartmentFormState={setDepartmentFormState}
                setShowDepartmentForm={setShowDepartmentForm}
                setViewDepartment={setViewDepartment}
                setDepartmentSearchQuery={setDepartmentSearchQuery}
                setDepartmentSearchTerm={setDepartmentSearchTerm}
                setShowDeleteDepartmentConfirm={setShowDeleteDepartmentConfirm}
                setDeleteDepartmentId={setDeleteDepartmentId}
                handleAddDepartment={handleAddDepartment}
                handleViewDepartment={handleViewDepartment}
                handleEditDepartment={handleEditDepartment}
                handleDeleteDepartment={handleDeleteDepartment}
                confirmDeleteDepartment={confirmDeleteDepartment}
              />
            )}

          {activeNavItem === "doctors" && (
            <TeachersTable
              isDarkMode={isDarkMode}
              teachers={teachers}
              reviews={reviews}
              departments={departments}
              teacherForm={teacherForm}
              editingTeacherId={editingTeacherId}
              showTeacherModal={showTeacherModal}
              viewTeacher={viewTeacher}
              showDeleteTeacherConfirm={showDeleteTeacherConfirm}
              deleteTeacherName={deleteTeacherName}
              teacherSearchQuery={teacherSearchQuery}
              teacherSearchTerm={teacherSearchTerm}
              imagePreview={imagePreview}
              setTeacherForm={setTeacherForm}
              setTeacherSearchQuery={setTeacherSearchQuery}
              setTeacherSearchTerm={setTeacherSearchTerm}
              setShowTeacherModal={setShowTeacherModal}
              setViewTeacher={setViewTeacher}
              setShowDeleteTeacherConfirm={setShowDeleteTeacherConfirm}
              handleImageChange={handleImageChange}
              handleAddOrUpdateTeacher={handleAddOrUpdateTeacher}
              resetTeacherForm={resetTeacherForm}
              handleDownloadStatistics={handleDownloadStatistics}
              handleViewTeacher={handleViewTeacher}
              handleEditTeacher={handleEditTeacher}
              handleDeleteTeacher={handleDeleteTeacher}
              confirmDeleteTeacher={confirmDeleteTeacher}
              cancelDeleteTeacher={cancelDeleteTeacher}
              calculateTeacherMetrics={calculateTeacherMetrics}
            />
          )}

          {activeNavItem === "news" && (
            <CommentsTable
              isDarkMode={isDarkMode}
              reviews={reviews}
              formatDate={formatDate}
              handleToggleReviewStatus={handleToggleReviewStatus}
              handleViewReview={handleViewReview}
              handleDeleteReview={handleDeleteReview}
              showDeleteReviewConfirm={showDeleteReviewConfirm}
              cancelDeleteReview={cancelDeleteReview}
              confirmDeleteReview={confirmDeleteReview}
              viewReview={viewReview}
              setViewReview={setViewReview}
              SCORE_FIELDS={SCORE_FIELDS}
            />
          )}

          {activeNavItem === "about" && (
            <AboutUsjsx isDarkMode={isDarkMode} />
          )}
          </div>
        </main>
      </div>
    </div>
  )
}
