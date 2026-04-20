export type MessageTemplate = {
  id: string
  title: string
  body: string
  order: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type CreateMessageTemplateInput = {
  title: string
  body: string
}

export type UpdateMessageTemplateInput = {
  id: string
  title?: string
  body?: string
  order?: number
}
