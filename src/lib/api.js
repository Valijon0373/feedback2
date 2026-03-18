

import { mockData as initialMockData } from "../data/mockData"

// Production'da API base URL. Dev'da Vite proxy ishlatamiz (bo'sh = relative /api).
const DEFAULT_API_BASE = "https://feedback.urspi.uz"

export const getBaseUrl = () => {
  try {
    if (typeof import.meta !== "undefined" && import.meta?.env?.DEV) return ""
    const envBase =
      (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE_URL) || ""
    const base = String(envBase || DEFAULT_API_BASE).replace(/\/+$/, "")
    return base || ""
  } catch {
    return DEFAULT_API_BASE
  }
}

// Umumiy rasm URL yasovchi helper:
// Backend quyidagilardan birini qaytarishi mumkin:
//  - to'liq URL: https://feedback.urspi.uz/api/view/images/filename.jpg
//  - nisbiy path: /api/view/images/filename.jpg yoki api/view/images/filename.jpg
//  - faqat fayl nomi: filename.jpg
export const buildImageUrl = (raw) => {
  if (!raw) return ""

  if (/^https?:\/\//i.test(raw)) return raw

  const base = getBaseUrl()

  if (raw.includes("api/view/images/")) {
    const path = raw.startsWith("/") ? raw : `/${raw}`
    return base ? `${base}${path}` : path
  }

  if (raw.startsWith("/")) {
    return base ? `${base}${raw}` : raw
  }

  const path = `/api/view/images/${encodeURIComponent(String(raw))}`
  return base ? `${base}${path}` : path
}

/** Get stored admin auth from localStorage */
const getStoredAdminAuth = () => {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem("adminAuth")
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const getAdminAccessToken = () => {
  const auth = getStoredAdminAuth()
  return auth?.accessToken || auth?.access_token || auth?.token || ""
}

export const getAdminRefreshToken = () => {
  const auth = getStoredAdminAuth()
  return auth?.refreshToken || auth?.refresh_token || ""
}

/** Save admin auth */
export const saveAdminAuth = (data) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem("adminAuth", JSON.stringify(data))
  try {
    window.dispatchEvent(new Event("admin-auth-changed"))
  } catch {
    // ignore
  }
}

/** Clear admin auth */
export const clearAdminAuth = () => {
  if (typeof window === "undefined") return
  window.localStorage.removeItem("adminAuth")
  try {
    window.dispatchEvent(new Event("admin-auth-changed"))
  } catch {
    // ignore
  }
}

const parseJsonSafe = async (res) => {
  try {
    return await res.json()
  } catch {
    return null
  }
}

const apiFetch = async (path, { method = "GET", body, headers, auth = false } = {}) => {
  const base = getBaseUrl()
  const url = base ? `${base}${path}` : path

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData
  // Debug: request body formati (File vs base64)ni ko‘rsatish
  try {
    if (isFormData) {
      const entries = []
      body.forEach((v, k) => {
        const isFile = typeof File !== "undefined" && v instanceof File
        entries.push({
          key: k,
          kind: isFile ? "File" : typeof v,
          name: isFile ? v.name : undefined,
          type: isFile ? v.type : undefined,
          size: isFile ? v.size : undefined,
          preview:
            typeof v === "string"
              ? v.slice(0, 32) + (v.length > 32 ? "…" : "")
              : undefined,
        })
      })
      console.debug("[apiFetch] FormData ->", { url, method, entries })
    } else if (typeof body === "object" && body) {
      // if someone accidentally sends base64 in JSON, this helps spot it
      const json = JSON.stringify(body)
      const looksLikeBase64Image = json.includes("data:image/")
      if (looksLikeBase64Image) {
        console.debug("[apiFetch] JSON contains data:image/... (base64) ->", { url, method })
      }
    }
  } catch {
    // ignore debug failures
  }
  const finalHeaders = { ...(headers || {}) }

  // If caller didn't specify, keep response parsing expectation.
  if (!finalHeaders.Accept) finalHeaders.Accept = "application/json"

  // Only set JSON content type when sending JSON (never for FormData).
  if (!isFormData && body && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json"
  }

  if (auth) {
    const token = getAdminAccessToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include",
  })

  if (!res.ok) {
    const data = await parseJsonSafe(res)
    const rawMsg =
      data?.message ||
      data?.error ||
      data?.detail ||
      (typeof data === "string" ? data : null) ||
      `HTTP ${res.status}`

    // If auth is required but token is missing/invalid/expired, clear stored auth to force re-login.
    if (auth && res.status === 401) {
      try {
        clearAdminAuth()
      } catch {
        // ignore
      }
    }

    const msg =
      res.status === 401 && auth
        ? "Avtorizatsiya kerak. Admin panelga qayta login qiling."
        : rawMsg

    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return await parseJsonSafe(res)
}

const hasAdminToken = () => {
  const token = getAdminAccessToken()
  return !!(token && String(token).trim())
}

/**
 * Try public call first (no Bearer), then retry with Bearer if available.
 * Useful for endpoints that are public in some deployments but protected in others.
 */
const apiFetchPublicThenAuth = async (path, opts = {}) => {
  try {
    return await apiFetch(path, { ...(opts || {}), auth: false })
  } catch (e) {
    const status = e?.status
    const canRetry = (status === 401 || status === 403 || status === 404) && hasAdminToken()
    if (!canRetry) throw e
    return await apiFetch(path, { ...(opts || {}), auth: true })
  }
}

// In‑memory "database" (with optional localStorage persistence)
const loadState = () => {
  if (typeof window === "undefined") return { ...initialMockData }
  try {
    const raw = window.localStorage.getItem("mockApiData")
    if (!raw) return { ...initialMockData }
    const parsed = JSON.parse(raw)
    return {
      faculties: parsed.faculties || [],
      departments: parsed.departments || [],
      teachers: parsed.teachers || [],
      reviews: parsed.reviews || [],
    }
  } catch {
    return { ...initialMockData }
  }
}

let state = loadState()

const persistState = () => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem("mockApiData", JSON.stringify(state))
  } catch {
    // ignore
  }
}

