-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('VISITOR', 'REGULAR_ATTENDEE', 'MEMBER');

-- CreateEnum
CREATE TYPE "ActualChurch" AS ENUM ('NONE', 'EVANGELICAL', 'CATHOLIC', 'OTHER', 'NO_REPORT');

-- CreateEnum
CREATE TYPE "HowKnow" AS ENUM ('FRIEND_OR_FAMILY_REFERRAL', 'SOCIAL_MEDIA', 'WALK_IN', 'EVENT', 'GOOGLE_SEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('SPOUSE', 'CHILD', 'FATHER', 'MOTHER', 'SIBLING', 'GRANDPARENT', 'GRANDCHILD', 'UNCLE_AUNT', 'COUSIN', 'OTHER');

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "type" "MemberType" NOT NULL DEFAULT 'VISITOR',
    "baptized" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_visitors" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "actualChurch" "ActualChurch" NOT NULL,
    "howKnow" "HowKnow" NOT NULL,
    "howKnowOtherAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prays" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_prays" (
    "memberId" TEXT NOT NULL,
    "prayId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_prays_pkey" PRIMARY KEY ("memberId","prayId")
);

-- CreateTable
CREATE TABLE "member_relationships" (
    "id" TEXT NOT NULL,
    "principalMemberId" TEXT NOT NULL,
    "relatedMemberId" TEXT NOT NULL,
    "relationshipType" "RelationshipType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_document_key" ON "members"("document");

-- CreateIndex
CREATE UNIQUE INDEX "members_name_birthDate_key" ON "members"("name", "birthDate");

-- CreateIndex
CREATE UNIQUE INDEX "member_visitors_memberId_key" ON "member_visitors"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "member_relationships_principalMemberId_relatedMemberId_rela_key" ON "member_relationships"("principalMemberId", "relatedMemberId", "relationshipType");

-- AddForeignKey
ALTER TABLE "member_visitors" ADD CONSTRAINT "member_visitors_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_prays" ADD CONSTRAINT "member_prays_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_prays" ADD CONSTRAINT "member_prays_prayId_fkey" FOREIGN KEY ("prayId") REFERENCES "prays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_relationships" ADD CONSTRAINT "member_relationships_principalMemberId_fkey" FOREIGN KEY ("principalMemberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_relationships" ADD CONSTRAINT "member_relationships_relatedMemberId_fkey" FOREIGN KEY ("relatedMemberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
