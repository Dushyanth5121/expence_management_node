/*
  Warnings:

  - You are about to drop the column `date` on the `expenses` table. All the data in the column will be lost.
  - Added the required column `title` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Card', 'UPI', 'BankTransfer', 'Other');

-- DropIndex
DROP INDEX "expenses_date_idx";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "date",
ADD COLUMN     "expense_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'Other',
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "expenses_payment_method_idx" ON "expenses"("payment_method");
