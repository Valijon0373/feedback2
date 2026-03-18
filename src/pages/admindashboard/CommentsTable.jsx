import { Eye, Trash2, X } from "lucide-react"
import StarRating from "../../components/StarRating"

export default function CommentsTable({
  isDarkMode,
  reviews,
  formatDate,
  handleToggleReviewStatus,
  handleViewReview,
  handleDeleteReview,
  showDeleteReviewConfirm,
  cancelDeleteReview,
  confirmDeleteReview,
  viewReview,
  setViewReview,
  SCORE_FIELDS,
}) {
  return (
    <div
      className={`${
        isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
      } border rounded-lg p-6 transition-colors duration-300`}
    >
      <h2
        className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        Barcha Sharhlar
      </h2>
      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {reviews.length === 0 ? (
          <p
            className={`transition-colors duration-300 ${
              isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
            }`}
          >
            Hali hech qanday sharh yo'q
          </p>
        ) : (
          reviews.map((review, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border transition-colors duration-300 ${
                isDarkMode ? "bg-[#0e1a22] border-[#1a2d3a]" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p
                    className={`font-bold transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {review.studentName}
                  </p>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                    }`}
                  >
                    {review.teacherName} | {formatDate(review.date || review.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StarRating rating={review.scores?.overall ?? review.rating ?? 0} size="md" />
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p
                  className={`flex-1 transition-colors duration-300 ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                  }`}
                >
                  {review.comment}
                </p>
                <div className="flex gap-2 items-center">
                  <select
                    value={review.isActive !== false ? "active" : "inactive"}
                    onChange={(e) =>
                      handleToggleReviewStatus(review.id, e.target.value === "active")
                    }
                    className={`px-2 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                      review.isActive !== false
                        ? `bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20 ${
                            isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                          }`
                        : `bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20 ${
                            isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                          }`
                    }`}
                  >
                    <option
                      value="active"
                      className={`${
                        isDarkMode ? "bg-[#0e1a22] text-white" : "bg-white text-slate-900"
                      }`}
                    >
                      Faol
                    </option>
                    <option
                      value="inactive"
                      className={`${
                        isDarkMode ? "bg-[#0e1a22] text-white" : "bg-white text-slate-900"
                      }`}
                    >
                      Faol emas
                    </option>
                  </select>
                  <button
                    onClick={() => handleViewReview(review)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-blue-500 border-blue-500/30 hover:bg-blue-500/10 ${
                      isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Ko'rish</span>
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10 ${
                      isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">O'chirish</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Review Confirmation Modal */}
      {showDeleteReviewConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={cancelDeleteReview}
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
                Siz ushbu sharhni o'chirmoqchimisiz?
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteReview}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ha
              </button>
              <button
                onClick={cancelDeleteReview}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Yo'q
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {viewReview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewReview(null)}
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
            <div className="flex justify-between items-start mb-4">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Sharh tafsilotlari
              </h2>
              <button
                onClick={() => setViewReview(null)}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-[#8b9ba8] hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Talaba
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {viewReview.studentName}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  O'qituvchi
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {viewReview.teacherName}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Sana
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {formatDate(viewReview.date || viewReview.created_at)}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Baholar
                </p>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span
                      className={isDarkMode ? "text-slate-300" : "text-slate-700"}
                    >
                      Umumiy:
                    </span>
                    <span className="font-bold text-yellow-400">
                      {viewReview.rating || viewReview.scores?.overall}
                    </span>
                  </div>
                  {viewReview.scores &&
                    Object.entries(viewReview.scores).map(([key, value]) =>
                      key !== "overall" ? (
                        <div key={key} className="flex justify-between text-sm">
                          <span
                            className={`${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {SCORE_FIELDS.find((f) => f.key === key)?.label || key}:
                          </span>
                          <span
                            className={`${
                              isDarkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {value}
                          </span>
                        </div>
                      ) : null,
                    )}
                </div>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b9ba8]" : "text-slate-500"
                  }`}
                >
                  Sharh
                </p>
                <p
                  className={`mt-1 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {viewReview.comment}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


