-- CreateTable
CREATE TABLE "ContactSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mapLink" TEXT,
    "hours" TEXT,
    "emails" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSettings_pkey" PRIMARY KEY ("id")
);
