"use client"

import { useState } from "react"
import { Menu, X, Instagram, Facebook, Youtube, Send } from "lucide-react"

export default function Navbar({ currentPage, navigate }) {
  const isHomePage = currentPage === "home"
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* NAVBAR */}
      <nav className={`${isHomePage ? "bg-white/10 backdrop-blur-md" : "bg-white"} 
        shadow-sm border-b ${isHomePage ? "border-white/20" : "border-slate-200"} z-20`}>
        
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 
              className={`text-2xl font-bold cursor-pointer ${isHomePage ? "text-white" : "text-blue-600"}`}
              onClick={() => navigate("home")}
            >
              UrSPI
            </h1>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex gap-6">
              <button 
                onClick={() => navigate("faculties")}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${isHomePage ? "text-white hover:bg-white/20" : "text-blue-600 hover:bg-blue-50"}`}
              >
                Fakultetlar
              </button>
              <button 
                onClick={() => navigate("teachers")}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${isHomePage ? "text-white hover:bg-white/20" : "text-blue-600 hover:bg-blue-50"}`}
              >
                O'qituvchilar
              </button>

              {/* <button 
                onClick={() => navigate("#")}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${isHomePage ? "text-white hover:bg-white/20" : "text-blue-600 hover:bg-blue-50"}`}
              >
                Talabalar
              </button> */}
            </div>
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <button 
            className="md:hidden text-slate-900"
            onClick={() => setOpen(true)}
          >
            <Menu size={28} className={isHomePage ? "text-white" : "text-slate-800"} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU (Slide from right) */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 shadow-xl transform transition-transform duration-700 z-50 flex flex-col
        ${open ? "translate-x-0" : "translate-x-full"}
        ${isHomePage ? "bg-slate-900/80 backdrop-blur-md border-l border-white/10" : "bg-white"}
        `}
      >
        <div className={`flex justify-between items-center p-4 border-b ${isHomePage ? "border-white/10" : "border-slate-200"}`}>
          <h2 className={`text-xl font-semibold ${isHomePage ? "text-white" : "text-slate-900"}`}>Menyu</h2>
          <button onClick={() => setOpen(false)} className={isHomePage ? "text-white hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}>
            <X size={26} />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-3">
          <button 
            className={`text-lg text-left py-2 px-2 rounded transition-colors
              ${isHomePage ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
            onClick={() => { navigate("home"); setOpen(false); }}
          >
            Asosiy sahifa
          </button>

          <button 
            className={`text-lg text-left py-2 px-2 rounded transition-colors
              ${isHomePage ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
            onClick={() => { navigate("faculties"); setOpen(false); }}
          >
            Fakultetlar
          </button>

          <button 
            className={`text-lg text-left py-2 px-2 rounded transition-colors
              ${isHomePage ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
            onClick={() => { navigate("teachers"); setOpen(false); }}
          >
            O‘qituvchilar
          </button>
        </div>

        {/* SOCIAL ICONS */}
        <div className={`mt-auto p-6 flex justify-center gap-6 ${isHomePage ? "border-t border-white/10" : "border-t border-slate-200"}`}>
          <a href="https://t.me/UrDPI_UZ" className={`transition-colors ${isHomePage ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-blue-500"}`}>
            <Send size={22} />
          </a>
          <a href="https://www.instagram.com/urspi.uz?igsh=b3Bwc2g0YWoxYnZh" className={`transition-colors ${isHomePage ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-pink-600"}`}>
            <Instagram size={22} />
          </a>
          <a href="https://www.facebook.com/people/Urganch-Davlat-Pedagogika-Instituti/pfbid0bPNZR2Wy86C9X3wdZFFYaGfzuShapjc1h92dUG1r324CAopcCRSZrKzXCq4ZnEkEl/?mibextid=LQQJ4d" className={`transition-colors ${isHomePage ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-blue-700"}`}>
            <Facebook size={22} />
          </a>
          <a href="https://www.youtube.com/@urspiurspi" className={`transition-colors ${isHomePage ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-red-600"}`}>
            <Youtube size={22} />
          </a>
        </div>
      </div>

      {/* BACKDROP */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-700
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setOpen(false)}
      ></div>
    </>
  )
}
