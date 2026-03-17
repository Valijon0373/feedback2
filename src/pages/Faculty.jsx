import { useState, useEffect } from "react"
import { mockData } from "../data/mockData"
import { facultiesApi, departmentsApi } from "../lib/api"

export default function Faculty({ id, navigate }) {
  const [faculty, setFaculty] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setLoading(true)

      try {
        const [facultyRes, facultiesRes, departmentsRes] = await Promise.allSettled([
          facultiesApi.getById(id),
          facultiesApi.getAll(),
          departmentsApi.getAll(),
        ])

        let facultyData = facultyRes.status === "fulfilled" ? facultyRes.value : null
        if (!facultyData) {
          const facultiesData =
            facultiesRes.status === "fulfilled" && Array.isArray(facultiesRes.value)
              ? facultiesRes.value
              : Array.isArray(mockData.faculties) ? mockData.faculties : []
          facultyData = facultiesData.find((f) => Number(f.id) === Number(id)) || null
        }

        setFaculty(facultyData || null)

        const departmentsData =
          departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value)
            ? departmentsRes.value
            : Array.isArray(mockData.departments) ? mockData.departments : []
        const filtered = departmentsData.filter((d) => Number(d.facultyId) === Number(id))
        setDepartments(filtered)
      } catch (error) {
        console.error("Failed to load faculty data:", error)
        setFaculty(null)
        setDepartments([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) return <div className="text-center text-slate-600">Yuklanmoqda...</div>

  if (!faculty) {
    return <div className="text-center text-slate-600">Fakultet topilmadi</div>
  }

  return (
    <div className="space-y-10">
      <button onClick={() => navigate("faculties")} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
        ← Orqaga
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {faculty.nameUz} / Kafedralar
        </h1>
        {faculty.nameRu && <p className="text-lg text-slate-600">{faculty.nameRu}</p>}
      </div>

      <div>
        {departments.length === 0 ? (
          <p className="text-center text-slate-600">Bu fakultetga biriktirilgan kafedralar topilmadi</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {departments.map((department) => (
              <div
                key={department.id}
                onClick={() => navigate("department", department.id)}
                className="card cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all transform hover:-translate-y-1"
              >
                <h2 className="text-xl font-bold text-blue-600 mb-2">{department.nameUz}</h2>
                {department.nameRu && <p className="text-sm text-slate-500 mb-2">{department.nameRu}</p>}
                {department.head && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Rahbari:</span> {department.head}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
