import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Faculties({ navigate }) {
  const [faculties, setFaculties] = useState([])
  const [departmentCounts, setDepartmentCounts] = useState({})

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fakultetlar ro'yxatini Supabase'dan olish (ustun nomiga qattiq bog'lanmasdan)
        const { data: facultiesData, error: facultiesError } = await supabase
          .from("faculties")
          .select("*")

        if (facultiesError) {
          console.error("Faculties fetch error:", facultiesError)
        } else if (Array.isArray(facultiesData)) {
          // DB dan keladigan snake_case maydonlarni UI uchun camelCase ga moslashtiramiz
          const normalized = facultiesData.map((f) => ({
            id: f.id,
            nameUz: f.name_uz ?? f.nameUz,
            nameRu: f.name_ru ?? f.nameRu,
            description: f.description,
          }))
          setFaculties(normalized)
        }

        // Kafedralar sonini hisoblash uchun departments jadvalini o‘qiymiz
        const { data: departmentsData, error: departmentsError } = await supabase
          .from("departments")
          .select("*")

        if (departmentsError) {
          console.error("Departments fetch error:", departmentsError)
        } else if (Array.isArray(departmentsData)) {
          const counts = {}
          departmentsData.forEach((dept) => {
            const facultyId = dept.faculty_id ?? dept.facultyId
            if (!facultyId) return
            counts[facultyId] = (counts[facultyId] || 0) + 1
          })
          setDepartmentCounts(counts)
        }
      } catch (error) {
        console.error("Failed to load faculties data:", error)
      }
    }
    loadData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Fakultetlar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculties.map((faculty) => {
          const deptCount = departmentCounts[faculty.id] || 0

          return (
            <div
              key={faculty.id}
              onClick={() => navigate("faculty", faculty.id)}
              className="card cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold text-blue-600 mb-2">{faculty.nameUz}</h2>
              {faculty.nameRu && (
                <p className="text-sm text-slate-500 mb-4">{faculty.nameRu}</p>
              )}
              <p className="text-sm text-slate-600">
                <span className="font-medium">{deptCount}</span> ta kafedra
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
