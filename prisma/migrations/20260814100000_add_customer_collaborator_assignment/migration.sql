-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "assignedCollaboratorId" TEXT,
ADD COLUMN     "assignedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Customer_assignedCollaboratorId_idx" ON "Customer"("assignedCollaboratorId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_assignedCollaboratorId_fkey" FOREIGN KEY ("assignedCollaboratorId") REFERENCES "Collaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
