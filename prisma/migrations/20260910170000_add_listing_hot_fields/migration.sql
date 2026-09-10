-- AlterTable
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "isHot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "hotAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Listing_isHot_hotAt_idx" ON "Listing"("isHot", "hotAt");