const nextId = (items) => {
  if (!items.length) return 1
  return Math.max(...items.map((x) => Number(x.id) || 0)) + 1
}

///////////////////////////
//// FACULTIES "API"
///////////////////////////

const unwrapList = (data) => {
  if (!data) return null
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.result)) return data.result
  if (Array.isArray(data?.items)) return data.items
  return null
}

const unwrapOne = (data) => {
  if (!data) return null
  if (Array.isArray(data)) return data[0] ?? null
  return data?.data ?? data?.content ?? data?.result ?? data
}

const getDeptNameAny = (d) =>
  d?.nameUz ??
  d?.name_uz ??
  d?.nameUZ ??
  d?.departmentNameUz ??
  d?.department_name_uz ??
  d?.departmentName ??
  d?.department_name ??
  d?.name ??
  d?.title ??
  ""

const normalizeTeacherPublic = (t, { departmentIdByNameUz = new Map(), defaultDepartmentId } = {}) => {
  if (!t) return t
  const name = t.fullName ?? t.name ?? ""
  const title = t.position ?? t.title ?? ""
  const imageUrl = t.imageLink ?? t.imageUrl ?? t.image ?? t.photo ?? t.avatar ?? ""
  const departmentNameUz =
    t.departmentNameUz ??
    t.department_name_uz ??
    t.departmentName ??
    t.department_name ??
    t.department ??
    t.kafedra ??
    t.chair ??
    ""
  const key = String(departmentNameUz || "").trim().toLowerCase()
  const departmentId = defaultDepartmentId ?? (key ? departmentIdByNameUz.get(key) : undefined)

  return {
    ...t,
    id: t.id ?? t.teacherId ?? t.teacher_id,
    name,
    title,
    imageUrl,
    department: departmentNameUz,
    departmentId: departmentId ?? t.departmentId ?? t.department_id,
  }
}

