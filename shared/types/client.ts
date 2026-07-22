export type ClientStatus = 'ativo' | 'prospecto' | 'inativo'

export type Client = {
  id: string
  userId: string
  name: string
  company: string
  email: string
  phone?: string
  status: ClientStatus
  lastContact: string
}
