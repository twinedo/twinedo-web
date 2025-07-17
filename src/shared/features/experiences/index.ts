export interface Experience {
  id: string
  company: string
  position: string
  startDate: string // YYYY-MM format
  endDate: string | null // YYYY-MM format or null
  description: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ExperienceInput {
  company: string
  position: string
  startDate: string // Required, YYYY-MM format
  endDate?: string | null // Optional, YYYY-MM format or null for current job
  description: string[]
}

export interface ExperienceUpdateInput extends Partial<ExperienceInput> {}