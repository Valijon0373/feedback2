import { Instagram, Send, Github } from "lucide-react"

// Adminlar haqida chiroyli "Biz haqimizda" bo'limi
export default function AboutUsjsx({ isDarkMode }) {
  const admins = [
    {
      name: "Davlatmuratov Valijon",
      role: "Frontend va UI/UX dasturchisi",
      description:
        "Talabalar uchun qulay, tez va zamonaviy interfeys yaratish bilan shug'ullanadi. Dizayn va foydalanuvchi tajribasi bo'yicha mas'ul.",
      avatarColor: "from-purple-500 to-pink-500",
      instagram: "#",
      telegram: "#",
      github: "#",
    },
    {
      name: "Otaboyev Akbar",
      role: "Java Backend dasturchisi",
      description:
        "Ushbu platformani yaratish va texnik infratuzilmasini yo'lga qo'yish rolni bajaradi. Backend va ma'lumotlar bazasi bo'yicha mutaxassis.",
      avatarColor: "from-blue-500 to-cyan-400",
      instagram: "#",
      telegram: "#",
      github: "#",
    },
  ]

  return (
    <div
      className={`w-full transition-colors duration-300 ${
        isDarkMode ? "text-slate-50" : "text-slate-900"
      }`}
    >
      <div
        className={`mb-8 rounded-2xl border px-6 py-6 md:px-8 md:py-7 shadow-sm ${
          isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
        }`}
      >
        <div className="text-center">
          <p
            className={`text-sm md:text-base font-semibold uppercase tracking-[0.25em] mb-3 ${
              isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
            }`}
          >
            UrSPI Feedback platformasi
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            Biz haqimizda
          </h1>
          <p
            className={`mx-auto max-w-3xl text-sm md:text-base ${
              isDarkMode ? "text-[#c4d0db]" : "text-slate-600"
            }`}
          >
            Ushbu admin panel talabalarning o&apos;qituvchilar haqidagi fikr-mulohazalarini
            qulay tarzda yig&apos;ish, tahlil qilish va sifatni oshirish uchun ishlab chiqilgan.
            Quyida loyiha ustida ishlayotgan asosiy administratorlar bilan tanishishingiz mumkin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {admins.map((admin) => (
          <div
            key={admin.name}
            className={`relative overflow-hidden rounded-2xl border shadow-sm group ${
              isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
            }`}
          >
            {/* Gradient background chip */}
            <div
              className="absolute inset-x-6 top-6 h-32 rounded-2xl opacity-70 blur-2xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.3), transparent 60%), radial-gradient(circle at 100% 0%, rgba(236,72,153,0.3), transparent 55%)",
              }}
            />

            <div className="relative p-6 flex flex-col h-full">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`h-14 w-14 rounded-full bg-gradient-to-tr ${admin.avatarColor} flex items-center justify-center text-white font-semibold text-xl shadow-md`}
                >
                  {admin.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-lg font-semibold">{admin.name}</p>
                  <p
                    className={`text-xs font-medium uppercase tracking-wide ${
                      isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                    }`}
                  >
                    {admin.role}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p
                className={`text-sm leading-relaxed mb-5 flex-1 ${
                  isDarkMode ? "text-[#c4d0db]" : "text-slate-600"
                }`}
              >
                {admin.description}
              </p>

              {/* Social links */}
              <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] md:text-xs font-medium ${
                      isDarkMode
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Har doim aloqadamiz
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={admin.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-pink-500 hover:text-pink-600 hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 ${
                      isDarkMode
                        ? "border-[#1a2d3a] bg-[#0e1a22]"
                        : "border-slate-200 bg-white"
                    }`}
                    title="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href={admin.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sky-500 hover:text-sky-600 hover:border-sky-400 hover:bg-sky-50 transition-all duration-200 ${
                      isDarkMode
                        ? "border-[#1a2d3a] bg-[#0e1a22]"
                        : "border-slate-200 bg-white"
                    }`}
                    title="Telegram"
                  >
                    <Send className="h-4 w-4" />
                  </a>
                  <a
                    href={admin.github}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 ${
                      isDarkMode
                        ? "border-[#1a2d3a] bg-[#0e1a22] text-slate-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    title="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


