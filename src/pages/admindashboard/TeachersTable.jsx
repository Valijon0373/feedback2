import { Eye, Pencil, Plus, Trash2, X, Search, Download, Users, Mail } from "lucide-react"
import { buildImageUrl } from "../../lib/api"

export default function TeachersTable({
  isDarkMode,
  teachers,
  reviews,
  departments,
  teacherForm,
  editingTeacherId,
  showTeacherModal,
  viewTeacher,
  showDeleteTeacherConfirm,
  deleteTeacherName,
  teacherSearchQuery,
  teacherSearchTerm,
  imagePreview,
  setTeacherForm,
  setTeacherSearchQuery,
  setTeacherSearchTerm,
  setShowTeacherModal,
  setViewTeacher,
  setShowDeleteTeacherConfirm,
  handleImageChange,
  handleAddOrUpdateTeacher,
  resetTeacherForm,
  handleDownloadStatistics,
  handleViewTeacher,
  handleEditTeacher,
  handleDeleteTeacher,
  confirmDeleteTeacher,
  cancelDeleteTeacher,
  calculateTeacherMetrics,
}) {
  return (
    <>
      {/* Delete Teacher Confirmation Modal */}
      {showDeleteTeacherConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={cancelDeleteTeacher}
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
                Siz {deleteTeacherName} o&apos;chirmoqchimisiz?
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteTeacher}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ha
              </button>
              <button
                onClick={cancelDeleteTeacher}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Yo&apos;q
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Modal */}
      {showTeacherModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            resetTeacherForm()
          }}
          style={{
            animation: "fadeIn 0.3s ease-in-out forwards",
          }}
        >
          <div
            className={`${
              isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
            } border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative`}
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
                {editingTeacherId ? "O'qituvchini Tahrirlash" : "Yangi O'qituvchi Qo'shish"}
              </h2>
              <button
                onClick={() => {
                  resetTeacherForm()
                }}
                className={`transition-colors ${
                  isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleAddOrUpdateTeacher}
              className="space-y-4"
              encType="multipart/form-data"
            >
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  F.I.Sh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={teacherForm.fullName}
                  onChange={(event) =>
                    setTeacherForm({ ...teacherForm, fullName: event.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="O'qituvchi ismi"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Lavozim <span className="text-red-500">*</span>
                </label>
                <select
                  value={teacherForm.position}
                  onChange={(event) =>
                    setTeacherForm({ ...teacherForm, position: event.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="">Lavozim tanlang</option>
                  <option value="Kafedra Mudiri">Kafedra Mudiri</option>
                  <option value="Dekan">Dekan</option>
                  <option value="Dekan o'rinbosari">Dekan o'rinbosari</option>
                  <option value="Dotsent">Dotsent</option>
                  <option value="Katta o'qituvchi">Katta o'qituvchi</option>
                  <option value="O'qituvchi">O'qituvchi</option>
                  <option value="O'qituvchi-Stajor">O'qituvchi-Stajor</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Kafedra <span className="text-red-500">*</span>
                </label>
                <select
                  value={teacherForm.departmentId}
                  onChange={(event) => {
                    const dept = departments.find((d) => d.id === Number.parseInt(event.target.value))
                    setTeacherForm((prev) => ({
                      ...prev,
                      departmentId: event.target.value,
                      department: dept ? dept.nameUz : "",
                    }))
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="">Kafedra tanlang</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nameUz}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  value={teacherForm.phone}
                  onChange={(event) =>
                    setTeacherForm({ ...teacherForm, phone: event.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="+998 90 123 45 67"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 
                    transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  E-pochta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={teacherForm.email}
                  onChange={(event) =>
                    setTeacherForm({ ...teacherForm, email: event.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="example@gmail.com"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Qisqacha ma&apos;lumot (bio)
                </label>
                <textarea
                  value={teacherForm.bio}
                  onChange={(event) =>
                    setTeacherForm({ ...teacherForm, bio: event.target.value })
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="O'qituvchi haqida qisqacha ma'lumot"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Rasm yuklash <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
                {imagePreview && (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {editingTeacherId ? "Saqlash" : "Qo'shish"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetTeacherForm()
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

      {/* Teachers List + Search + Statistics */}
      <div className="w-full">
        <div
          className={`${
            isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
          } border rounded-lg p-6 transition-colors duration-300`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              O&apos;qituvchilar Ro&apos;yxati
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadStatistics}
                className="flex items-center gap-2 px-4 py-2 border border-[#00d4aa] text-[#00d4aa] rounded-xl font-medium hover:bg-[#00d4aa] hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Statistika
              </button>
              <button
                onClick={() => {
                  resetTeacherForm()
                  setShowTeacherModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Qo&apos;shish
              </button>
            </div>
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
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      setTeacherSearchTerm(teacherSearchQuery)
                    }
                  }}
                  placeholder="O'qituvchi qidirish..."
                  className={`w-full pl-10 pr-4 py-2.5 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-600 transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] text-white placeholder:text-[#8b9ba8]"
                      : "bg-white text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => setTeacherSearchTerm(teacherSearchQuery)}
                className="px-6 py-2.5 border-2 border-blue-500 text-blue-500 rounded-full font-medium hover:bg-blue-500 hover:text-white transition-all duration-200 whitespace-nowrap"
              >
                Qidirish
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers
              .filter((teacher) => {
                if (!teacherSearchTerm.trim()) return true
                const query = teacherSearchTerm.toLowerCase()
                const name = (teacher.fullName || teacher.name || "").toLowerCase()
                const title = (teacher.position || teacher.title || "").toLowerCase()
                const dept = (teacher.department || "").toLowerCase()
                const spec = (teacher.specialization || "").toLowerCase()
                return (
                  name.includes(query) ||
                  title.includes(query) ||
                  spec.includes(query) ||
                  dept.includes(query)
                )
              })
              .map((teacher) => {
                const metrics = calculateTeacherMetrics(teacher.id, reviews)
                return (
                  <div
                    key={teacher.id}
                    className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
                    }`}
                  >
                    {/* Gradient Header */}
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                      {/* Profile Picture */}
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
                        <div
                          className="w-24 h-24 rounded-full border-4 overflow-hidden bg-gray-200"
                          style={{ borderColor: isDarkMode ? "#14232c" : "#fff" }}
                        >
                          {teacher.imageUrl || teacher.image || teacher.photo || teacher.avatar ? (
                            <img
                              src={
                                buildImageUrl(
                                  teacher.imageUrl || teacher.image || teacher.photo || teacher.avatar || "",
                                ) || "/placeholder.svg"
                              }
                              alt={teacher.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center ${
                                isDarkMode ? "bg-[#1a2d3a]" : "bg-gray-200"
                              }`}
                            >
                              <Users
                                className={`w-12 h-12 ${
                                  isDarkMode ? "text-[#8b9ba8]" : "text-gray-400"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="pt-16 pb-4 px-6">
                      {/* Name and Title */}
                      <div className="text-center mb-4">
                        <h3
                          className={`text-xl font-bold mb-1 transition-colors duration-300 ${
                            isDarkMode ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {teacher.fullName || teacher.name}
                        </h3>
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                          }`}
                        >
                          {teacher.position || teacher.title || "O'qituvchi"}
                        </p>
                      </div>

                      {/* Rating Info */}
                      <div className="mb-4 text-center">
                        <p className="text-sm font-semibold text-yellow-400 mb-1">
                          Reyting: {metrics.overall.toFixed(1)} / 5
                        </p>
                        <p
                          className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                          }`}
                        >
                          {metrics.total} ta sharh
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-6">
                        <button
                          type="button"
                          onClick={() => handleViewTeacher(teacher)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 text-blue-500 border-blue-500/30 hover:bg-blue-500/10 ${
                            isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">Ko&apos;rish</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditTeacher(teacher)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 text-green-500 border-green-500/30 hover:bg-green-500/10 ${
                            isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                          }`}
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="text-sm font-medium">Tahrirlash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10 ${
                            isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">O&apos;chirish</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* View Teacher Modal */}
      {viewTeacher && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewTeacher(null)}
          style={{
            animation: "fadeIn 0.3s ease-in-out forwards",
          }}
        >
          <div
            className={`${
              isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
            } border rounded-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto`}
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
                O&apos;qituvchi ma&apos;lumotlari
              </h2>
              <button
                onClick={() => setViewTeacher(null)}
                className={`transition-colors ${
                  isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#00d4aa] mb-3">
                {viewTeacher.imageUrl || viewTeacher.image || viewTeacher.photo || viewTeacher.avatar ? (
                  <img
                    src={
                      buildImageUrl(
                        viewTeacher.imageUrl || viewTeacher.image || viewTeacher.photo || viewTeacher.avatar || "",
                      ) || "/placeholder.svg"
                    }
                    alt={viewTeacher.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isDarkMode ? "bg-[#1a2d3a]" : "bg-gray-200"
                    }`}
                  >
                    <Users
                      className={`w-12 h-12 ${
                        isDarkMode ? "text-[#8b9ba8]" : "text-gray-400"
                      }`}
                    />
                  </div>
                )}
              </div>
              <h3
                className={`text-lg font-bold text-center ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {viewTeacher.name}
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                }`}
              >
                {viewTeacher.title}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                  }`}
                >
                  Kafedra:
                </p>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {viewTeacher.department}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                  }`}
                >
                  Mutaxassislik:
                </p>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {viewTeacher.specialization || "-"}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium mb-1 flex items-center gap-2 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>E-mail:</span>
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {viewTeacher.email || viewTeacher.phone}
                    </span>
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                  }`}
                >
                  Reyting:
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">
                    ★ {calculateTeacherMetrics(viewTeacher.id, reviews).overall.toFixed(1)}
                  </span>
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                    }`}
                  >
                    ({calculateTeacherMetrics(viewTeacher.id, reviews).total} ta sharh)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


