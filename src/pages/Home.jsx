import { useEffect, useState } from "react"
import { mockData } from "../data/mockData"
import { facultiesApi, teachersApi, reviewsApi, departmentsApi } from "../lib/api"
import StarRating from "../components/StarRating"

export default function Home({ navigate }) {
  const [openReviews, setOpenReviews] = useState(false)
  const [openTeachers, setOpenTeachers] = useState(false)
  const [openPrograms, setOpenPrograms] = useState(false)

  const educationPrograms = [
    {
      title: "1 Bakalavriat, kunduzgi ta'lim - jami",
      items: [
        "60110100 Pedagogika",
        "60110200 Maktabgacha ta'lim",
        "60110400 Boshlangʻich ta'lim",
        "60110500 Tasviriy san'at va muhandislik grafikasi",
        "60110600 Musiqa ta'limi",
        "60110700 Oʻzbek tili va adabiyoti",
        "60110800 Ona tili va adabiyoti: rus tili",
        "60110900 Xorijiy til va adabiyoti: ingliz tili",
        "60111100 Milliy gʻoya, ma'naviyat asoslari va huquq ta'limi",
        "60111200 Jismoniy madaniyat",
        "60111300 Texnologik ta'lim",
        "60220300 Tarix",
        "60510100 Biologiya",
        "60530100 Kimyo",
        "60530200 Geografiya",
        "60530500 Fizika",
        "60530700 Astronomiya",
        "60540100 Matematika",
        "60540200 Amaliy matematika",
        "60610100 Axborot tizimlari va texnologiyalari",
        "60610500 Sun'iy intellekt",
      ],
    },
    {
      title: "2 Bakalavriat, kechki ta'lim - jami",
      items: [
        "60110200 Maktabgacha ta'lim",
        "60110400 Boshlangʻich ta'lim",
        "60110800 Ona tili va adabiyoti: rus tili",
        "60110900 Xorijiy til va adabiyoti: ingliz tili",
        "60111100 Milliy gʻoya, ma'naviyat asoslari va huquq ta'limi",
        "60111200 Jismoniy madaniyat",
        "60111300 Texnologik ta'lim",
        "60540100 Matematika",
        "60220300 Tarix",
        "60110500 Tasviriy san'at va muhandislik grafikasi",
        "60110600 Musiqa ta'limi",
        "60540200 Amaliy matematika",
      ],
    },
    {
      title: "3 Magistratura, kunduzgi ta'lim - jami",
      items: [
        "70110101 Pedagogika nazariyasi va tarixi",
        "70110201 Ta'lim va tarbiya nazariyasi va metodikasi (maktabgacha ta'lim)",
        "70110401 Ta'lim va tarbiya nazariyasi va metodikasi (boshlangʻich ta'lim)",
        "70110502 Muhandislik grafikasi va dizayn nazariyasi",
        "70110601 Musiqa ta'limi va san'at",
        "70110701 Oʻzbek tili va adabiyoti",
        "70110901 Xorijiy til va adabiyoti",
        "70111101 Ijtimoiy-gumanitar fanlarni o'qitish metodikasi (ma'naviyat asoslari)",
        "70111201 Jismoniy tarbiya va sport mashg'ulotlari nazariyasi va metodikasi",
        "70111301 Ta'lim va tarbiya nazariyasi va metodikasi (texnologik ta'lim)",
        "70220303 Ijtimoiy-gumanitar fanlarni o'qitish metodikasi (tarix)",
        "70510105 Aniq va tabiiy fanlarni o'qitish metodikasi (biologiya)",
        "70530104 Aniq va tabiiy fanlarni o'qitish metodikasi (kimyo)",
        "70530203 Aniq va tabiiy fanlarni o'qitish metodikasi (geografiya)",
        "70530510 Aniq va tabiiy fanlarni o'qitish metodikasi (fizika va astronomiya)",
        "70540104 Aniq va tabiiy fanlarni o'qitish metodikasi (matematika)",
      ],
    },
  ]

  const [stats, setStats] = useState({
    faculties: 0,
    teachers: 0,
    reviews: 0,
  })

  const [topTeachers, setTopTeachers] = useState([])
  const [recentReviews, setRecentReviews] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const [facultiesRes, teachersRes, reviewsRes, departmentsRes] = await Promise.allSettled([
        facultiesApi.getAll(),
        teachersApi.getAll(),
        reviewsApi.getAll(),
        departmentsApi.getAll(),
      ])

      const facultiesList =
        facultiesRes.status === "fulfilled" && Array.isArray(facultiesRes.value)
          ? facultiesRes.value
          : Array.isArray(mockData.faculties) ? mockData.faculties : []
      const teachersList =
        teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value)
          ? teachersRes.value
          : Array.isArray(mockData.teachers) ? mockData.teachers : []
      const reviewsList =
        reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value)
          ? reviewsRes.value
          : Array.isArray(mockData.reviews) ? mockData.reviews : []
      const departmentsList =
        departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value)
          ? departmentsRes.value
          : Array.isArray(mockData.departments) ? mockData.departments : []

      setStats({
        faculties: facultiesList.length,
        teachers: teachersList.length,
        reviews: reviewsList.length,
      })

      const recent = reviewsList
        .filter((r) => r.isActive !== false)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
      setRecentReviews(recent)

      if (teachersList.length && reviewsList.length) {
        const calculatedTop = teachersList
          .map((t) => {
            const teacherReviews = reviewsList.filter(
              (r) => Number(r.teacherId) === Number(t.id) && r.isActive !== false,
            )
            const avg =
              teacherReviews.length > 0
                ? teacherReviews.reduce(
                    (sum, r) => sum + (r.scores?.overall ?? r.rating ?? 0),
                    0,
                  ) / teacherReviews.length
                : 0

            const deptName =
              departmentsList.find((d) => Number(d.id) === Number(t.departmentId))?.nameUz ||
              t.department ||
              ""

            return {
              ...t,
              department: deptName,
              avg: Number(avg.toFixed(1)),
              reviewCount: teacherReviews.length,
            }
          })
          .filter((t) => t.reviewCount > 0)
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 5)

        setTopTeachers(calculatedTop)
      }
    }

    loadData()
  }, [])

  // Count-up animation for stats
  const [facultiesCount, setFacultiesCount] = useState(0)
  const [teachersCount, setTeachersCount] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)

  useEffect(() => {
    const duration = 1200 // ms
    const frameRate = 16 // ~60fps
    const steps = Math.ceil(duration / frameRate)

    const animate = (target, setter) => {
      if (target === 0) {
        setter(0)
        return
      }
      let currentStep = 0
      const increment = target / steps

      const interval = setInterval(() => {
        currentStep += 1
        const value = Math.round(increment * currentStep)

        if (currentStep >= steps) {
          setter(target)
          clearInterval(interval)
        } else {
          setter(value)
        }
      }, frameRate)

      return interval
    }

    const i1 = animate(stats.faculties, setFacultiesCount)
    const i2 = animate(stats.teachers, setTeachersCount)
    const i3 = animate(stats.reviews, setReviewsCount)

    return () => {
      if (i1) clearInterval(i1)
      if (i2) clearInterval(i2)
      if (i3) clearInterval(i3)
    }
  }, [stats])
  
  const toggleReviews = () => {
    setOpenReviews(!openReviews)
  }
  
  const toggleTeachers = () => {
    setOpenTeachers(!openTeachers)
  }

  const togglePrograms = () => {
    setOpenPrograms(!openPrograms)
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        style={{ pointerEvents: 'none' }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay for better readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-0" style={{ pointerEvents: 'none' }}></div>
      
      {/* Content */}
      <div className="relative z-10">
      <div className="mb-12 pt-32 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Xush Kelibsiz UrSPI ning</h1>
        <p className="text-xl text-white/90 drop-shadow-md">O'qituvchilarni baholash tizimiga!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div 
          onClick={() => navigate("faculties")}
          className="card rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/15 transition-colors cursor-pointer"
        >
          <h3 className="text-sm font-medium mb-2 text-white/80">Fakultetlar</h3>
          <p className="text-4xl font-bold text-blue-200">{facultiesCount}</p>
        </div>
        <div 
          onClick={() => navigate("teachers")}
          className="card rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/15 transition-colors cursor-pointer"
        >
          <h3 className="text-sm font-medium mb-2 text-white/80">O'qituvchilar</h3>
          <p className="text-4xl font-bold text-green-200">{teachersCount}</p>
        </div>
        <div className="card rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/15 transition-colors">
          <h3 className="text-sm font-medium mb-2 text-white/80">Sharhlar</h3>
          <p className="text-4xl font-bold text-purple-200">{reviewsCount}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* So'ngi Sharh Button */}
        <div className="w-full md:w-64">
          <button
            onClick={toggleReviews}
            className="w-full outline outline-2 outline-blue-500 hover:outline-blue-600 bg-white/90 hover:bg-white text-slate-900 font-semibold py-4 px-8 rounded-full shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">So'ngi Sharh</span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${openReviews ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {/* Animated Content */}
          <div
            className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
              openReviews ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className={`card transition-all duration-500 ${
              openReviews ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">So'nggi Sharhlar</h2>
              <div className="space-y-4">
                {recentReviews.map((review, i) => (
                    <div 
                      key={i} 
                      className={`border-b border-slate-200 pb-4 last:border-0 transition-all duration-300 ${
                        openReviews 
                          ? 'translate-x-0 opacity-100' 
                          : '-translate-x-4 opacity-0'
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-slate-900">{review.studentName}</p>
                          <p className="text-sm text-slate-500">{review.teacherName}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={review.scores?.overall ?? review.rating ?? 0} size="sm" />
                          <span className="text-yellow-500 font-semibold text-sm">
                            {(review.scores?.overall ?? review.rating ?? 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{review.comment}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Yuqori Baholangan Button */}
        <div className="w-full md:w-64">
          <button
            onClick={toggleTeachers}
            className="w-full outline outline-2 outline-green-500 hover:outline-green-600 bg-white/90 hover:bg-white text-slate-900 font-semibold py-4 px-8 rounded-full shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">Yuqori Baholangan</span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${openTeachers ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {/* Animated Content */}
          <div
            className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
              openTeachers ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className={`card transition-all duration-500 ${
              openTeachers 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-4 opacity-0'
            }`}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Eng Yuqori Baholangan O'qituvchilar</h2>
              <div className="space-y-3">
                {topTeachers.map((teacher, i) => (
                    <div 
                      key={i} 
                      className={`flex justify-between items-center p-2 bg-slate-50 rounded-lg transition-all duration-300 ${
                        openTeachers 
                          ? 'translate-x-0 opacity-100' 
                          : 'translate-x-4 opacity-0'
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      <div>
                        <p className="font-medium text-slate-900">{teacher.name}</p>
                        <p className="text-sm text-slate-500">{teacher.department}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={teacher.avg} size="sm" />
                        <span className="font-bold text-blue-600 text-sm">{teacher.avg}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ta'lim Dasturlari Button */}
        <div className="w-full md:w-96">
          <button
            onClick={togglePrograms}
            className="w-full outline outline-2 outline-purple-500 hover:outline-purple-600 bg-white/90 hover:bg-white text-slate-900 font-semibold py-4 px-8 rounded-full shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">Ta'lim Dasturlari</span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${openPrograms ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {/* Animated Content */}
          <div
            className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
              openPrograms ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className={`card transition-all duration-500 ${
              openPrograms 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-4 opacity-0'
            }`}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Ta'lim Dasturlari</h2>
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {educationPrograms.map((program, pi) => (
                  <div key={pi} className={`transition-all duration-300 ${
                    openPrograms ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`} style={{ transitionDelay: `${pi * 150}ms` }}>
                    <h3 className="font-semibold text-slate-800 mb-2 text-sm bg-slate-100 p-2 rounded-lg">
                      {program.title}
                    </h3>
                    <div className="space-y-1">
                      {program.items.map((item, ii) => (
                        <div
                          key={ii}
                          className="text-sm text-slate-600 py-1 px-3 hover:bg-slate-50 rounded transition-colors"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  )
}
