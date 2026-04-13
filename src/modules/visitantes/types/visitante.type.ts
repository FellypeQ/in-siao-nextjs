import type {
  ActualChurch,
  HowKnow,
  Member,
  MemberRelationship,
  MemberType,
  RelationshipType
} from "@prisma/client"

export type CreateVisitanteInput = {
  name: string
  birthDate: Date
  document?: string
  phone?: string
  baptized: boolean
  actualChurch: ActualChurch
  howKnow: HowKnow
  howKnowOtherAnswer?: string
  prayText?: string
  familyMembers: CreateFamilyMemberInput[]
}

export type CreateFamilyMemberInput = {
  name: string
  birthDate: Date
  phone?: string
  relationshipType: RelationshipType
}

export type UpdateVisitanteFamilyOperation =
  | {
      action: "create"
      payload: CreateFamilyMemberInput
    }
  | {
      action: "update"
      relationshipId: string
      memberId: string
      payload: CreateFamilyMemberInput
    }
  | {
      action: "unlink"
      relationshipId: string
    }
  | {
      action: "delete"
      relationshipId: string
      memberId: string
    }

export type UpdateVisitanteInput = {
  id: string
  name: string
  birthDate: Date
  document?: string
  phone?: string
  baptized: boolean
  actualChurch: ActualChurch
  howKnow: HowKnow
  howKnowOtherAnswer?: string
  prayText?: string
  familyOperations: UpdateVisitanteFamilyOperation[]
}

export type VisitanteListItem = {
  id: string
  name: string
  birthDate: Date
  phone: string | null
  createdAt: Date
}

export type VisitanteDetail = {
  member: Member
  visitorProfile: {
    actualChurch: ActualChurch
    howKnow: HowKnow
    howKnowOtherAnswer: string | null
  }
  prayers: Array<{
    id: string
    text: string
    createdAt: Date
  }>
  familyRelationships: Array<
    MemberRelationship & {
      relatedMember: {
        id: string
        name: string
        birthDate: Date
        phone: string | null
        type: MemberType
      }
    }
  >
}
