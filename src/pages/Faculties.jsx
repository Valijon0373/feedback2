import { useState, useEffect } from "react"
import { mockData } from "../data/mockData"
import { facultiesApi, departmentsApi } from "../lib/api"

export default function Faculties({ navigate }) {
  const [faculties, setFaculties] = useState([])
  const [departmentCounts, setDepartmentCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [facultiesRes, departmentsRes] = await Promise.allSettled([
          facultiesApi.getAll(),
          departmentsApi.getAll(),
        ])
        const facultiesData =
          facultiesRes.status === "fulfilled" && Array.isArray(facultiesRes.value)
            ? facultiesRes.value
            : Array.isArray(mockData.faculties) ? mockData.faculties : []
        const departmentsData =
          departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value)
            ? departmentsRes.value
            : Array.isArray(mockData.departments) ? mockData.departments : []

        setFaculties(facultiesData)

        const counts = {}
        departmentsData.forEach((dept) => {
          const facultyId = dept.facultyId
          if (!facultyId) return
          counts[facultyId] = (counts[facultyId] || 0) + 1
        })
        setDepartmentCounts(counts)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div className="text-center text-slate-600 py-8">Yuklanmoqda...</div>

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