export const facultiesApi = {
  getAll: async () => {
    try {
      const data = await apiFetch(hasAdminToken() ? "/api/faculties" : "/api/view/faculties", {
        method: "GET",
        auth: hasAdminToken(),
      })
      const list = unwrapList(data)
      if (list) return list
      // Some backends return {faculties: []}
      if (Array.isArray(data?.faculties)) return data.faculties
      return Array.isArray(data) ? data : [...state.faculties]
    } catch {
      return [...state.faculties]
    }
  },

  getById: async (id) => {
    try {
      // Public API does not expose "faculty by id" directly; use list fallback.
      if (!hasAdminToken()) {
        const all = await facultiesApi.getAll()
        return all.find((f) => Number(f.id) === Number(id)) || null
      }

      const data = await apiFetch(`/api/faculties/${id}`, { method: "GET", auth: true })
      return unwrapOne(data) || null
    } catch {
      return state.faculties.find((f) => Number(f.id) === Number(id)) || null
    }
  },

  save: async (body) => {
    try {
      const data = await apiFetch("/api/faculties/save", {
        method: "POST",
        body,
        auth: true,
      })
      const created = unwrapOne(data) || data
      // Keep local state in sync for pages that still read from it.
      if (created && (created.id ?? created.facultyId ?? created.faculty_id)) {
        const createdId = created.id ?? created.facultyId ?? created.faculty_id
        const normalized = { ...created, id: createdId }
        const exists = state.faculties.some((f) => Number(f.id) === Number(createdId))
        state.faculties = exists ? state.faculties : [...state.faculties, normalized]
        persistState()
      }
      return created
    } catch {
      // Fallback to local-only mode
      const id = nextId(state.faculties)
      const faculty = { id, ...body }
      state.faculties = [...state.faculties, faculty]
      persistState()
      return faculty
    }
  },

  update: async (id, body) => {
    try {
      const data = await apiFetch(`/api/faculties/update/${id}`, {
        method: "PUT",
        body,
        auth: true,
      })
      const updated = unwrapOne(data) || data
      const idx = state.faculties.findIndex((f) => Number(f.id) === Number(id))
      if (idx !== -1) {
        state.faculties[idx] = { ...state.faculties[idx], ...body, ...(updated || {}) }
        persistState()
      }
      return updated
    } catch {
      const idx = state.faculties.findIndex((f) => Number(f.id) === Number(id))
      if (idx === -1) return null
      state.faculties[idx] = { ...state.faculties[idx], ...body }
      persistState()
      return state.faculties[idx]
    }
  },

  delete: async (id) => {
    try {
      await apiFetch(`/api/faculties/delete/${id}`, { method: "DELETE", auth: true })
    } finally {
      state.faculties = state.faculties.filter((f) => Number(f.id) !== Number(id))
      persistState()
    }
    return true
  },
}

///////////////////////////
//// DEPARTMENTS "API"
///////////////////////////

