const actualChurchLabelMap = {
  NONE: "Nao frequento nenhuma",
  EVANGELICAL: "Igreja evangelica",
  CATHOLIC: "Igreja catolica",
  OTHER: "Outra religiao",
  NO_REPORT: "Prefiro nao responder"
} as const

const howKnowLabelMap = {
  FRIEND_OR_FAMILY_REFERRAL: "Indicacao de amigos/familia",
  SOCIAL_MEDIA: "Redes sociais",
  WALK_IN: "Passei na frente",
  EVENT: "Evento",
  GOOGLE_SEARCH: "Google",
  OTHER: "Outra"
} as const

const relationshipTypeLabelMap = {
  SPOUSE: "Conjuge",
  CHILD: "Filho(a)",
  FATHER: "Pai",
  MOTHER: "Mae",
  SIBLING: "Irmao(a)",
  GRANDPARENT: "Avo",
  GRANDCHILD: "Neto(a)",
  UNCLE_AUNT: "Tio(a)",
  COUSIN: "Primo(a)",
  OTHER: "Outro"
} as const

export type ActualChurchValue = keyof typeof actualChurchLabelMap
export type HowKnowValue = keyof typeof howKnowLabelMap
export type RelationshipTypeValue = keyof typeof relationshipTypeLabelMap

export const actualChurchOptions: Array<{ value: ActualChurchValue; label: string }> =
  Object.entries(actualChurchLabelMap).map(([value, label]) => ({
    value: value as ActualChurchValue,
    label
  }))

export const howKnowOptions: Array<{ value: HowKnowValue; label: string }> = Object.entries(
  howKnowLabelMap
).map(([value, label]) => ({
  value: value as HowKnowValue,
  label
}))

export const relationshipTypeOptions: Array<{ value: RelationshipTypeValue; label: string }> =
  Object.entries(relationshipTypeLabelMap).map(([value, label]) => ({
    value: value as RelationshipTypeValue,
    label
  }))

export function translateActualChurch(value: string) {
  return actualChurchLabelMap[value as ActualChurchValue] ?? value
}

export function translateHowKnow(value: string) {
  return howKnowLabelMap[value as HowKnowValue] ?? value
}

export function translateRelationshipType(value: string) {
  return relationshipTypeLabelMap[value as RelationshipTypeValue] ?? value
}
