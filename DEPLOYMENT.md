# UrSPI - Deployment Guide

## O'zbek Kuni Reyting Tizimi

### Quick Start

Bu loyiha **Vercel, Render yoki boshqa static hosting** da React (Vite) frontendi sifatida ishlaydi
va alohida backend API (Swagger: `https://feedback.urspi.uz/swagger-ui/index.html`) bilan
ulangan.

Quyidagi asosiy qadamlar yetarli bo'ladi:

## 1. Backend API

- Backend allaqachon `https://feedback.urspi.uz` manzilida ishlaydi.
- Frontend undan foydalanish uchun faqat bitta environment o'zgaruvchiga tayangan:

```bash
VITE_API_BASE_URL=https://feedback.urspi.uz
```

Agar backend boshqa URL'da bo'lsa, shu qiymatni mos ravishda o'zgartirasiz.

## 2. Frontendni tayyorlash

1. Paketlarni o'rnatish:

```bash
npm install
```

2. Lokal rejimda ishga tushirish:

```bash
npm run dev
```

3. Production build tayyorlash:

```bash
npm run build
```

Hosil bo'lgan `dist` papkasini xohlagan hosting (Vercel, Netlify, Render static, Nginx va hokazo)
orqali serve qilishingiz mumkin.

## 3. GitHub va Vercel orqali deploy (misol)

1. Repositoriyni GitHub'ga push qilish:

```bash
git add .
git commit -m "Initial deploy: UrSPI rating system"
git push origin main
```

2. Vercel'da import qilish:
   - `https://vercel.com/new` sahifasiga kiring
   - GitHub repo'ni tanlang
   - `Environment Variables` bo'limiga `VITE_API_BASE_URL` qo'shing
   - Deploy qiling

## 4. URL'lar (namuna)

- **Asosiy sayt**: `https://yourapp.vercel.app/`
- **Admin Panel**: `https://yourapp.vercel.app/admin/`

## 5. Funksiyalar

- Fakultetlar va kafedralar ro'yxati
- O'qituvchilar profillari
- QR kod orqali fikr qoldirish
- Reyting tizimi
- Admin dashboard

## 6. O'zbekcha Tizim Sozlamalari

- Barcha UI o'zbek tilida
- O'zbek lokal settinglari (uz-UZ)
- Reyting: 1–5 yulduz

---

Savollar bo'lsa, admin panel orqali yoki backend API (masalan, `/api/reviews`) yordamida
tekshirishingiz mumkin.
