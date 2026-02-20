import { Eye, Pencil, Plus, Trash2, X } from "lucide-react"

export default function FacultiesTable({
  isDarkMode,
  faculties,
  facultyForm,
  editingFacultyId,
  showFacultyForm,
  viewFaculty,
  showDeleteConfirm,
  setFacultyForm,
  setEditingFacultyId,
  setShowFacultyForm,
  setViewFaculty,
  handleAddFaculty,
  handleEditFaculty,
  handleDeleteFaculty,
  handleViewFaculty,
  confirmDeleteFaculty,
  cancelDeleteFaculty,
}) {
  return (
    <>
      {viewFaculty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewFaculty(null)}
          style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}
        >
          <div
            className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-xl p-6 w-full max-w-md relative`}
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.3s ease-out forwards" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Fakultet ma&apos;lumotlari
              </h2>
              <button
                onClick={() => setViewFaculty(null)}
                className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  O&apos;zbek nomi:
                </p>
                <p
                  className={`font-semibold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {viewFaculty.nameUz}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Rus nomi:
                </p>
                <p
                  className={`font-semibold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {viewFaculty.nameRu}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={cancelDeleteFaculty}
          style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}
        >
          <div
            className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-xl p-6 w-full max-w-md relative`}
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.3s ease-out forwards" }}
          >
            <div className="mb-6">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Fakultetni o&apos;chirishni tasdiqlaysizmi?
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteFaculty}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ha
              </button>
              <button
                onClick={cancelDeleteFaculty}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Yo&apos;q
              </button>
            </div>
          </div>
        </div>
      )}

      {showFacultyForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowFacultyForm(false)
            setFacultyForm({ nameUz: "", nameRu: "" })
            setEditingFacultyId(null)
          }}
          style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}
        >
          <div
            className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-xl p-6 w-full max-w-md relative`}
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.3s ease-out forwards" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {editingFacultyId ? "Fakultetni Tahrirlash" : "Yangi Fakultet Qo'shish"}
              </h2>
              <button
                onClick={() => {
                  setShowFacultyForm(false)
                  setFacultyForm({ nameUz: "", nameRu: "" })
                }}
                className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFaculty} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  O&apos;zbek Nomi
                </label>
                <input
                  type="text"
                  value={facultyForm.nameUz}
                  onChange={(e) => setFacultyForm({ ...facultyForm, nameUz: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Fakultet nomi"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Rus Nomi
                </label>
                <input
                  type="text"
                  value={facultyForm.nameRu}
                  onChange={(e) => setFacultyForm({ ...facultyForm, nameRu: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Название факультета"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {editingFacultyId ? "Saqlash" : "Qo'shish"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFacultyForm(false)
                    setFacultyForm({ nameUz: "", nameRu: "" })
                    setEditingFacultyId(null)
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

      <div className="w-full">
        <div
          className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Mavjud Fakultetlar
            </h2>
            <button
              onClick={() => {
                setEditingFacultyId(null)
                setFacultyForm({ nameUz: "", nameRu: "" })
                setShowFacultyForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Qo&apos;shish
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {faculties.map((faculty) => (
              <div
                key={faculty.id}
                className={`p-4 rounded-lg border transition-colors duration-300 flex items-center justify-between ${
                  isDarkMode ? "bg-[#0e1a22] border-[#1a2d3a]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex-1">
                  <h3
                    className={`font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {faculty.nameUz}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}
                  >
                    {faculty.nameRu}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewFaculty(faculty)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Ko&apos;rish</span>
                  </button>
                  <button
                    onClick={() => handleEditFaculty(faculty)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-green-500 border-green-500/30 hover:bg-green-500/10"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm">Tahrirlash</span>
                  </button>
                  <button
                    onClick={() => handleDeleteFaculty(faculty.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">O&apos;chirish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
