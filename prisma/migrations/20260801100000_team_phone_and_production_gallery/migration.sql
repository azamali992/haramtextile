-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "phone" TEXT;

-- CreateTable
CREATE TABLE "ProductionStepImage" (
    "id" TEXT NOT NULL,
    "productionStepId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionStepImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductionStepImage_productionStepId_idx" ON "ProductionStepImage"("productionStepId");

-- AddForeignKey
ALTER TABLE "ProductionStepImage" ADD CONSTRAINT "ProductionStepImage_productionStepId_fkey" FOREIGN KEY ("productionStepId") REFERENCES "ProductionStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
