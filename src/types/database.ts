// AUF Portal Database Types
// Manual types for auth tables (Story 1.2)
// Will be replaced by `supabase gen types typescript` output when full schema is ready

export interface Student {
  id: string
  user_id: string
  student_number: string
  first_name: string
  last_name: string
  program: string
  year_level: number
  created_at: string
}

export interface Faculty {
  id: string
  user_id: string
  employee_id: string
  first_name: string
  last_name: string
  department: string
  created_at: string
}

export interface AdminStaff {
  id: string
  user_id: string
  first_name: string
  last_name: string
  role_level: string
  department: string
  created_at: string
}

// Grade-related types (Story 3.1)
export type GradeStatus = 'in_progress' | 'submitted' | 'finalized'
export type SubjectType = 'core' | 'elective' | 'ge'
export type SectionStatus = 'open' | 'closed' | 'cancelled'

export interface ScheduleEntry {
  day: string
  start: string
  end: string
  room: string
}

export interface Subject {
  id: string
  code: string
  name: string
  units: number
  type: SubjectType
  description: string | null
  created_at: string
}

export interface Section {
  id: string
  subject_id: string
  section_code: string
  faculty_id: string
  schedule_json: ScheduleEntry[]
  capacity: number
  enrolled_count: number
  semester: string
  academic_year: string
  status: SectionStatus
  created_at: string
}

export interface Grade {
  id: string
  student_id: string
  section_id: string
  subject_id: string
  midterm: number | null
  final_grade: number | null
  final_computed: number | null
  status: GradeStatus
  semester: string
  academic_year: string
  submitted_by: string | null
  submitted_at: string | null
  created_at: string
}

/** Grade row joined with subject details — used by the grade viewer */
export interface GradeWithSubject extends Grade {
  subject: Pick<Subject, 'code' | 'name' | 'units'>
}

// Curriculum types (Story 4.1)
export interface Program {
  id: string
  code: string
  name: string
  total_units: number
  duration_years: number
  created_at: string
}

export interface CurriculumEntry {
  id: string
  program_id: string
  subject_id: string
  year_level: number
  semester: string
  subject_type: SubjectType
  prerequisite_subject_ids: string[]
  created_at: string
}

/** Curriculum entry joined with subject details for display */
export interface CurriculumEntryWithSubject extends CurriculumEntry {
  subject: Pick<Subject, 'id' | 'code' | 'name' | 'units'>
}

/** Node status for the degree progress flowchart */
export type CurriculumNodeStatus = 'completed' | 'in_progress' | 'available' | 'locked'

// Enrollment types (Story 5.1)
export type EnrollmentStatus = 'pending' | 'confirmed' | 'dropped'

export interface Enrollment {
  id: string
  student_id: string
  section_id: string
  status: EnrollmentStatus
  semester: string
  academic_year: string
  enrolled_at: string
  created_at: string
}

export interface EnrollmentWithSection extends Enrollment {
  section: Section & { subject: Pick<Subject, 'code' | 'name' | 'units'> }
}

/** Time preference block for schedule canvas */
export interface TimeBlock {
  day: string
  hour: number
}

// Payment types (Story 6.1)
export type PaymentStatus = 'uploaded' | 'under_review' | 'verified' | 'rejected' | 'posted'
export type PaymentMethod = 'gcash' | 'maya' | 'bank_transfer' | 'credit_card' | 'cashier'

export interface Fee {
  id: string
  student_id: string
  category: string
  description: string
  amount: number
  semester: string
  academic_year: string
  created_at: string
}

export interface Payment {
  id: string
  student_id: string
  amount: number
  method: PaymentMethod
  reference_number: string | null
  proof_url: string | null
  status: PaymentStatus
  reject_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  semester: string
  academic_year: string
  ocr_extracted_text: string | null
  ocr_confidence: number | null
  ocr_matched: boolean
  created_at: string
}

