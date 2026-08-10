#!/bin/sh
set -e

echo "==> Chờ Postgres sẵn sàng..."
ATTEMPTS=0
until echo "SELECT 1;" | npx prisma db execute --stdin > /dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 30 ]; then
    echo "!! Không kết nối được database sau 30 lần thử. Kiểm tra lại DATABASE_URL."
    exit 1
  fi
  sleep 2
done
echo "==> Database đã sẵn sàng."

echo "==> Chạy migrate..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "==> Seed dữ liệu mẫu (RUN_SEED=true)..."
  npx tsx prisma/seed.ts || echo "!! Seed lỗi hoặc đã có dữ liệu, bỏ qua."
fi

echo "==> Khởi động ứng dụng..."
exec "$@"
