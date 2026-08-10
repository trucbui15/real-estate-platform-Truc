# Nhà Đất Việt — Nền tảng BĐS (clone kiến trúc FindyHome)

Xây bằng **Next.js 14 (App Router) + TypeScript + Prisma + NextAuth + PostgreSQL**.

## 1. Phân quyền hệ thống

| Vai trò | Quyền hạn |
|---|---|
| **ADMIN** | Toàn quyền: tạo/khoá tài khoản Quản lý & Nhân viên, quản lý mọi tin đăng, khách hàng, dự án, tin tức |
| **MANAGER (Quản lý)** | Toàn quyền vận hành: quản lý mọi tin đăng, duyệt tin, quản lý toàn bộ khách hàng, dự án, tin tức. Không tạo được tài khoản nội bộ |
| **STAFF (Nhân viên)** | Đăng tin mới (chờ Quản lý/Admin duyệt), sửa/xoá **tin của chính mình**, xem & chăm sóc **khách hàng được giao** |
| **CUSTOMER (Khách đã đăng ký)** | Xem toàn bộ website, lưu tin yêu thích, gửi yêu cầu tư vấn, gửi yêu cầu ký gửi |
| **Khách chưa đăng nhập** | Xem & tìm kiếm/lọc tin đăng thoải mái. Khi muốn liên hệ tư vấn, lưu tin, hoặc ký gửi → được yêu cầu đăng ký/đăng nhập |

Toàn bộ logic phân quyền tập trung tại `src/lib/permissions.ts` — sửa 1 chỗ, áp dụng toàn hệ thống.

## 2. Trường dữ liệu chính

**Căn/BĐS (Listing):** Mã căn, Dự án, Tòa, Tầng, Loại giao dịch, Diện tích, Số phòng ngủ, Số nhà vệ sinh, Hướng cửa, Hướng ban công, View, Tình trạng nội thất, Pháp lý, Giá bán, Giá thuê, Trạng thái căn, Ngày cập nhật, **Hình ảnh (upload thật, lưu ở `/public/uploads`)**.

**Khách hàng (Customer/CRM):** Họ tên, SĐT, Email, Nguồn khách hàng, Loại nhu cầu, Loại BĐS quan tâm, Khu vực quan tâm, Ngân sách, Tin đang quan tâm, Trạng thái chăm sóc, Nhân viên phụ trách, Ngày hẹn tiếp theo, Ghi chú — kèm **lịch sử chăm sóc** (CustomerActivity) ghi lại từng cuộc gọi/ghi chú.

Xem đầy đủ tại `prisma/schema.prisma`.

## 3. Chạy nhanh bằng Docker (khuyên dùng — 1 lệnh, gửi khách hàng xem thử luôn)

Yêu cầu máy đã cài **Docker** + **Docker Compose** (Docker Desktop là đủ).

```bash
docker compose up -d --build
```

Lệnh trên tự động:
- Dựng image ứng dụng (multi-stage build, nhẹ)
- Khởi động PostgreSQL riêng (dữ liệu lưu trong volume, không mất khi tắt máy)
- Tự chạy `prisma migrate deploy`
- Lần đầu chạy sẽ **tự seed dữ liệu mẫu** (do `RUN_SEED=true` mặc định trong `docker-compose.yml`)

Mở **http://localhost:3000**

**Tài khoản demo** (mật khẩu chung: `123456`):
- `admin@demo.vn` — Admin
- `manager@demo.vn` — Quản lý
- `staff@demo.vn` — Nhân viên
- `customer@demo.vn` — Khách hàng

Dừng: `docker compose down` (giữ dữ liệu). Xoá luôn dữ liệu: `docker compose down -v`.

> Sau lần chạy đầu, nên tắt seed để tránh chạy lại mỗi lần restart — sửa `RUN_SEED: "false"` trong `docker-compose.yml`, hoặc set biến môi trường `RUN_SEED=false` trước khi `docker compose up`.

### Đổi mật khẩu / secret trước khi gửi khách hàng thật

Tạo file `.env` ở thư mục gốc (docker-compose sẽ tự đọc) và set:
```
NEXTAUTH_SECRET=<chuỗi ngẫu nhiên mạnh, vd: openssl rand -base64 32>
NEXTAUTH_URL=https://domain-that-cua-ban.vn
```

## 4. Chạy không qua Docker (dev thuần trên máy)