export const departmentsApi = {
  getAll: async () => {
    try {
      // Public pages should use /api/view/departments (no Bearer).
      // Admin pages should use /api/departments (Bearer required).
      // Some deployments may restrict /api/view/* or disable it; in that case, if we have a token, retry protected endpoint.
      const token = getAdminAccessToken()
      const hasToken = !!(token && String(token).trim())

      let data
      try {
        data = await apiFetch(hasToken ? "/api/departments" : "/api/view/departments", {
          method: "GET",
          auth: hasToken,
        })
      } catch (e) {
        const status = e?.status
        const canRetryProtected = (status === 401 || status === 403 || status === 404) && hasToken
        if (!canRetryProtected) throw e
        data = await apiFetch("/api/departments", { method: "GET", auth: true })
      }
      const list = unwrapList(data)
      if (list) return list
      if (Array.isArray(data?.departments)) return data.departments
      return Array.isArray(data) ? data : [...state.departments]
    } catch {
      return [...state.departments]
    }
  },

  getById: async (id) => {
    try {
      // Public API doesn't list department by id directly; use list fallback.
      if (!hasAdminToken()) {
        const all = await departmentsApi.getAll()
        return all.find((d) => Number(d.id) === Number(id)) || null
      }

      const data = await apiFetch(`/api/departments/${id}`, { method: "GET", auth: true })
      return unwrapOne(data) || null
    } catch {
      return state.departments.find((d) => Number(d.id) === Number(id)) || null
    }
  },

  getByFacultyId: async (facultyId) => {
    const local = state.departments.filter((d) => Number(d.facultyId) === Number(facultyId))
    try {
      const data = await apiFetch(
        hasAdminToken()
          ? `/api/departments/faculty/${facultyId}`
          : `/api/view/faculties/${facultyId}/departments`,
        { method: "GET", auth: hasAdminToken() },
      )
      const list = unwrapList(data)
      if (list) return list
      if (Array.isArray(data?.departments)) return data.departments
      return Array.isArray(data) ? data : local
    } catch {
      return local
    }
  },

  save: async (body) => {
    try {
      const data = await apiFetch("/api/departments/save", {
        method: "POST",
        body,
        auth: true,
      })
      const created = unwrapOne(data) || data
      const createdId = created?.id ?? created?.departmentId ?? created?.department_id ?? null
      if (createdId != null) {
        const normalized = { ...created, id: createdId }
        const exists = state.departments.some((d) => Number(d.id) === Number(createdId))
        state.departments = exists ? state.departments : [...state.departments, normalized]
        persistState()
      }
      return created
    } catch {
      const id = nextId(state.departments)
      const department = { id, ...body }
      state.departments = [...state.departments, department]
      persistState()
      return department
    }
  },

  update: async (id, body) => {
    try {
      const data = await apiFetch(`/api/departments/update/${id}`, {
        method: "PUT",
        body,
        auth: true,
      })
      const updated = unwrapOne(data) || data
      const idx = state.departments.findIndex((d) => Number(d.id) === Number(id))
      if (idx !== -1) {
        state.departments[idx] = { ...state.departments[idx], ...body, ...(updated || {}) }
        persistState()
      }
      return updated
    } catch {
      const idx = state.departments.findIndex((d) => Number(d.id) === Number(id))
      if (idx === -1) return null
      state.departments[idx] = { ...state.departments[idx], ...body }
      persistState()
      return state.departments[idx]
    }
  },

  delete: async (id) => {
    try {
      await apiFetch(`/api/departments/delete/${id}`, { method: "DELETE", auth: true })
    } finally {
      state.departments = state.departments.filter((d) => Number(d.id) !== Number(id))
      persistState()
    }
    return true
  },
}

///////////////////////////
//// TEACHERS "API"
///////////////////////////

