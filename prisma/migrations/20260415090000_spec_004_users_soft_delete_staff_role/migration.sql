-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STAFF';

-- Commit explicito para permitir uso do novo valor enum em instrucoes subsequentes.
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STAFF';
