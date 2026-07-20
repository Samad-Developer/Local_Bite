/*
  Warnings:

  - You are about to drop the column `coverImageUrl` on the `Restaurant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "coverImageUrl";

-- CreateTable
CREATE TABLE "RestaurantImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RestaurantImage" ADD CONSTRAINT "RestaurantImage_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