export const teachersApi = {
  getAll: async () => {
    try {
      const data = await apiFetch(hasAdminToken() ? "/api/teachers" : "/api/view/teachers/all", {
        method: "GET",
        auth: hasAdminToken(),
      })
      const list = unwrapList(data)
      if (list) {
        if (!hasAdminToken()) {
          const departments = await departmentsApi.getAll()
          const map = new Map(
            (Array.isArray(departments) ? departments : [])
              .map((d) => [String(getDeptNameAny(d)).trim().toLowerCase(), d.id])
              .filter(([k]) => k),
          )
          return list.map((t) => normalizeTeacherPublic(t, { departmentIdByNameUz: map }))
        }
        return list
      }
      if (Array.isArray(data?.teachers)) return data.teachers
      return Array.isArray(data) ? data : [...state.teachers]
    } catch {
      return [...state.teachers]
    }
  },

  getById: async (id) => {
    try {
      const data = await apiFetch(hasAdminToken() ? `/api/teachers/${id}` : `/api/view/teachers/${id}`, {
        method: "GET",
        auth: hasAdminToken(),
      })
      const one = unwrapOne(data) || null
      if (!one) return null
      if (!hasAdminToken()) {
        const departments = await departmentsApi.getAll()
        const map = new Map(
          (Array.isArray(departments) ? departments : [])
            .map((d) => [String(getDeptNameAny(d)).trim().toLowerCase(), d.id])
            .filter(([k]) => k),
        )
        return normalizeTeacherPublic(one, { departmentIdByNameUz: map })
      }
      return one
    } catch {
      return state.teachers.find((t) => Number(t.id) === Number(id)) || null
    }
  },

  getByDepartmentId: async (departmentId) => {
    const local = state.teachers.filter((t) => Number(t.departmentId) === Number(departmentId))
    try {
      const data = await apiFetch(
        hasAdminToken()
          ? `/api/teachers/department/${departmentId}`
          : `/api/view/departments/${departmentId}/teachers`,
        { method: "GET", auth: hasAdminToken() },
      )
      const list = unwrapList(data)
      if (list) {
        if (!hasAdminToken()) {
          return list.map((t) => normalizeTeacherPublic(t, { defaultDepartmentId: Number(departmentId) }))
        }
        return list
      }
      if (Array.isArray(data?.teachers)) return data.teachers
      return Array.isArray(data) ? data : local
    } catch {
      return local
    }
  },

  // save: async (body) => {
  //   // Agar admin login qilmagan bo'lsa (token yo'q) – to'g'ridan‑to'g'ri local xotirada saqlaymiz,
  //   // backendga so'rov yubormaymiz (401 xatolarini oldini olish uchun).
  //   const token = getAdminAccessToken()
  //   if (!token) {
  //     const id = nextId(state.teachers)
  //     const teacher = { id, ...body }
  //     state.teachers = [...state.teachers, teacher]
  //     state.reviews = state.reviews || []
  //     persistState()
  //     return teacher
  //   }

  //   try {
  //     const data = await apiFetch("/api/teachers/save", {
  //       method: "POST",
  //       body,
  //       auth: true,
  //     })
  //     const created = unwrapOne(data) || data
  //     const createdId = created?.id ?? created?.teacherId ?? created?.teacher_id ?? null
  //     if (createdId != null) {
  //       const normalized = { ...created, id: createdId }
  //       const exists = state.teachers.some((t) => Number(t.id) === Number(createdId))
  //       state.teachers = exists ? state.teachers : [...state.teachers, normalized]
  //       state.reviews = state.reviews || []
  //       persistState()
  //     }
  //     return created
  //   } catch {
  //     const id = nextId(state.teachers)
  //     const teacher = { id, ...body }
  //     state.teachers = [...state.teachers, teacher]
  //     state.reviews = state.reviews || []
  //     persistState()
  //     return teacher
  //   }
  // },

  save: async (body) => {
  const token = getAdminAccessToken()

  const formData = body instanceof FormData ? body : new FormData()

  if (!(body instanceof FormData)) {
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })
  }
   console.log(body)

  if (!token) {
    const id = nextId(state.teachers)

    const teacher = { id }
    formData.forEach((v, k) => (teacher[k] = v))

    state.teachers = [...state.teachers, teacher]
    persistState()

    return teacher
  }

  const data = await apiFetch("/api/teachers/save", {
    method: "POST",
    body: formData,
    auth: true,
  })
  console.log("API javobi (o‘qilgan):", data)
  console.log(body)

  return unwrapOne(data) || data
},


  update: async (id, body) => {
    // Token bo'lmasa, faqat local state orqali yangilaymiz.
    const token = getAdminAccessToken()
    if (!token) {
      const idx = state.teachers.findIndex((t) => Number(t.id) === Number(id))
      if (idx === -1) return null
      state.teachers[idx] = { ...state.teachers[idx], ...body }
      persistState()
      return state.teachers[idx]
    }

    try {
      const data = await apiFetch(`/api/teachers/update/${id}`, {
        method: "PUT",
        body,
        auth: true,
      })
      const updated = unwrapOne(data) || data
      const idx = state.teachers.findIndex((t) => Number(t.id) === Number(id))
      if (idx !== -1) {
        state.teachers[idx] = { ...state.teachers[idx], ...body, ...(updated || {}) }
        persistState()
      }
      return updated
    } catch {
      const idx = state.teachers.findIndex((t) => Number(t.id) === Number(id))
      if (idx === -1) return null
      state.teachers[idx] = { ...state.teachers[idx], ...body }
      persistState()
      return state.teachers[idx]
    }
  },

  delete: async (id) => {
    // Token yo'q bo'lsa, faqat local state'dan o'chiramiz.
    const token = getAdminAccessToken()
    if (!token) {
      state.teachers = state.teachers.filter((t) => Number(t.id) !== Number(id))
      state.reviews = state.reviews.filter((r) => Number(r.teacherId) !== Number(id))
      persistState()
      return true
    }

    try {
      await apiFetch(`/api/teachers/delete/${id}`, { method: "DELETE", auth: true })
    } finally {
      state.teachers = state.teachers.filter((t) => Number(t.id) !== Number(id))
      state.reviews = state.reviews.filter((r) => Number(r.teacherId) !== Number(id))
      persistState()
    }
    return true
  },
}

