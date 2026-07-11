/*
  Warnings:

  - A unique constraint covering the columns `[discountId,categoryId]` on the table `DiscountItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DiscountItem" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "menuItemId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DiscountItem_discountId_categoryId_key" ON "DiscountItem"("discountId", "categoryId");

-- AddForeignKey
ALTER TABLE "DiscountItem" ADD CONSTRAINT "DiscountItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
