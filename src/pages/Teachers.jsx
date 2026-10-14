import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { mockData } from "../data/mockData"
import { teachersApi, reviewsApi, departmentsApi, buildImageUrl } from "../lib/api"
import StarRating from "../components/StarRating"

export default function Teachers({ navigate }) {
  const PAGE_SIZE = 12
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("")
  const [teachers, setTeachers] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const getTeacherImageSrc = (t) => {
    const raw =
      t?.imageUrl ||
      t?.image ||
      t?.photo ||
      t?.avatar ||
      ""

    if (!raw) return "/placeholder.svg"

    return buildImageUrl(raw) || "/placeholder.svg"
  }

  const getTeacherDisplayName = (t) => t?.fullName || t?.name || ""
  const getTeacherDisplayTitle = (t) => t?.position || t?.title || ""
  const getTeacherQrSrc = (t) => {
    if (!t?.id) return "/placeholder.svg"
    const url = `https://feedback.urspi.uz/teacher/${t.id}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [teachersRes, reviewsRes, departmentsRes] = await Promise.allSettled([
          teachersApi.getAllPublic(),
          reviewsApi.getAll(),
          departmentsApi.getAll(),
        ])
        const t =
          teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value)
            ? teachersRes.value
            : Array.isArray(mockData.teachers) ? mockData.teachers : []
        let r =
          reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value)
            ? reviewsRes.value
            : Array.isArray(mockData.reviews) ? mockData.reviews : []

        const d =
          departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value)
            ? departmentsRes.value
            : Array.isArray(mockData.departments) ? mockData.departments : []

        const enrichedTeachers = t.map((teacher) => {
          const teacherDeptId =
            teacher.departmentId ??
            teacher.department_id ??
            (teacher.department && teacher.department.id)

          const dept = d.find((dp) => Number(dp.id) === Number(teacherDeptId))
          return {
            ...teacher,
            departmentId: teacherDeptId,
            department: dept ? dept.nameUz : teacher.department || "",
          }
        })

        if (r.length === 0 && enrichedTeachers.length > 0) {
          const byTeacher = await Promise.all(
            enrichedTeachers.map(async (teacher) => {
              try {
                const revs = await reviewsApi.getByTeacherId(teacher.id)
                return Array.isArray(revs) ? revs.filter((rev) => rev.isActive !== false) : []
              } catch {
                return []
              }
            })
          )
          r = byTeacher.flat()
        } else {
          r = r.filter((rev) => rev.isActive !== false)
        }

        setTeachers(enrichedTeachers)
        setReviews(r)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    // Search natijalarida ko‘proq yuklashni qayta boshlash uchun.
    setVisibleCount(PAGE_SIZE)
  }, [teacherSearchTerm])

  const filtered = useMemo(() => {
    if (!teacherSearchTerm.trim()) return teachers
    const query = teacherSearchTerm.toLowerCase().trim()
    return teachers.filter((teacher) => {
      const name = (getTeacherDisplayName(teacher) || "").toLowerCase()
      const title = (getTeacherDisplayTitle(teacher) || "").toLowerCase()
      const dept = (
        typeof teacher.department === "string"
          ? teacher.department
          : teacher.department?.nameUz || teacher.department?.name || ""
      ).toLowerCase()
      const spec = (teacher.specialization || "").toLowerCase()
      return (
        name.includes(query) ||
        title.includes(query) ||
        spec.includes(query) ||
        dept.includes(query)
      )
    })
  }, [teachers, teacherSearchTerm])

  const displayedTeachers = filtered.slice(0, visibleCount)

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length))
  }

  if (loading) return <div className="text-center text-slate-600 py-8">Yuklanmoqda...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">O&apos;qituvchilar Ro&apos;yxati</h1>

        {/* Search Input */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={teacherSearchQuery}
                onChange={(e) => {
                  const val = e.target.value
                  setTeacherSearchQuery(val)
                  if (!val.trim()) {
                    setTeacherSearchTerm("")
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    setTeacherSearchTerm(teacherSearchQuery)
                  }
                }}
                placeholder="O'qituvchi qidirish..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-600 transition-colors duration-300 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setTeacherSearchTerm(teacherSearchQuery)}
              className="px-6 py-2.5 border-2 border-blue-500 text-blue-500 rounded-full font-medium hover:bg-blue-500 hover:text-white transition-all duration-200 whitespace-nowrap"
            >
              Qidirish
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <p className="text-slate-600 text-lg">Hech qanday o&apos;qituvchi topilmadi</p>
          {teacherSearchTerm && (
            <button
              type="button"
              onClick={() => {
                setTeacherSearchQuery("")
                setTeacherSearchTerm("")
              }}
              className="mt-4 px-5 py-2 text-sm bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              Barcha o&apos;qituvchilarni ko&apos;rsatish
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTeachers.map((teacher) => {
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
                    src={getTeacherImageSrc(teacher)}
                    alt={getTeacherDisplayName(teacher)}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{getTeacherDisplayName(teacher)}</h2>
                  <p className="text-sm text-blue-600">{getTeacherDisplayTitle(teacher)}</p>
                </div>
                <p className="text-xs text-slate-500">Kafedra: {teacher.department}</p>
                {teacher.experience && <p className="text-xs text-slate-500">Tajriba: {teacher.experience}</p>}
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

      {filtered.length > PAGE_SIZE && visibleCount < filtered.length && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleLoadMore}
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap"
          >
            Ko'proq
          </button>
        </div>
      )}
    </div>
  )
}
