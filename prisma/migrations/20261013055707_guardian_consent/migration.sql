-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "guardianConsent" BOOLEAN NOT NULL DEFAULT false;
