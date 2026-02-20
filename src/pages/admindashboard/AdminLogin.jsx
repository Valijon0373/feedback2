"use client"

import { useState, useEffect } from "react"
import logo from "../../bg/urspi_new.png"
import { XCircle, Eye, EyeOff } from "lucide-react"

export default function AdminLogin({ navigate, setIsAdmin }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [showError, setShowError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const adminEmail = "admin@urspi.uz"
  const adminPassword = "Admin123!"

  const handleSubmit = (e) => {
    e.preventDefault()

    if (credentials.email === adminEmail && credentials.password === adminPassword) {
      localStorage.setItem(
        "adminSession",
        JSON.stringify({
          email: credentials.email,
          loginTime: new Date().toISOString(),
        }),
      )
      setIsAdmin(true)
      navigate("admin")
    } else {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      {/* Error Modal/Toast */}
      {showError && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px]">
            <XCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-bold text-sm">Xatolik</h3>
              <p className="text-sm">Login yoki Parol noto'g'ri!</p>
            </div>
            <button 
              onClick={() => setShowError(false)}
              className="ml-auto text-red-400 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="UrSPI Logo" className="h-24 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">UrSPI Admin</h1>
          <p className="text-slate-600">Admin foydalanuvchining hissobini kiriting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Login</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Loginni kiriting"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Parol</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 pr-10"
                placeholder="Parolni kiriting"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Kirish
          </button>
        </form>
{/* 
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-slate-900">Login: {adminEmail}</p>
          <p className="text-sm font-medium text-slate-900">Parol: {adminPassword}</p>
        </div> */}
      </div>
    </div>
  )
}
