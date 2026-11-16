# ข่าวสดออนไลน์ — Thai News Website

เว็บข่าวออนไลน์ภาษาไทยพร้อม Google AdSense integration สร้างด้วย Next.js 14, Prisma, SQLite

## ✨ Features

- 📰 เว็บข่าวออนไลน์ SEO-ready (sitemap, robots.txt, JSON-LD)
- 🔑 Login/Register ด้วย Email
- 👨‍💼 Admin Dashboard สำหรับ Approve/Reject บทความ
- 📢 Google AdSense integration (เปิด/ปิดโฆษณาต่อบทความ)
- 🌐 Google Search Console ready

## 🚀 เริ่มต้นใช้งาน

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. สร้าง database
npm run db:push

# 3. เพิ่มข้อมูลตัวอย่าง
npm run db:seed

# 4. รัน development server
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## 👤 บัญชีทดสอบ

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@news.com | admin1234 |
| Writer | writer@news.com | writer1234 |

## ⚙️ Environment Variables

แก้ไข `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Google AdSense (ใส่หลังจาก Google อนุมัติ)
NEXT_PUBLIC_ADSENSE_CLIENT_ID="ca-pub-XXXXXXXXXXXXXXXX"

NEXT_PUBLIC_SITE_NAME="ข่าวสดออนไลน์"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Gmail SMTP สำหรับส่งรหัสยืนยันอีเมล
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-address@gmail.com"
SMTP_PASSWORD="your-google-app-password"
SMTP_FROM="your-address@gmail.com"
```

การสมัครจะส่งรหัส 6 หลักไปยังอีเมล รหัสหมดอายุใน 10 นาที และสร้างบัญชีหลังยืนยันสำเร็จ
ตั้งค่า SMTP ทั้ง 5 ค่าใน Environment ของ Render ก่อนเปิดรับสมัครจริง สำหรับ Gmail ให้เปิด
2-Step Verification แล้วสร้าง App Password จาก Google Account จากนั้นใส่ App Password ใน
`SMTP_PASSWORD` (ห้ามใช้รหัสผ่าน Gmail ปกติ) และใช้อีเมลเดียวกันใน `SMTP_USER` กับ `SMTP_FROM`.

## 📢 ขั้นตอนเชื่อมต่อ Google AdSense

1. Deploy เว็บบน Vercel + ผูก domain จริง
2. เพิ่มเนื้อหาบทความอย่างน้อย 10+ บทความ
3. สมัครที่ [google.com/adsense](https://www.google.com/adsense)
4. รอ Google review (1–14 วัน)
5. เมื่ออนุมัติ ใส่ Publisher ID ใน `.env.local`
6. แก้ไข `public/ads.txt` ด้วย Publisher ID จริง
7. Deploy ใหม่

## 🌐 Deploy บน Render

โปรเจกต์มี `render.yaml` สำหรับสร้าง Web Service อัตโนมัติ ให้ push โค้ดขึ้น GitHub
แล้วเลือก **New → Blueprint** ใน Render และเชื่อม repository นี้ Render จะใช้คำสั่ง
ติดตั้ง dependencies, สร้าง Prisma Client และ build Next.js ตามไฟล์ดังกล่าว

ตั้ง `NEXTAUTH_URL` และ `NEXT_PUBLIC_SITE_URL` ให้ตรงกับ URL จริงของ service หลังสร้าง
service แล้ว หากเปลี่ยนชื่อ service หรือใช้ custom domain ให้แก้ค่าทั้งสองใน Environment
ของ Render แล้ว deploy ใหม่

ฐานข้อมูลปัจจุบันเป็น SQLite (`file:./render.db`) ซึ่งอยู่ใต้โฟลเดอร์ `prisma/` บน filesystem ชั่วคราวของ
Render Free ดังนั้นข้อมูลอาจหายเมื่อ service ถูกสร้างใหม่หรือ deploy บางรูปแบบ สำหรับ
ข้อมูลถาวรให้ย้าย Prisma datasource ไป PostgreSQL และใช้ Render PostgreSQL ก่อนใช้งานจริง

## 📁 โครงสร้างโปรเจกต์

```
app/
├── page.tsx              # หน้าแรก
├── news/[slug]/          # หน้าบทความ
├── category/[name]/      # หน้าหมวดหมู่
├── login/                # หน้า Login
├── register/             # หน้าสมัครสมาชิก
├── dashboard/            # Admin Panel
│   ├── page.tsx          # ภาพรวม stats
│   ├── articles/         # จัดการบทความ
│   └── ads/              # จัดการ AdSense
└── api/                  # API Routes
```
