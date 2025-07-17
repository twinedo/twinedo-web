export type User = {
  id: string
  email: string
  role: 'user' | 'superadmin'
}

export interface AuthPayload {
  user: User
  token: string
}

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}