///////////////////////////
//// REVIEWS "API"
///////////////////////////

export const reviewsApi = {
  // Swagger FeedBackResponse -> UI review shape normalizer
  _normalize: (fb, { teacherId } = {}) => {
    if (!fb || typeof fb !== "object") return fb
    const anonymousInt = fb.anonymous
    const anonymous = anonymousInt === 1 || anonymousInt === true
    const ball1 = fb.ball1 ?? fb.ball_1 ?? fb.score1
    const ball2 = fb.ball2 ?? fb.ball_2 ?? fb.score2
    const ball3 = fb.ball3 ?? fb.ball_3 ?? fb.score3
    const ball4 = fb.ball4 ?? fb.ball_4 ?? fb.score4
    const overall =
      fb.midScore != null
        ? Number(fb.midScore)
        : Number(((Number(ball1 || 0) + Number(ball2 || 0) + Number(ball3 || 0) + Number(ball4 || 0)) / 4).toFixed(1))

    const teacherName =
      fb.teacherFullName ??
      fb.teacherName ??
      fb.teacher_full_name ??
      fb.teacher?.fullName ??
      fb.teacher?.name ??
      ""

    return {
      id: fb.id ?? fb.feedBackId ?? fb.feedbackId,
      teacherId: teacherId ?? fb.teacherId ?? fb.teacher_id,
      teacherName,
      studentName: fb.name ?? fb.studentName ?? fb.student_name ?? (anonymous ? "Anonim talaba" : ""),
      anonymous,
      comment: fb.comment ?? fb.text ?? "",
      rating: overall,
      // Admin UI expects isActive to be truthy for visible reviews.
      // Backend schema doesn't include it, so default to true unless explicitly false.
      isActive: fb.isActive ?? fb.active ?? fb.status === "DELETED" ? false : true,
      scores: {
        knowledge: Number(ball1 ?? 0),
        teaching: Number(ball2 ?? 0),
        communication: Number(ball3 ?? 0),
        engagement: Number(ball4 ?? 0),
        overall,
      },
      // Backend doesn't provide timestamps in schema; keep any extra fields if present
      ...fb,
    }
  },

  getAll: async () => {
    try {
      // Swagger: GET /api/feedbacks (odatda admin uchun). Public bo'lsa ham 401 bo'lishi mumkin,
      // shuning uchun public -> auth retry ishlatamiz.
      const data = await apiFetchPublicThenAuth("/api/feedbacks", { method: "GET" })
      const list = unwrapList(data)
      if (list) return list.map((x) => reviewsApi._normalize(x))
      if (Array.isArray(data?.feedbacks)) return data.feedbacks
      return Array.isArray(data) ? data : [...state.reviews]
    } catch {
      return [...state.reviews]
    }
  },

  getById: async (id) => {
    try {
      const data = await apiFetchPublicThenAuth(`/api/feedbacks/${id}`, { method: "GET" })
      const one = unwrapOne(data)
      return one || null
    } catch {
      return state.reviews.find((r) => Number(r.id) === Number(id)) || null
    }
  },

  getByTeacherId: async (teacherId) => {
    const local = state.reviews.filter((r) => Number(r.teacherId) === Number(teacherId))
    try {
      // Some backends expose public feedback list as:
      // GET /api/view/teachers/{teachersId}/feedbacks   (Swagger screenshot)
      // Others expose (often protected):
      // GET /api/feedbacks/teacher/{teacherId}
      const candidates = [
        `/api/view/teachers/${encodeURIComponent(String(teacherId))}/feedbacks`,
        `/api/feedbacks/teacher/${encodeURIComponent(String(teacherId))}`,
      ]

      let lastErr = null
      for (const path of candidates) {
        try {
          const data = await apiFetchPublicThenAuth(path, { method: "GET" })
          const list = unwrapList(data)
          if (list) return list.map((x) => reviewsApi._normalize(x, { teacherId }))
          if (Array.isArray(data?.feedbacks)) return data.feedbacks.map((x) => reviewsApi._normalize(x, { teacherId }))
          if (Array.isArray(data)) return data.map((x) => reviewsApi._normalize(x, { teacherId }))
        } catch (e) {
          lastErr = e
        }
      }

      if (lastErr) throw lastErr
      return local
    } catch {
      return local
    }
  },

  save: async (body) => {
    try {
      // Swagger: POST /api/view/send/{teacherId}/feedback (public endpoint)
      // Body: FeedBackDTO => { name, anonymous(0/1), ball1..ball4, comment }
      const raw = body && typeof body === "object" ? body : {}
      const teacherId =
        raw.teacherId ?? raw.teacher_id ?? raw.teacherID ?? raw.teacher ?? raw.teacher?.id ?? null
      if (teacherId == null) throw new Error("teacherId topilmadi")

      const name =
        raw.studentName ?? raw.student_name ?? raw.reviewer_name ?? raw.name ?? (raw.anonymous ? "Anonim talaba" : "")
      const anonymousBool = Boolean(raw.anonymous ?? raw.isAnonymous ?? raw.is_anonymous)
      const comment = raw.comment ?? raw.text ?? raw.message ?? ""

      const scores = raw.scores && typeof raw.scores === "object" ? raw.scores : {}
      const ball1 = scores.knowledge ?? raw.ball1 ?? raw.knowledge ?? 5
      const ball2 = scores.teaching ?? raw.ball2 ?? raw.teaching ?? 5
      const ball3 = scores.communication ?? raw.ball3 ?? raw.communication ?? 5
      const ball4 = scores.engagement ?? scores.approachability ?? raw.ball4 ?? raw.engagement ?? 5

      const payload = {
        name: String(name || "").trim() || "Anonim talaba",
        anonymous: anonymousBool ? 1 : 0,
        ball1: Number(ball1) || 0,
        ball2: Number(ball2) || 0,
        ball3: Number(ball3) || 0,
        ball4: Number(ball4) || 0,
        comment: String(comment || ""),
      }

      const data = await apiFetch(`/api/view/send/${encodeURIComponent(String(teacherId))}/feedback`, {
        method: "POST",
        body: payload,
        auth: false,
      })

      const created = unwrapOne(data) || data
      const createdId =
        created?.id ?? created?.feedbackId ?? created?.feedBackId ?? created?.feedback_id ?? null

      const review = {
        teacherId,
        studentName: payload.name,
        anonymous: anonymousBool,
        comment: payload.comment,
        scores: {
          knowledge: payload.ball1,
          teaching: payload.ball2,
          communication: payload.ball3,
          engagement: payload.ball4,
          overall: Number(((payload.ball1 + payload.ball2 + payload.ball3 + payload.ball4) / 4).toFixed(1)),
        },
        rating:
          created?.midScore != null
            ? Number(created.midScore)
            : Number(((payload.ball1 + payload.ball2 + payload.ball3 + payload.ball4) / 4).toFixed(1)),
        ...created,
        id: createdId != null ? createdId : nextId(state.reviews),
      }

      state.reviews = [...state.reviews, review]
      persistState()

      return review
    } catch {
      // Agar backend ishlamasa, local "offline" rejimda saqlaymiz
      const id = nextId(state.reviews)
      const review = { id, ...body }
      state.reviews = [...state.reviews, review]
      persistState()
      return review
    }
  },

  delete: async (id) => {
    try {
      // Swagger: DELETE /api/feedbacks/{feedbackId} (odatda admin uchun). Token bo'lsa Bearer bilan ishlaydi.
      await apiFetchPublicThenAuth(`/api/feedbacks/${id}`, { method: "DELETE" })
    } finally {
      state.reviews = state.reviews.filter((r) => Number(r.id) !== Number(id))
      persistState()
    }
    return true
  },
}

