"use client"

import { useMemo, useState, useEffect } from "react"
import { CheckCircle, X, Mail, Landmark } from "lucide-react"
import { reviewsApi, buildImageUrl } from "../lib/api"
import StarRating from "./StarRating"

const SCORE_FIELDS = [
  { key: "knowledge", label: "Kasbiy kompetensiya" },
  { key: "teaching", label: "O'qitish samaradorligi" },
  { key: "communication", label: "Muloqot madaniyati" },
  { key: "engagement", label: "Talabalarga munosabati" },
]

const createDefaultScores = () =>
  SCORE_FIELDS.reduce((acc, { key }) => {
    acc[key] = 5
    return acc
  }, {})

const computeCategoryAverages = (reviews) => {
  if (!reviews.length) {
    return SCORE_FIELDS.reduce((acc, { key }) => {
      acc[key] = 0
      return acc
    }, {})
  }

  const totals = SCORE_FIELDS.reduce((acc, { key }) => {
    acc[key] = 0
    return acc
  }, {})

  reviews.forEach((review) => {
    SCORE_FIELDS.forEach(({ key }) => {
      const value = review.scores?.[key] ?? review.rating ?? 0
      totals[key] += Number.isFinite(value) ? value : 0
    })
  })

  return SCORE_FIELDS.reduce((acc, { key }) => {
    acc[key] = Number((totals[key] / reviews.length).toFixed(1))
    return acc
  }, {})
}

const formatRating = (value) => Number(value || 0).toFixed(1)

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

// https://feedback.urspi.uz/teacher/teacher_id

const getQrCodeSrc = (teacher) => {
  if (!teacher?.id) return "/placeholder.svg"
  let url = `https://feedback.urspi.uz/teacher/${teacher.id}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`
}


