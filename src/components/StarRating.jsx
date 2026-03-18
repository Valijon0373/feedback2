/**
 * Yulduz reytingini ko'rsatadi. 4.5 kabi qiymatlar uchun 4 to'liq + 1 yarim yulduz.
 * @param {number} rating - 0 dan 5 gacha reyting
 * @param {object} props - size: 'sm' | 'md' | 'lg' (fontSize)
 */
export default function StarRating({ rating, size = "md", className = "" }) {
  const r = Math.min(5, Math.max(0, parseFloat(rating) || 0))
  const sizes = { sm: "0.9em", md: "1.1em", lg: "1.3em" }
  const fs = sizes[size] || sizes.md

  return (
    <div className={`flex gap-0.5 items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (r >= star) {
          return (
            <span key={star} className="text-yellow-500" style={{ fontSize: fs }}>
              ★
            </span>
          )
        }
        if (r >= star - 0.5) {
          return (
            <span key={star} className="relative inline-block" style={{ fontSize: fs }}>
              <span className="text-gray-300">★</span>
              <span
                className="text-yellow-500 absolute left-0 top-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                ★
              </span>
            </span>
          )
        }
        return (
          <span key={star} className="text-gray-300" style={{ fontSize: fs }}>
            ★
          </span>
        )
      })}
    </div>
  )
}
