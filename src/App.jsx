"use client"

import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import LoadingSpinner from "./components/LoadingSpinner"
import Home from "./pages/Home"
import Faculties from "./pages/Faculties"
import Faculty from "./pages/Faculty"
import Department from "./pages/Department"
import Teachers from "./pages/Teachers"
import Teacher from "./pages/Teacher"
import AdminLogin from "./pages/admindashboard/AdminLogin"
import AdminDashboard from "./pages/admindashboard/AdminDashboard"
import { authApi } from "./lib/api"

const hasValidAdminToken = () => {
  if (typeof window === "undefined") return false
  try {
    const raw = window.localStorage.getItem("adminAuth")
    if (!raw) return false
    const auth = JSON.parse(raw)
    const token = auth?.accessToken || auth?.access_token || auth?.token
    return Boolean(token && String(token).trim())
  } catch {
    return false
  }
}

const getPathForPage = (page, id) => {
  switch (page) {
    case "home":
      return "/"
    case "faculties":
      return "/faculties"
    case "teachers":
      return "/teachers"
    case "faculty":
      return id ? `/faculty/${id}` : "/faculties"
    case "department":
      return id ? `/department/${id}` : "/faculties"
    case "teacher":
      return id ? `/teacher/${id}` : "/teachers"
    case "admin":
    case "admin-login":
      return "/admin"
    default:
      return "/"
  }
}

const getStateFromPath = (path, isAdmin) => {
  if (!path) return { page: "home", id: null }

  const normalizedPath = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path

  if (normalizedPath.startsWith("/faculty/")) {
    const [, , facultyId] = normalizedPath.split("/")
    return { page: "faculty", id: facultyId ? Number(facultyId) : null }
  }

  if (normalizedPath.startsWith("/department/")) {
    const [, , departmentId] = normalizedPath.split("/")
    return { page: "department", id: departmentId ? Number(departmentId) : null }
  }

  if (normalizedPath.startsWith("/teacher/")) {
    const [, , teacherId] = normalizedPath.split("/")
    return { page: "teacher", id: teacherId ? Number(teacherId) : null }
  }

  switch (normalizedPath) {
    case "/faculties":
      return { page: "faculties", id: null }
    case "/teachers":
      return { page: "teachers", id: null }
    case "/admin":
      return { page: isAdmin ? "admin" : "admin-login", id: null }
    default:
      return { page: "home", id: null }
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const syncAdminState = (opts = {}) => {
    if (typeof window === "undefined") return
    const { redirectIfLoggedOut = false } = opts

    const adminSession = window.localStorage.getItem("adminSession")
    const hasToken = hasValidAdminToken()
    const nextIsAdmin = Boolean(adminSession) && hasToken

    if (!nextIsAdmin) {
      try {
        window.localStorage.removeItem("adminSession")
      } catch (_) {}
    }

    setIsAdmin(nextIsAdmin)

    if (redirectIfLoggedOut && !nextIsAdmin) {
      setCurrentPage("admin-login")
      setSelectedId(null)
      try {
        window.history.pushState(null, "", "/admin")
      } catch (_) {}
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    syncAdminState()
    const admin = Boolean(window.localStorage.getItem("adminSession")) && hasValidAdminToken()
    const { page, id } = getStateFromPath(window.location.pathname, admin)
    setCurrentPage(page)
    setSelectedId(id)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handlePopState = () => {
      const { page, id } = getStateFromPath(window.location.pathname, isAdmin)
      setCurrentPage(page)
      setSelectedId(id)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isAdmin])

  useEffect(() => {
    if (typeof window === "undefined") return

    const onStorage = (e) => {
      if (e?.key !== "adminAuth" && e?.key !== "adminSession") return
      // If token/session disappears while we're in admin, force login UI.
      syncAdminState({ redirectIfLoggedOut: window.location.pathname.startsWith("/admin") })
    }

    const onAuthChanged = () => {
      syncAdminState({ redirectIfLoggedOut: window.location.pathname.startsWith("/admin") })
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("admin-auth-changed", onAuthChanged)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("admin-auth-changed", onAuthChanged)
    }
  }, [])

  const handleLogout = () => {
    try {
      authApi.logout()
    } catch (_) {}
    localStorage.removeItem("adminSession")
    localStorage.removeItem("adminAuth")
    setIsAdmin(false)
    setCurrentPage("home")
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/")
    }
  }

  const navigate = (page, id = null) => {
    setIsLoading(true)
    
    setTimeout(() => {
      setCurrentPage(page)
      setSelectedId(id)

      if (typeof window !== "undefined") {
        const nextPath = getPathForPage(page, id)
        if (window.location.pathname !== nextPath) {
          window.history.pushState(null, "", nextPath)
        }
      }
      
      setTimeout(() => setIsLoading(false), 300)
    }, 200)
  }

  const showNavbar = currentPage !== "admin" && currentPage !== "admin-login"
  const showFooter = currentPage !== "admin" && currentPage !== "admin-login"

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {isLoading && <LoadingSpinner />}
      {showNavbar && (
        <Navbar currentPage={currentPage} navigate={navigate} isAdmin={isAdmin} onLogout={handleLogout} />
      )}
      <main className={showNavbar ? "max-w-7xl mx-auto px-4 py-8 flex-1 w-full" : "flex-1 w-full"}>
        {currentPage === "home" && <Home navigate={navigate} />}
        {currentPage === "faculties" && <Faculties navigate={navigate} />}
        {currentPage === "faculty" && <Faculty id={selectedId} navigate={navigate} />}
        {currentPage === "department" && <Department id={selectedId} navigate={navigate} />}
        {currentPage === "teachers" && <Teachers navigate={navigate} />}
        {currentPage === "teacher" && <Teacher id={selectedId} navigate={navigate} />}
        {currentPage === "admin-login" && !isAdmin && <AdminLogin navigate={navigate} setIsAdmin={setIsAdmin} />}
        {currentPage === "admin" && isAdmin && <AdminDashboard navigate={navigate} onLogout={handleLogout} />}
      </main>
      {showFooter && <Footer isHome={currentPage === "home"} />}
    </div>
  )
}

export default App
