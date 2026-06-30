/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `AddonGroup` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `MenuItem` table. All the data in the column will be lost.
  - Added the required column `variantId` to the `AddonGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AddonGroup" DROP CONSTRAINT "AddonGroup_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Addon" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "AddonGroup" DROP COLUMN "restaurantId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "maxSelections" INTEGER,
ADD COLUMN     "minSelections" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "variantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "basePrice";

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "AddonGroup" ADD CONSTRAINT "AddonGroup_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