export default function TeacherProfile({ teacher, onBack, layout = "default" }) {
  const [reviews, setReviews] = useState([])
  const [formState, setFormState] = useState({
    studentName: "",
    anonymous: false,
    comment: "",
    scores: createDefaultScores(),
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showIdentityWarning, setShowIdentityWarning] = useState(false)
  const [showCommentWarning, setShowCommentWarning] = useState(false)
  const [showAnonymousInfoModal, setShowAnonymousInfoModal] = useState(false)

  const averages = useMemo(() => computeCategoryAverages(reviews), [reviews])
  const totalReviews = reviews.length
  const overallRating = totalReviews
    ? formatRating(
        reviews.reduce((sum, review) => sum + Number(review.rating ?? review.scores?.overall ?? 0), 0) / totalReviews,
      )
    : "0.0"
  const qrSrc = getQrCodeSrc(teacher)

  useEffect(() => {
    let cancelled = false

    const loadReviews = async () => {
      try {
        const byTeacher = await reviewsApi.getByTeacherId(teacher.id)
        const list = (Array.isArray(byTeacher) ? byTeacher : [])
          .filter((review) => review.isActive !== false)
          .sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0))
        if (!cancelled) setReviews(list)
      } catch (_) {
        if (!cancelled) setReviews([])
      }
    }

    loadReviews()
    return () => {
      cancelled = true
    }
  }, [teacher.id])

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessModal])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formState.comment.trim()) {
      setShowCommentWarning(true)
      return
    }

    if (!formState.studentName.trim() && !formState.anonymous) {
      setShowIdentityWarning(true)
      return
    }

    const scores = { ...formState.scores }
    const average =
      SCORE_FIELDS.reduce((sum, { key }) => sum + Number(scores[key] || 0), 0) / SCORE_FIELDS.length || 0

    const newReview = {
      teacherId: teacher.id,
      studentName:
        formState.anonymous || !formState.studentName.trim() ? "Anonim talaba" : formState.studentName.trim(),
      anonymous: formState.anonymous,
      rating: Number(average.toFixed(1)),
      scores,
      comment: formState.comment,
      date: new Date().toISOString(),
      isActive: true,
    }

    try {
      await reviewsApi.save(newReview)

      // Reload to reflect server-side id/created_at fields
      const byTeacher = await reviewsApi.getByTeacherId(teacher.id)
      const list = (Array.isArray(byTeacher) ? byTeacher : [])
        .filter((review) => review.isActive !== false)
        .sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0))
      setReviews(list)

      setFormState({
        studentName: "",
        anonymous: false,
        comment: "",
        scores: createDefaultScores(),
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error submitting review:", error)
      alert(`Xatolik yuz berdi: ${error.message || "Noma'lum xatolik"}`)
    }
  }

  const handleScoreChange = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      scores: { ...prev.scores, [key]: Number(value) },
    }))
  }

  return (
    <div className="space-y-8">
      {/* Identity Warning Modal */}
      {showIdentityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-xl relative">
            <button
              onClick={() => setShowIdentityWarning(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-3xl font-bold">
                !
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ma'lumot talab qilinadi</h3>
            <p className="text-slate-600 mb-6">Iltimos, ismingizni kiriting yoki “Anonim qoldirish” tugmasini tanlang.</p>
            <button
              onClick={() => setShowIdentityWarning(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}

      {/* Comment Warning Modal */}
      {showCommentWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-xl relative">
            <button
              onClick={() => setShowCommentWarning(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-3xl font-bold">
                !
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sharh talab qilinadi</h3>
            <p className="text-slate-600 mb-6">Iltimos, o'qituvchi faoliyati haqida sharh qoldiring.</p>
            <button
              onClick={() => setShowCommentWarning(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-xl relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Muvaffaqiyatli Jo'natildi</h3>
            <p className="text-slate-600">Sharhingiz muvaffaqiyatli yuborildi!</p>
          </div>
        </div>
      )}

      {/* Anonymous Info Modal */}
      {showAnonymousInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAnonymousInfoModal(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Hurmatli talabalar!</h3>
            <div className="text-slate-700 space-y-4 text-sm text-justify">
              <p>
                Ushbu so‘rovnoma anonim tarzda o‘tkazilmoqda va siz bildirgan fikrlar o‘qituvchilar faoliyatini baholash,
                ta’lim jarayonini yanada yaxshilash hamda o‘quv sifatini oshirishga xizmat qiladi. Sizning har bir
                mulohazangiz biz uchun juda muhim.
              </p>
              <p className="font-semibold">Shu bilan birga, quyidagi qoidalarga qat’iy amal qilishingizni so‘raymiz:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Haqoratli, mensimaslik, kamsitish, kulgi va shaxsga tegishli salbiy sharhlar qoldirmang. Bunday mazmundagi
                  sharhlar moderatsiya tomonidan rad etiladi va hisobga olinmaydi.
                </li>
                <li>
                  Fikrlaringizni madaniyatli, hurmat asosida va konstruktiv shaklda ifoda eting. Tanqid bo‘lsa ham, u asosli,
                  ma’noli va xolis bo‘lishi kerak.
                </li>
                <li>
                  Baholash jarayonida shaxsiy adovat, hissiy holat yoki vaziyatdan kelib chiqib noto‘g‘ri xulosa berishdan
                  saqlaning. Iltimos, o‘qituvchilarni haqiqiy dars jarayoni, munosabati va pedagogik faoliyatiga asoslanib
                  baholang.
                </li>
              </ul>
              <p>
                So‘rovnoma natijalari ta’lim sifatini oshirishga xizmat qiladi. Shuning uchun har bir javobingiz vijdonan,
                xolis va mas’uliyat bilan yozilishi juda muhim.
              </p>
              <p>
                Sharhingizni yozayotganda unutmaying: sizning fikringiz, takliflaringiz va mulohazalaringiz o'quv jarayonini
                yanada yaxshilashga yordam beradi. Shu boisdan iloji boricha aniq, tushunarli va foydali fikr bildiring.
              </p>
              <p>
                Sizdan hurmat, odob va adolat tamoyillariga amal qilgan holda fikr qoldirishingiz so‘raladi.
              </p>
              <p className="italic text-center font-medium">
                Yaxshi niyatda bildirilgan xolis fikrlar – o‘qituvchi va talaba o‘rtasidagi o‘zaro hurmat va ta’lim sifati
                yuksalishining asosidir.
              </p>
              <p className="text-center font-bold mt-4">Rahmat!</p>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAnonymousInfoModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}

      {onBack && (
        <button onClick={onBack} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
          ← Orqaga
        </button>
      )}

      <div
        className={`grid gap-6 ${layout === "embedded" ? "grid-cols-1 lg:grid-cols-[2fr_1fr]" : "grid-cols-1 lg:grid-cols-[2fr_1fr]"}`}
      >
        <div className="card border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{teacher.fullName || teacher.name}</h1>
              <p className="text-slate-600 mb-4 mt-4 flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                <span className="font-semibold">Kafedra:</span>
                <span>{teacher.department}</span>
              </p>

              <div className="space-y-2 text-sm text-slate-600 mb-6">
                {teacher.email && (
                  <p className="flex items-center gap-2 whitespace-nowrap">
                    <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      E-mail:
                    </span>
                    <span>{teacher.email}</span>
                  </p>
                )}
                {teacher.phone && !teacher.email && (
                  <p className="flex items-center gap-2 whitespace-nowrap">
                    <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      E-mail:
                    </span>
                    <span>{teacher.phone}</span>
                  </p>
                )}
                {teacher.experience && (
                  <p>
                    <span className="font-semibold text-slate-800">Tajriba:</span> {teacher.experience}
                  </p>
                )}
              </div>

              {/* Bio ma'lumotini vaqtincha ko'rsatmaymiz */}
            </div>
            
            {/* Teacher Image on Right Side */}
            <div className="flex flex-col items-center justify-start md:pl-6">
              <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-slate-200 shadow-md">
                <img
                src={
                  buildImageUrl(
                    teacher.imageUrl || teacher.image || teacher.photo || teacher.avatar || "",
                  ) || "/placeholder-user.jpg"
                }
                  alt={teacher.fullName || teacher.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 mt-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <StarRating rating={overallRating} size="lg" />
              <span className="text-sm font-semibold text-yellow-700">{overallRating}/5</span>
            </div>
            <p className="text-xs text-yellow-600 text-center">{totalReviews} ta sharh asosida</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SCORE_FIELDS.map(({ key, label }) => (
              <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{formatRating(averages[key])} / 5</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card border border-slate-200 flex flex-col items-center justify-center text-center gap-4">
          <h3 className="text-lg font-semibold text-slate-900">QR Kod</h3>
          <img src={qrSrc} alt={`${teacher.fullName || teacher.name} QR`} className="w-40 h-40 object-contain rounded-lg border" />
          <p className="text-xs text-slate-500 px-4">
            Ushbu kodni skaner qilib, o'qituvchi haqida tezda fikr bildirish yoki ma'lumotlarni yuklab olish mumkin.
          </p>
        </div>
      </div>

      <div className="card border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-8">O'qituvchi haqida sharh bering</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Ism (ixtiyoriy)</label>
              <input
                type="text"
                value={formState.studentName}
                onChange={(event) => setFormState((prev) => ({ ...prev, studentName: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ismingiz"
              />
            </div>
            <div className="flex items-center gap-2 mt-6 md:mt-8">
              <input
                id={`anonymous-${teacher.id}`}
                type="checkbox"
                checked={formState.anonymous}
                onChange={(event) => {
                  const isChecked = event.target.checked
                  setFormState((prev) => ({ ...prev, anonymous: isChecked }))
                  if (isChecked) {
                    setShowAnonymousInfoModal(true)
                  }
                }}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded"
              />
              <label htmlFor={`anonymous-${teacher.id}`} className="text-sm text-slate-600">
                Anonim qoldirish
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SCORE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-900 mb-1">{label}</label>
                <select
                  value={formState.scores[key]}
                  onChange={(event) => handleScoreChange(key, event.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Sharh</label>
            <textarea
              value={formState.comment}
              onChange={(event) => setFormState((prev) => ({ ...prev, comment: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Fikringizni yozing..."
              rows="4"
            />
          </div>

          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Sharhni yuborish
          </button>
        </form>
      </div>

      <div className="card border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Sharhlar ({totalReviews})</h2>
        {totalReviews === 0 ? (
          <p className="text-slate-600">Hali hech qanday sharh yo'q</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-slate-200 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{review.studentName}</p>
                    <p className="text-xs text-slate-500">{formatDate(review.date || review.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.scores?.overall ?? review.rating ?? 0} size="md" />
                    <span className="text-yellow-500 font-semibold text-sm">{formatRating(review.scores?.overall ?? review.rating ?? 0)}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">{review.comment}</p>
                <div className="flex flex-wrap gap-2">
                  {SCORE_FIELDS.map(({ key, label }) => (
                    <span
                      key={key}
                      className="text-xs px-2 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-600"
                    >
                      {label}: {review.scores?.[key] ?? review.rating}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