///////////////////////////
//// UPLOAD "API"
///////////////////////////

export const uploadApi = {
  uploadFile: async (file) => {
    if (!file) return ""

    const token = getAdminAccessToken()
    if (!token || !String(token).trim()) {
      throw new Error("Rasm yuklash uchun admin sifatida login qilish kerak (token topilmadi).")
    }

    const form = new FormData()
    // Swagger: File (binary) — odatda field nomi `file` bo‘ladi.
    form.append("file", file)

    console.debug("[upload] sending multipart/form-data", {
      isFile: typeof File !== "undefined" && file instanceof File,
      name: file?.name,
      type: file?.type,
      size: file?.size,
      formKeys: Array.from(form.keys()),
      fileEntryIsFile: (() => {
        const v = form.get("file")
        return typeof File !== "undefined" && v instanceof File
      })(),
    })

    const data = await apiFetch("/api/upload", {
      method: "POST",
      body: form,
      auth: true,
    })

    // Backend odatda fayl nomini qaytaradi; rasmni ko‘rish uchun
    // GET /api/view/images/{filename} endpointidan foydalanamiz.
    const directUrl =
      data?.url ||
      data?.fileUrl ||
      data?.file_url ||
      data?.data?.url ||
      data?.data?.fileUrl ||
      (typeof data === "string" ? data : "")

    let viewUrl = ""

    if (directUrl && /^https?:\/\//i.test(directUrl)) {
      // Agar backend to‘g‘ridan‑to‘g‘ri to‘liq URL qaytarsa, shuni ishlatamiz.
      viewUrl = directUrl
    } else {
      const filename =
        data?.fileName ||
        data?.filename ||
        data?.name ||
        data?.file ||
        directUrl

      if (filename) {
        const base = getBaseUrl()
        const path = `/api/view/images/${encodeURIComponent(String(filename))}`
        viewUrl = base ? `${base}${path}` : path
      }
    }

    if (!viewUrl) {
      const err = new Error("Upload javobidan rasm URL yoki filename topilmadi")
      err.data = data
      throw err
    }

    return viewUrl
  },
}

