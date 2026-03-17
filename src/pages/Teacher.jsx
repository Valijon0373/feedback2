"use client"

import { useState, useEffect } from "react"
import { mockData } from "../data/mockData"
import TeacherProfile from "../components/TeacherProfile"
import LoadingSpinner from "../components/LoadingSpinner"
import { teachersApi, departmentsApi } from "../lib/api"

export default function Teacher({ id, navigate }) {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  const getTeacherDepartmentId = (t) =>
    t?.departmentId ?? t?.department_id ?? t?.departmentID ?? t?.department?.id ?? null

  const getDepartmentId = (d) => d?.id ?? d?.departmentId ?? d?.department_id ?? null

  const getDepartmentName = (d) =>
    d?.nameUz ?? d?.name_uz ?? d?.nameUZ ?? d?.name ?? d?.title ?? d?.departmentName ?? d?.department_name ?? ""

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const [teacherRes, teachersRes, departmentsRes] = await Promise.allSettled([
          teachersApi.getById(id),
          teachersApi.getAll(),
          departmentsApi.getAll(),
        ])

        let teacherData = teacherRes.status === "fulfilled" ? teacherRes.value : null
        if (!teacherData) {
          const teachers =
            teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value)
              ? teachersRes.value
              : Array.isArray(mockData.teachers) ? mockData.teachers : []
          teacherData = teachers.find((t) => Number(t.id) === Number(id)) || null
        }

        const departments =
          departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value)
            ? departmentsRes.value
            : Array.isArray(mockData.departments) ? mockData.departments : []

        if (teacherData) {
          const teacherDeptId = getTeacherDepartmentId(teacherData)
          const dept =
            departments.find((d) => Number(getDepartmentId(d)) === Number(teacherDeptId)) || null
          setTeacher({
            ...teacherData,
            department:
              (dept ? getDepartmentName(dept) : "") ||
              teacherData.department ||
              teacherData.departmentName ||
              teacherData.department_name ||
              "",
          })
        } else {
          setTeacher(null)
        }
      } catch (error) {
        console.error("Error fetching teacher:", error)
        setTeacher(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchTeacher()
  }, [id])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!teacher) {
    return <div className="text-center text-slate-600 mt-12">O'qituvchi topilmadi</div>
  }

  return <TeacherProfile teacher={teacher} onBack={() => navigate("teachers")} />
}
