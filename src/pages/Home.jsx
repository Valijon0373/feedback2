import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home({ navigate }) {
  const [openReviews, setOpenReviews] = useState(false)
  const [openTeachers, setOpenTeachers] = useState(false)
  
  const [stats, setStats] = useState({
    faculties: 0,
    teachers: 0,
    reviews: 0
  })
  
  const [topTeachers, setTopTeachers] = useState([])
  const [recentReviews, setRecentReviews] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get counts
        const { count: facultiesCount } = await supabase.from('faculties').select('*', { count: 'exact', head: true })
        const { count: teachersCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true })
        const { count: reviewsCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true })
        
        setStats({
          faculties: facultiesCount || 0,
          teachers: teachersCount || 0,
          reviews: reviewsCount || 0
        })

        // Get recent reviews
        const { data: reviews } = await supabase
           .from('reviews')
           .select('*')
           .eq('isActive', true)
           .order('date', { ascending: false })
           .limit(5)
        setRecentReviews(reviews || [])

        // Calculate top teachers
        const { data: allTeachers } = await supabase.from('teachers').select('id, name, departmentId')
        const { data: allReviews } = await supabase.from('reviews').select('teacherId, rating, scores').eq('isActive', true)
        
        // Also need departments for teacher info if department name is not stored (it is stored in mockData normalization, but in Supabase we store departmentId)
        // But in the table definition I added `departmentId`. I should probably join.
        // For now, assuming `department` field is not in table (I removed it in SQL), I need to fetch departments to show name.
        const { data: allDepartments } = await supabase.from('departments').select('id, nameUz')

        if (allTeachers && allReviews) {
          const calculatedTop = allTeachers.map(t => {
            const teacherReviews = allReviews.filter(r => r.teacherId === t.id)
            const avg = teacherReviews.length > 0 
              ? teacherReviews.reduce((sum, r) => sum + (r.scores?.overall ?? r.rating ?? 0), 0) / teacherReviews.length
              : 0
            
            const deptName = allDepartments?.find(d => d.id === t.departmentId)?.nameUz || ""

            return { 
              ...t, 
              department: deptName, 
              avg: Number(avg.toFixed(1)), 
              reviewCount: teacherReviews.length 
            }
          })
          .filter(t => t.reviewCount > 0)
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 5)
          
          setTopTeachers(calculatedTop)
        }
      } catch (error) {
        console.error("Error fetching home data:", error)
      }
    }
    
    fetchData()
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
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= Math.round(review.scores?.overall ?? review.rating ?? 0) ? "text-yellow-500" : "text-gray-300"} style={{ fontSize: '0.9em' }}>
                                ★
                              </span>
                            ))}
                          </div>
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
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= Math.round(teacher.avg) ? "text-yellow-500" : "text-gray-300"} style={{ fontSize: '0.9em' }}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="font-bold text-blue-600 text-sm">{teacher.avg}</span>
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
