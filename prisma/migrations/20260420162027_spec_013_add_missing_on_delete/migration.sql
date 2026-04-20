-- DropForeignKey
ALTER TABLE "member_message_logs" DROP CONSTRAINT "member_message_logs_sentByUserId_fkey";

-- DropForeignKey
ALTER TABLE "user_invites" DROP CONSTRAINT "user_invites_createdById_fkey";

-- AlterTable
ALTER TABLE "member_message_logs" ALTER COLUMN "sentByUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_invites" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_message_logs" ADD CONSTRAINT "member_message_logs_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
