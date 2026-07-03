import { Eye, Search, Trash2, X } from "lucide-react"
import { useMemo, useState } from "react"
import StarRating from "../../components/StarRating"

export default function CommentsTable({
  isDarkMode,
  reviews,
  teachers,
  departments,
  faculties,
  formatDate,
  handleToggleReviewStatus,
  handleViewReview,
  handleDeleteReview,
  showDeleteReviewConfirm,
  cancelDeleteReview,
  confirmDeleteReview,
  viewReview,
  setViewReview,
  SCORE_FIELDS,
}) {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [sortBy, setSortBy] = useState("rating_desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")

  const normalizeId = (v) => {
    if (v === undefined || v === null) return null
    const s = String(v).trim()
    return s ? s : null
  }

  const idsEqual = (a, b) => {
    const sa = normalizeId(a)
    const sb = normalizeId(b)
    if (!sa || !sb) return false
    const na = Number(sa)
    const nb = Number(sb)
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb
    return sa === sb
  }

  const getTeacherIdFromReview = (r) =>
    r?.teacherId ??
    r?.teacher_id ??
    r?.teachersId ??
    r?.teachers_id ??
    r?.teacher?.id ??
    r?.teacher?.teacherId ??
    null

  const getDepartmentNameFromTeacher = (t, deptById) => {
    if (!t) return ""
    const deptId =
      t.departmentId ?? t.department_id ?? t.department?.id ?? t.department?.departmentId ?? null
    const dept =
      deptId != null
        ? deptById.get(String(deptId)) ?? deptById.get(String(Number(deptId)))
        : null
    const name =
      (dept?.nameUz ?? dept?.name_uz ?? dept?.nameUZ ?? dept?.name ?? dept?.title) ??
      (typeof t.department === "string" ? t.department : null) ??
      (t.department?.nameUz ?? t.department?.name_uz ?? t.department?.name ?? null) ??
      t.departmentNameUz ??
      t.department_name_uz ??
      t.departmentName ??
      t.department_name ??
      ""
    return String(name || "").trim()
  }

  const deptById = useMemo(() => {
    const map = new Map()
    ;(Array.isArray(departments) ? departments : []).forEach((d) => {
      const id = d?.id ?? d?.departmentId ?? d?.department_id
      const key = normalizeId(id)
      if (key) map.set(key, d)
      const n = Number(key)
      if (key && !Number.isNaN(n)) map.set(String(n), d)
    })
    return map
  }, [departments])

  const teacherById = useMemo(() => {
    const map = new Map()
    ;(Array.isArray(teachers) ? teachers : []).forEach((t) => {
      const id = t?.id ?? t?.teacherId ?? t?.teacher_id
      const key = normalizeId(id)
      if (key) map.set(key, t)
      const n = Number(key)
      if (key && !Number.isNaN(n)) map.set(String(n), t)
    })
    return map
  }, [teachers])

  const normalizeNameKey = (v) =>
    String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")

  const getDeptFacultyId = (d) =>
    d?.facultyId ?? d?.faculty_id ?? d?.faculty?.id ?? d?.faculty?.facultyId ?? null

  const getDeptId = (d) => d?.id ?? d?.departmentId ?? d?.department_id ?? null

  const findDepartmentByName = (name) => {
    const searchName = normalizeNameKey(name)
    if (!searchName) return null
    const list = Array.isArray(departments) ? departments : []
    const getName = (d) =>
      normalizeNameKey(d?.nameUz ?? d?.name_uz ?? d?.nameUZ ?? d?.name ?? d?.title ?? "")
    return (
      list.find((d) => getName(d) === searchName) ??
      list.find((d) => {
        const n = getName(d)
        return n && (n.includes(searchName) || searchName.includes(n))
      }) ??
      null
    )
  }

  const getTeacherFromReview = (review) => {
    const tid = getTeacherIdFromReview(review)
    if (tid != null) {
      const teacher =
        teacherById.get(String(tid)) ?? teacherById.get(String(Number(tid)))
      if (teacher) return teacher
    }

    const nameKey = normalizeNameKey(
      review?.teacherName ??
        review?.teacherFullName ??
        review?.teacher_full_name ??
        review?.teacher?.fullName ??
        review?.teacher?.name ??
        "",
    )
    if (!nameKey) return null

    return (
      (Array.isArray(teachers) ? teachers : []).find((t) => {
        const tk = normalizeNameKey(t?.fullName ?? t?.name ?? t?.full_name ?? t?.teacherName ?? "")
        return tk && tk === nameKey
      }) ?? null
    )
  }

  const resolveReviewDepartment = (review) => {
    let deptId =
      review?.departmentId ??
      review?.department_id ??
      review?.department?.id ??
      review?.department?.departmentId ??
      null

    const teacher = getTeacherFromReview(review)
    if (deptId == null && teacher) {
      deptId =
        teacher.departmentId ??
        teacher.department_id ??
        teacher.department?.id ??
        teacher.department?.departmentId ??
        null
    }

    let dept =
      deptId != null
        ? deptById.get(String(deptId)) ?? deptById.get(String(Number(deptId)))
        : null

    if (!dept) {
      dept = findDepartmentByName(getReviewDepartmentName(review))
    }

    if (!dept && teacher) {
      const teacherDeptName =
        typeof teacher.department === "string"
          ? teacher.department
          : teacher.departmentNameUz ??
            teacher.department_name_uz ??
            teacher.departmentName ??
            teacher.department_name ??
            null
      if (teacherDeptName) dept = findDepartmentByName(teacherDeptName)
    }

    return dept
  }

  const getReviewDepartmentName = (review) => {
    const direct =
      review?.departmentName ??
      review?.department_name ??
      review?.departmentNameUz ??
      review?.department_name_uz ??
      review?.department?.nameUz ??
      review?.department?.name_uz ??
      review?.department?.name ??
      ""
    const directName = String(direct || "").trim()
    if (directName) return directName

    const teacher = getTeacherFromReview(review)
    return getDepartmentNameFromTeacher(teacher, deptById)
  }

  const parseReviewDate = (raw) => {
    if (!raw) return null
    if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw

    // timestamps
    if (typeof raw === "number") {
      const d = new Date(raw)
      return Number.isNaN(d.getTime()) ? null : d
    }

    const s = String(raw).trim()
    if (!s) return null

    // ISO / RFC formats should parse here
    const direct = new Date(s)
    if (!Number.isNaN(direct.getTime())) return direct

    // "YYYY-MM-DD" (treat as local date)
    const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (ymd) {
      const [, y, m, d] = ymd
      const dt = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0)
      return Number.isNaN(dt.getTime()) ? null : dt
    }

    // "DD.MM.YYYY" or "DD.MM.YYYY HH:mm" or "DD.MM.YYYY HH:mm:ss"
    const dmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
    if (dmy) {
      const [, dd, mm, yyyy, HH = "12", MM = "00", SS = "00"] = dmy
      const dt = new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        Number(HH),
        Number(MM),
        Number(SS),
        0,
      )
      return Number.isNaN(dt.getTime()) ? null : dt
    }

    return null
  }

  const filteredReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return []
    let list = reviews

    if (fromDate || toDate) {
      const from = fromDate ? new Date(`${fromDate}T00:00:00.000`) : null
      const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null
      list = list.filter((review) => {
        const raw = review?.date ?? review?.created_at ?? review?.createdAt ?? review?.created ?? null
        const d = parseReviewDate(raw)
        if (!d) return false
        if (from && d < from) return false
        if (to && d > to) return false
        return true
      })
    }
    
    if (selectedFaculty || selectedDepartment) {
      list = list.filter((review) => {
        const dept = resolveReviewDepartment(review)

        if (selectedDepartment) {
          if (!dept || !idsEqual(getDeptId(dept), selectedDepartment)) return false
        } else if (selectedFaculty) {
          if (!dept || !idsEqual(getDeptFacultyId(dept), selectedFaculty)) return false
        }

        return true
      })
    }

    return list
  }, [
    reviews,
    fromDate,
    toDate,
    selectedFaculty,
    selectedDepartment,
    deptById,
    teacherById,
    departments,
    teachers,
  ])

  const searchedReviews = useMemo(() => {
    const list = Array.isArray(filteredReviews) ? filteredReviews : []
    const q = String(searchQuery || "").trim().toLowerCase()
    if (!q) return list

    const includes = (value) => String(value || "").toLowerCase().includes(q)

    return list.filter((r) => {
      const deptName = getReviewDepartmentName(r)
      return (
        includes(r?.studentName) ||
        includes(r?.teacherName) ||
        includes(r?.comment) ||
        includes(deptName)
      )
    })
  }, [filteredReviews, searchQuery, teacherById, deptById])

  const visibleReviews = useMemo(() => {
    const list = Array.isArray(searchedReviews) ? [...searchedReviews] : []

    const getRating = (r) => {
      const v = r?.scores?.overall ?? r?.rating ?? 0
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }

    const getDate = (r) => {
      const raw = r?.date ?? r?.created_at ?? r?.createdAt ?? r?.created ?? null
      const d = parseReviewDate(raw)
      return d ? d.getTime() : 0
    }

    if (sortBy === "rating_desc") {
      list.sort((a, b) => getRating(b) - getRating(a) || getDate(b) - getDate(a))
    } else if (sortBy === "rating_asc") {
      list.sort((a, b) => getRating(a) - getRating(b) || getDate(b) - getDate(a))
    } else {
      list.sort((a, b) => getRating(b) - getRating(a) || getDate(b) - getDate(a))
    }

    return list
  }, [searchedReviews, sortBy])

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
      } border rounded-lg p-6 transition-colors duration-300`}
    >
      <h2
        className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        Barcha Sharhlar
      </h2>
      <div
        className={`mb-5 flex flex-col gap-4 p-4 rounded-xl border ${
          isDarkMode ? "bg-[#0e1a22] border-[#1a2d3a]" : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className={`text-xs font-medium ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
              Fakultet
            </span>
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value)
                setSelectedDepartment("")
              }}
              className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                isDarkMode
                  ? "bg-[#14232c] border-[#1a2d3a] text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <option value="">Barchasi</option>
              {(faculties || []).map((f) => {
                const fid = f.id ?? f.facultyId ?? f.faculty_id
                return (
                  <option key={fid} value={fid}>
                    {f.nameUz ?? f.name_uz ?? f.name}
                  </option>
                )
              })}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={`text-xs font-medium ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
              Kafedra
            </span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                isDarkMode
                  ? "bg-[#14232c] border-[#1a2d3a] text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <option value="">Barchasi</option>
              {(departments || [])
                .filter(
                  (d) => !selectedFaculty || idsEqual(getDeptFacultyId(d), selectedFaculty),
                )
                .map((d) => {
                  const did = getDeptId(d)
                  return (
                    <option key={did} value={did}>
                      {d.nameUz ?? d.name_uz ?? d.name ?? d.title}
                    </option>
                  )
                })}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={`text-xs font-medium ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
              Boshlanish sana
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                isDarkMode
                  ? "bg-[#14232c] border-[#1a2d3a] text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={`text-xs font-medium ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
              Tugash sana
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                isDarkMode
                  ? "bg-[#14232c] border-[#1a2d3a] text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            />
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="w-full md:flex-1 md:max-w-md">
            <label className="flex flex-col gap-1 w-full">
              <span className={`text-xs font-medium ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                Izlash
              </span>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                  isDarkMode
                    ? "bg-[#14232c] border-[#1a2d3a] text-white"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                <Search className={`w-4 h-4 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"}`} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Talaba, o'qituvchi, kafedra yoki sharh..."
                  className={`w-full bg-transparent outline-none placeholder:opacity-70 ${
                    isDarkMode
                      ? "text-white placeholder:text-[#8b9ba8] caret-white"
                      : "text-slate-900 placeholder:text-slate-500 caret-slate-900"
                  }`}
                />
                {!!searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={`px-2 py-0.5 rounded-md border text-xs font-semibold transition-colors ${
                      isDarkMode
                        ? "border-[#1a2d3a] text-[#8b9ba8] hover:text-white hover:border-white/20"
                        : "border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    Tozalash
                  </button>
                )}
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <label className="flex flex-col gap-1">
              <span className={`text-xs font-medium ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                Saralash
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors cursor-pointer ${
                  isDarkMode
                    ? "bg-[#14232c] border-[#1a2d3a] text-white"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                <option value="rating_desc">Reyting: Yuqori → past</option>
                <option value="rating_asc">Reyting: Past → yuqori</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setFromDate("")
                setToDate("")
                setSortBy("rating_desc")
                setSearchQuery("")
                setSelectedFaculty("")
                setSelectedDepartment("")
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-white ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                  : "bg-blue-500 hover:bg-blue-600 shadow-sm"
              }`}
            >
              Tozalash
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {visibleReviews.length === 0 ? (
          <p
            className={`transition-colors duration-300 ${
              isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
            }`}
          >
            Hali hech qanday sharh yo'q
          </p>
        ) : (
          visibleReviews.map((review, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border transition-colors duration-300 ${
                isDarkMode ? "bg-[#0e1a22] border-[#1a2d3a]" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p
                    className={`font-bold transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {review.studentName}
                  </p>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                    }`}
                  >
                    {review.teacherName}
                    {(() => {
                      const deptName = getReviewDepartmentName(review)
                      return deptName ? ` | ${deptName}` : ""
                    })()}
                    {" | "}
                    {formatDate(review.date || review.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StarRating rating={review.scores?.overall ?? review.rating ?? 0} size="md" />
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p
                  className={`flex-1 transition-colors duration-300 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                  }`}
                >
                  {review.comment}
                </p>
                <div className="flex gap-2 items-center">
                  <select
                    value={review.isActive !== false ? "active" : "inactive"}
                    onChange={(e) =>
                      handleToggleReviewStatus(review.id, e.target.value === "active")
                    }
                    className={`px-2 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                      review.isActive !== false
                        ? `bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20 ${
                            isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                          }`
                        : `bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20 ${
                            isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                          }`
                    }`}
                  >
                    <option
                      value="active"
                      className={`${
                        isDarkMode ? "bg-[#0e1a22] text-white" : "bg-white text-slate-900"
                      }`}
                    >
                      Faol
                    </option>
                    <option
                      value="inactive"
                      className={`${
                        isDarkMode ? "bg-[#0e1a22] text-white" : "bg-white text-slate-900"
                      }`}
                    >
                      Faol emas
                    </option>
                  </select>
                  <button
                    onClick={() => handleViewReview(review)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-blue-500 border-blue-500/30 hover:bg-blue-500/10 ${
                      isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Ko'rish</span>
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10 ${
                      isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">O'chirish</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Review Confirmation Modal */}
      {showDeleteReviewConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={cancelDeleteReview}
          style={{
            animation: "fadeIn 0.3s ease-in-out forwards",
          }}
        >
          <div
            className={`${
              isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
            } border rounded-xl p-6 w-full max-w-md relative`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "slideUp 0.3s ease-out forwards",
            }}
          >
            <div className="mb-6">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Siz ushbu sharhni o'chirmoqchimisiz?
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteReview}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ha
              </button>
              <button
                onClick={cancelDeleteReview}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Yo'q
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {viewReview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewReview(null)}
          style={{
            animation: "fadeIn 0.3s ease-in-out forwards",
          }}
        >
          <div
            className={`${
              isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
            } border rounded-xl p-6 w-full max-w-md relative`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "slideUp 0.3s ease-out forwards",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Sharh tafsilotlari
              </h2>
              <button
                onClick={() => setViewReview(null)}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-[#8b9ba8] hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Talaba
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {viewReview.studentName}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  O'qituvchi
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {viewReview.teacherName}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Kafedra
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {getReviewDepartmentName(viewReview) || "Noma'lum"}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Sana
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {formatDate(viewReview.date || viewReview.created_at)}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Baholar
                </p>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span
                      className={isDarkMode ? "text-slate-300" : "text-slate-700"}
                    >
                      Umumiy:
                    </span>
                    <span className="font-bold text-yellow-400">
                      {viewReview.rating || viewReview.scores?.overall}
                    </span>
                  </div>
                  {viewReview.scores &&
                    Object.entries(viewReview.scores).map(([key, value]) =>
                      key !== "overall" ? (
                        <div key={key} className="flex justify-between text-sm">
                          <span
                            className={`${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {SCORE_FIELDS.find((f) => f.key === key)?.label || key}:
                          </span>
                          <span
                            className={`${
                              isDarkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {value}
                          </span>
                        </div>
                      ) : null,
                    )}
                </div>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Sharh
                </p>
                <p
                  className={`mt-1 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {viewReview.comment}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