Cần có sẵn PostgreSQL (local hoặc `docker run -p 5432:5432 ... postgres:16-alpine`).

```bash
npm install
cp .env.example .env          # sửa DATABASE_URL trỏ đúng Postgres + NEXTAUTH_SECRET random
npx prisma migrate dev --name init
npm run prisma:seed           # tạo tài khoản demo + dữ liệu mẫu
npm run dev
```

Mở http://localhost:3000

## 5. Triển khai thật (production ngoài Docker)

1. Tạo database Postgres (Supabase, Neon, Railway, RDS...), cập nhật `DATABASE_URL`.
2. `npx prisma migrate deploy`
3. Deploy lên Vercel / VPS — nếu dùng VPS, `docker compose up -d --build` là đơn giản nhất.
4. Set `NEXTAUTH_URL` đúng domain thật và `NEXTAUTH_SECRET` ngẫu nhiên mạnh.
5. Ảnh tin đăng lưu trong `public/uploads` (volume Docker `uploads_data` đã map sẵn để không mất dữ liệu khi build lại image). Nếu sau này chạy nhiều server / cần CDN, có thể thay bằng S3/Cloudinary — chỉ cần sửa phần lưu file trong `src/app/api/upload/route.ts`, response vẫn giữ dạng `{ url }` nên không phải sửa UI.

## 6. Cấu trúc thư mục

```
src/
  app/                    # Route theo App Router
    (public pages)        # /, /listings, /listings/[slug], /projects, /news, /ky-gui, /login, /register, /profile
    dashboard/             # Khu vực nội bộ — bắt buộc đăng nhập vai trò ADMIN/MANAGER/STAFF
    api/                   # API routes (REST), mỗi route tự kiểm tra quyền qua lib/permissions.ts
      upload/               # Upload ảnh tin đăng (lưu local, không cần key ngoài)
  components/              # UI dùng chung
  lib/                     # prisma client, next-auth config, permissions, rate-limit, utils
prisma/
  schema.prisma            # Toàn bộ mô hình dữ liệu (PostgreSQL)
  seed.ts                  # Dữ liệu mẫu
Dockerfile                 # Build production image (multi-stage, Next standalone)
docker-compose.yml          # App + Postgres, chạy 1 lệnh
docker-entrypoint.sh         # Chờ DB, chạy migrate, (tuỳ chọn) seed, rồi start app
```

## 7. Đã hoàn thiện thêm so với bản trước

- ✅ **Upload ảnh thật** (thay vì nhập URL tay) — lưu vào `/public/uploads`, không cần tài khoản Cloudinary/S3. Vẫn hỗ trợ dán URL ảnh ngoài nếu muốn.
- ✅ **Rate-limit** cho API đăng ký, ký gửi, liên hệ tư vấn (`src/lib/rateLimit.ts`) — chống spam cơ bản theo IP.
- ✅ **Bộ lọc "Khoảng giá" dạng nút bấm nhanh** (Dưới 2 tỷ / 2-4 tỷ.../ theo Bán hoặc Thuê) giống UI FindyHome, vẫn giữ ô nhập tay cho khoảng giá tuỳ chỉnh.
- ✅ **Docker hoá toàn bộ** — `docker compose up` là chạy được ngay, kèm Postgres, migrate tự động, seed tự động lần đầu.
- ✅ Nâng cấp `next` lên bản vá lỗi bảo mật mới nhất trong dòng 14.x (14.2.35).

## 8. Việc còn cần làm (đã rõ ràng còn thiếu, cần quyết định thêm từ bạn)

- **Trang quản lý Tỉnh/Quận (CRUD trong dashboard):** hiện đã seed sẵn dữ liệu Tỉnh/Quận nhưng chưa có màn hình thêm/sửa/xoá trong dashboard — làm theo đúng mẫu trang `dashboard/users`, khoảng nửa buổi là xong, có thể làm tiếp nếu cần.
- **Thông báo email/SMS** khi có khách hàng mới hoặc tin được duyệt: cần bạn chọn nhà cung cấp (email: Resend/SendGrid/SMTP Gmail; SMS: eSMS/Speedsms/Twilio) và cấp API key — chưa làm vì phụ thuộc lựa chọn & tài khoản trả phí của bạn.
- **CDN cho ảnh** (nếu traffic lớn / nhiều server): chuyển từ lưu local sang S3/Cloudinary khi cần, đã thiết kế sẵn để đổi không ảnh hưởng UI.