// News types (Story 7.1)
export type NewsCategory = 'Academic' | 'Administrative' | 'Campus Life' | 'Sports' | 'International'

export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  body: string
  category: NewsCategory
  thumbnail_url: string | null
  author_name: string
  is_featured: boolean
  published_at: string
  created_at: string
}

// Events types (Story 8.1)
export type EventCategory = 'academic' | 'sports' | 'cultural' | 'organization' | 'administrative'

export interface CalendarEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  venue: string
  start_date: string
  end_date: string
  rsvp_enabled: boolean
  max_attendees: number | null
  created_at: string
}

export interface EventRsvp {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

// Notification types (Story 2.2)
export type NotificationType =
  | 'grade_posted'
  | 'payment_status_changed'
  | 'enrollment_confirmed'
  | 'deadline_approaching'
  | 'event_reminder'
  | 'system_announcement'

export type NotificationPriority = 'action_required' | 'update' | 'info'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  body: string
  action_url: string | null
  read: boolean
  dismissed: boolean // Client-only state — not in DB notifications table schema
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      students: {
        Row: Student
        Insert: Omit<Student, 'id' | 'created_at'>
        Update: Partial<Omit<Student, 'id' | 'created_at'>>
        Relationships: []
      }
      faculty: {
        Row: Faculty
        Insert: Omit<Faculty, 'id' | 'created_at'>
        Update: Partial<Omit<Faculty, 'id' | 'created_at'>>
        Relationships: []
      }
      admin_staff: {
        Row: AdminStaff
        Insert: Omit<AdminStaff, 'id' | 'created_at'>
        Update: Partial<Omit<AdminStaff, 'id' | 'created_at'>>
        Relationships: []
      }
      subjects: {
        Row: Subject
        Insert: Omit<Subject, 'id' | 'created_at'>
        Update: Partial<Omit<Subject, 'id' | 'created_at'>>
        Relationships: []
      }
      sections: {
        Row: Section
        Insert: Omit<Section, 'id' | 'created_at'>
        Update: Partial<Omit<Section, 'id' | 'created_at'>>
        Relationships: [
          { foreignKeyName: 'sections_subject_id_fkey'; columns: ['subject_id']; referencedRelation: 'subjects'; referencedColumns: ['id'] },
          { foreignKeyName: 'sections_faculty_id_fkey'; columns: ['faculty_id']; referencedRelation: 'faculty'; referencedColumns: ['id'] },
        ]
      }
      programs: {
        Row: Program
        Insert: Omit<Program, 'id' | 'created_at'>
        Update: Partial<Omit<Program, 'id' | 'created_at'>>
        Relationships: []
      }
      curriculum_map: {
        Row: CurriculumEntry
        Insert: Omit<CurriculumEntry, 'id' | 'created_at'>
        Update: Partial<Omit<CurriculumEntry, 'id' | 'created_at'>>
        Relationships: [
          { foreignKeyName: 'curriculum_map_program_id_fkey'; columns: ['program_id']; referencedRelation: 'programs'; referencedColumns: ['id'] },
          { foreignKeyName: 'curriculum_map_subject_id_fkey'; columns: ['subject_id']; referencedRelation: 'subjects'; referencedColumns: ['id'] },
        ]
      }
      grades: {
        Row: Grade
        Insert: Omit<Grade, 'id' | 'created_at'>
        Update: Partial<Omit<Grade, 'id' | 'created_at'>>
        Relationships: [
          { foreignKeyName: 'grades_student_id_fkey'; columns: ['student_id']; referencedRelation: 'students'; referencedColumns: ['id'] },
          { foreignKeyName: 'grades_section_id_fkey'; columns: ['section_id']; referencedRelation: 'sections'; referencedColumns: ['id'] },
          { foreignKeyName: 'grades_subject_id_fkey'; columns: ['subject_id']; referencedRelation: 'subjects'; referencedColumns: ['id'] },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
