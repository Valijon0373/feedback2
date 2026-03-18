import { useState, useEffect } from "react"
import { mockData } from "../data/mockData"
import { departmentsApi, teachersApi, reviewsApi, buildImageUrl } from "../lib/api"
import StarRating from "../components/StarRating"

export default function Department({ id, navigate }) {
  const [department, setDepartment] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setLoading(true)

      try {
        const [deptRes, departmentsRes, teachersRes, reviewsRes] = await Promise.allSettled([
          departmentsApi.getById(id),
          departmentsApi.getAll(),
          teachersApi.getAll(),
          reviewsApi.getAll(),
        ])

        let dept = deptRes.status === "fulfilled" ? deptRes.value : null
        if (!dept) {
          const departments =
            departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value)
              ? departmentsRes.value
              : Array.isArray(mockData.departments) ? mockData.departments : []
          dept = departments.find((d) => Number(d.id) === Number(id)) || null
        }
        setDepartment(dept)

        const teachersData =
          teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value)
            ? teachersRes.value
            : Array.isArray(mockData.teachers)
              ? mockData.teachers
              : []

        const t = teachersData.filter((teacher) => {
          const teacherDeptId =
            teacher.departmentId ??
            teacher.department_id ??
            (teacher.department && teacher.department.id)
          return Number(teacherDeptId) === Number(id)
        })
        setTeachers(t)

        let reviewsData =
          reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value)
            ? reviewsRes.value
            : Array.isArray(mockData.reviews) ? mockData.reviews : []

        if (reviewsData.length === 0 && t.length > 0) {
          const byTeacher = await Promise.all(
            t.map(async (teacher) => {
              try {
                const revs = await reviewsApi.getByTeacherId(teacher.id)
                return Array.isArray(revs) ? revs.filter((rev) => rev.isActive !== false) : []
              } catch {
                return []
              }
            })
          )
          reviewsData = byTeacher.flat()
        } else {
          reviewsData = reviewsData.filter((review) => review.isActive !== false)
        }
        setReviews(reviewsData)
      } catch (error) {
        console.error("Failed to load department data:", error)
        setDepartment(null)
        setTeachers([])
        setReviews([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const departmentHead = teachers.find((t) => t.title === "Kafedra Mudiri")

  if (loading) return <div className="text-center text-slate-600">Yuklanmoqda...</div>

  if (!department) {
    return (
      <div className="text-center">
        <p className="text-slate-600 mb-4">Kafedra topilmadi</p>
        <button
          onClick={() => navigate("faculties")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Fakultetlarga qaytish
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate("faculties")}
        className="mb-6 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        ← Fakultetlarga qaytish
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{department.nameUz} kafedrasi o‘qituvchilari</h1>
        <p className="text-slate-600">{department.nameRu}</p>
        {departmentHead && (
          <p className="text-sm text-slate-500 mt-2">Rahbar: {departmentHead.name}</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          O'qituvchilar ({teachers.length})
        </h2>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Bu kafedrada hozircha o'qituvchilar ro'yxati mavjud emas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => {
            const teacherReviews = reviews.filter((r) => {
              const rid = r.teacherId ?? r.teacher_id ?? r.teacher?.id
              return rid != null && Number(rid) === Number(teacher.id)
            })
            const avgRating =
              teacherReviews.length > 0
                ? (
                    teacherReviews.reduce((sum, r) => sum + (r.scores?.overall ?? r.rating ?? 0), 0) / teacherReviews.length
                  ).toFixed(1)
                : "0.0"

            return (
              <div
                key={teacher.id}
                onClick={() => navigate("teacher", teacher.id)}
                className="card cursor-pointer hover:shadow-lg transition-all space-y-3"
              >
                <div className="w-full h-56 rounded-lg mb-4 overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={buildImageUrl(
                      teacher.imageUrl || teacher.image || teacher.photo || teacher.avatar || "",
                    ) || "/placeholder.svg"}
                    alt={teacher.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                  <p className="text-sm text-blue-600">{teacher.title}</p>
                </div>
                <p className="text-sm text-slate-600">{teacher.specialization || teacher.department}</p>
                {teacher.experience && (
                  <p className="text-xs text-slate-500">Tajriba: {teacher.experience}</p>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-slate-500">{teacherReviews.length} ta sharh</span>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={avgRating} size="sm" />
                    <span className="font-semibold text-yellow-500 text-sm">{avgRating}/5</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Batafsil va baxolash
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
