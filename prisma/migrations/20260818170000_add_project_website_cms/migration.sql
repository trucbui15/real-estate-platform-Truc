-- Safe CreateEnum
DO $$ BEGIN
    CREATE TYPE "WebsiteStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Safe CreateTable
CREATE TABLE IF NOT EXISTS "ProjectWebsite" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "WebsiteStatus" NOT NULL DEFAULT 'DRAFT',
    "draftSectionsConfig" TEXT,
    "draftContentJson" TEXT,
    "draftMetaTitle" TEXT,
    "draftMetaDescription" TEXT,
    "draftOgImage" TEXT,
    "publishedSectionsConfig" TEXT,
    "publishedContentJson" TEXT,
    "publishedMetaTitle" TEXT,
    "publishedMetaDescription" TEXT,
    "publishedOgImage" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectWebsite_pkey" PRIMARY KEY ("id")
);

-- Safe CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectWebsite_projectId_key" ON "ProjectWebsite"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectWebsite_projectId_idx" ON "ProjectWebsite"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectWebsite_status_idx" ON "ProjectWebsite"("status");

-- Safe AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ProjectWebsite" ADD CONSTRAINT "ProjectWebsite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
