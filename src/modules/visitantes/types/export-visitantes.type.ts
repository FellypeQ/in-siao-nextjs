export type ExportVisitantesItem = {
  id: string
  name: string
  birthDate: Date
  phone: string | null
  document: string | null
  baptized: boolean
  createdAt: Date
  visitorProfile: {
    actualChurch: string
    howKnow: string
    howKnowOtherAnswer: string | null
  }
  prayers: Array<{ id: string; text: string }>
  familyRelationships: Array<{
    id: string
    relationshipType: string
    relatedMember: {
      id: string
      name: string
      birthDate: Date
      phone: string | null
    }
  }>
}
