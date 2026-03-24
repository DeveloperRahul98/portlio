export type ProjectStatus = 'kickoff' | 'in_progress' | 'review' | 'complete'
export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  company: string | null
  portal_slug: string
  accent_color: string
  is_closed: boolean
  created_at: string
  projects?: Project[]
}

export interface Project {
  id: string
  client_id: string
  title: string
  description: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
  updates?: Update[]
  files?: PortalFile[]
  invoices?: Invoice[]
}

export interface StatusHistory {
  id: string
  project_id: string
  from_status: string | null
  to_status: string
  created_at: string
}

export interface Comment {
  id: string
  update_id: string
  author_name: string
  content: string
  is_client: boolean
  created_at: string
}

export interface Update {
  id: string
  project_id: string
  content: string
  created_at: string
  comments?: Comment[]
}

export interface PortalFile {
  id: string
  project_id: string
  file_name: string
  storage_path: string
  file_size: number | null
  file_type: string | null
  created_at: string
}

export interface InvoiceLineItem {
  description: string
  amount: number
}

export interface Invoice {
  id: string
  project_id: string
  line_items: InvoiceLineItem[]
  total: number
  currency: string
  status: InvoiceStatus
  notes: string | null
  payment_proof_url: string | null
  created_at: string
}

export interface PortalData {
  client: Client
  project: Project
  updates: Update[]
  files: PortalFile[]
  invoice: Invoice | null
}

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; step: number }> = {
  kickoff: { label: 'Kickoff', color: '#F59E0B', step: 0 },
  in_progress: { label: 'In Progress', color: '#6366F1', step: 1 },
  review: { label: 'In Review', color: '#F97316', step: 2 },
  complete: { label: 'Complete', color: '#10B981', step: 3 },
}
