import { Eye, Pencil, Plus, Trash2, X, Search } from "lucide-react"

export default function DepartamentTable({
  isDarkMode,
  faculties,
  departments,
  departmentForm,
  editingDepartmentId,
  showDepartmentForm,
  viewDepartment,
  showDeleteDepartmentConfirm,
  departmentSearchQuery,
  departmentSearchTerm,
  setDepartmentFormState,
  setShowDepartmentForm,
  setViewDepartment,
  setDepartmentSearchQuery,
  setDepartmentSearchTerm,
  setShowDeleteDepartmentConfirm,
  setDeleteDepartmentId,
  handleAddDepartment,
  handleViewDepartment,
  handleEditDepartment,
  handleDeleteDepartment,
  confirmDeleteDepartment,
}) {
  return (
    <>
      {/* View Department Modal */}
      {viewDepartment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewDepartment(null)}
          style={{
            animation: "fadeIn 0.3s ease-in-out forwards",
          }}
        >
          <div
            className={`${
              isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
            } border rounded-xl p-6 w-full max-w-md relative`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "slideUp 0.3s ease-out forwards",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Kafedra ma&apos;lumotlari
              </h2>
              <button
                onClick={() => setViewDepartment(null)}
                className={`transition-colors ${
                  isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <p
                className={`font-semibold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {viewDepartment.nameUz}
              </p>
              {viewDepartment.nameRu && (
                <p
                  className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                  }`}
                >
                  {viewDepartment.nameRu}
                </p>
              )}
              {viewDepartment.facultyName && (
                <p
                  className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                  }`}
                >
                  Fakultet: <span className="font-medium">{viewDepartment.facultyName}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Department Form Modal */}
      {showDepartmentForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowDepartmentForm(false)
            setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
          }}
          style={{
            animation: "fadeIn 0.3s ease-in-out forwards",
          }}
        >
          <div
            className={`${
              isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
            } border rounded-xl p-6 w-full max-w-md relative`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "slideUp 0.3s ease-out forwards",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {editingDepartmentId ? "Kafedrani Tahrirlash" : "Yangi Kafedra Qo'shish"}
              </h2>
              <button
                onClick={() => {
                  setShowDepartmentForm(false)
                  setEditingDepartmentId(null)
                  setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
                }}
                className={`transition-colors ${
                  isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Kafedra nomi (O&apos;zbek)
                </label>
                <input
                  type="text"
                  value={departmentForm.nameUz}
                  onChange={(e) =>
                    setDepartmentFormState((prev) => ({
                      ...prev,
                      nameUz: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Masalan: Dasturlash kafedrasi"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Kafedra nomi (Rus)
                </label>
                <input
                  type="text"
                  value={departmentForm.nameRu}
                  onChange={(e) =>
                    setDepartmentFormState((prev) => ({
                      ...prev,
                      nameRu: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Кафедра программирования"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Fakultetni tanlang
                </label>
                <select
                  value={departmentForm.facultyId}
                  onChange={(e) =>
                    setDepartmentFormState((prev) => ({
                      ...prev,
                      facultyId: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="">Fakultet tanlang</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.nameUz}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {editingDepartmentId ? "Yangilash" : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDepartmentForm(false)
                    setEditingDepartmentId(null)
                    setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
                  }}
                  className={`px-4 py-2 border rounded-xl font-medium transition-all duration-200 ${
                    isDarkMode
                      ? "border-[#1a2d3a] text-white hover:bg-[#1a2d3a]"
                      : "border-slate-300 text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments List + Delete Confirmation + Search */}
      <div className="w-full">
        <div
          className={`${
            isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
          } border rounded-lg p-6 transition-colors duration-300`}
        >
          {/* Delete Department Confirmation Modal */}
          {showDeleteDepartmentConfirm && (
            <div
              className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowDeleteDepartmentConfirm(false)
                setDeleteDepartmentId(null)
              }}
              style={{
                animation: "fadeIn 0.3s ease-in-out forwards",
              }}
            >
              <div
                className={`${
                  isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
                } border rounded-xl p-6 w-full max-w-md relative`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  animation: "slideUp 0.3s ease-out forwards",
                }}
              >
                <div className="mb-6">
                  <h2
                    className={`text-xl font-bold transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Kafedrani o&apos;chirishni tasdiqlaysizmi?
                  </h2>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDeleteDepartment}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Ha
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteDepartmentConfirm(false)
                      setDeleteDepartmentId(null)
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Yo&apos;q
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Kafedralar Ro&apos;yxati
            </h2>
            <button
              onClick={() => {
                setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
                setShowDepartmentForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Qo&apos;shish
            </button>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-400"
                  }`}
                />
                <input
                  type="text"
                  value={departmentSearchQuery}
                  onChange={(e) => setDepartmentSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      setDepartmentSearchTerm(departmentSearchQuery)
                    }
                  }}
                  placeholder="Kafedra qidirish..."
                  className={`w-full pl-10 pr-4 py-2.5 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-600 transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] text-white placeholder:text-[#8b9ba8]"
                      : "bg-white text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => setDepartmentSearchTerm(departmentSearchQuery)}
                className="px-6 py-2.5 border-2 border-blue-500 text-blue-500 rounded-full font-medium hover:bg-blue-500 hover:text-white transition-all duration-200 whitespace-nowrap"
              >
                Qidirish
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {departments
              .filter((department) => {
                if (!departmentSearchTerm.trim()) return true
                const query = departmentSearchTerm.toLowerCase()
                const faculty = faculties.find((f) => Number(f.id) === Number(department.facultyId))
                return (
                  department.nameUz.toLowerCase().includes(query) ||
                  (department.nameRu && department.nameRu.toLowerCase().includes(query)) ||
                  (faculty && faculty.nameUz.toLowerCase().includes(query))
                )
              })
              .map((department) => {
                const faculty = faculties.find((f) => Number(f.id) === Number(department.facultyId))
                return (
                  <div
                    key={department.id}
                    className={`p-4 rounded-lg border transition-colors duration-300 flex items-center justify-between ${
                      isDarkMode ? "bg-[#0e1a22] border-[#1a2d3a]" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col gap-1 flex-1">
                      <h3
                        className={`font-bold transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {department.nameUz}
                      </h3>
                      {department.nameRu && (
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                          }`}
                        >
                          {department.nameRu}
                        </p>
                      )}
                      {faculty && (
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                          }`}
                        >
                          Fakultet: <span className="font-medium">{faculty.nameUz}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleViewDepartment(department, faculty)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Ko&apos;rish</span>
                      </button>
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-green-500 border-green-500/30 hover:bg-green-500/10"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="text-sm">Tahrirlash</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">O&apos;chirish</span>
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </>
  )
}

