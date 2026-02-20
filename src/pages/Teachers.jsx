import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { supabase } from "../lib/supabase"

export default function Teachers({ navigate }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [teachers, setTeachers] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const fetchData = async () => {
       const { data: t } = await supabase.from('teachers').select('*')
       const { data: r } = await supabase.from('reviews').select('*').eq('isActive', true)
       const { data: d } = await supabase.from('departments').select('id, nameUz')
       
       if (t && r && d) {
         const enrichedTeachers = t.map(teacher => {
           const dept = d.find(dp => dp.id === teacher.departmentId)
           return { ...teacher, department: dept ? dept.nameUz : "" }
         })
         setTeachers(enrichedTeachers)
         setReviews(r)
       }
    }
    fetchData()
  }, [])

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.department || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.specialization || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">O'qituvchilar</h1>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="O'qituvchi izlash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-600"
            />
          </div>
          <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap">
            Qidirish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((teacher) => {
          const teacherReviews = reviews.filter((r) => r.teacherId === teacher.id)
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
                  src={teacher.image || "/placeholder.svg"}
                  alt={teacher.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{teacher.name}</h2>
                <p className="text-sm text-blue-600">{teacher.title}</p>
              </div>
              <p className="text-sm text-slate-600">{teacher.specialization || teacher.department}</p>
              <p className="text-xs text-slate-500">Kafedra: {teacher.department}</p>
              {teacher.experience && <p className="text-xs text-slate-500">Tajriba: {teacher.experience}</p>}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-500">{teacherReviews.length} sharh</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= Math.round(avgRating) ? "text-yellow-500" : "text-gray-300"} style={{ fontSize: '0.9em' }}>
                        ★
                      </span>
                    ))}
                  </div>
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
    </div>
  )
}