///////////////////////////
//// AUTH "API"
///////////////////////////

export const authApi = {
  /** Login  backend */
  login: async ({ username, password }) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    })

    const accessToken = data?.accessToken || data?.access_token || data?.token || ""
    const refreshToken = data?.refreshToken || data?.refresh_token || ""

    if (!accessToken || !String(accessToken).trim()) {
      const err = new Error("Token kelmadi. Login server javobini tekshiring.")
      err.data = data
      throw err
    }

    const loginTime = new Date().toISOString()
    const payload = {
      accessToken,
      refreshToken,
      user: data?.user || { username },
      loginTime,
    }
    saveAdminAuth(payload)
    return payload
  },

  /** Logout */
  logout: async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        body: getAdminRefreshToken() ? { refreshToken: getAdminRefreshToken() } : undefined,
        auth: true,
      })
    } finally {
      clearAdminAuth()
    }
  },

  /** Refresh token */
  refresh: async (refreshToken) => {
    const tokenToUse = refreshToken || getAdminRefreshToken()
    const data = await apiFetch("/api/auth/refresh", {
      method: "POST",
      body: tokenToUse ? { refreshToken: tokenToUse } : undefined,
      auth: true,
    })

    const accessToken = data?.accessToken || data?.access_token || data?.token || ""
    const newRefreshToken = data?.refreshToken || data?.refresh_token || tokenToUse || ""

    if (accessToken && String(accessToken).trim()) {
      const current = getStoredAdminAuth() || {}
      const next = {
        ...current,
        accessToken,
        refreshToken: newRefreshToken,
      }
      saveAdminAuth(next)
      return next
    }

    return data
  },
}