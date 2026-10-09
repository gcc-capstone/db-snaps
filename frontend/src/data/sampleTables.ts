// Fake tables shown on the settings page so users can pick which tables and columns to track.
// Only a 10-row preview of each is included; totalRows stands in for the full table size.

export type TableColumn = {
  name: string
  type: string
}

export type TablePreview = {
  name: string
  totalRows: number
  // Column used to match records between snapshots; always tracked.
  primaryKey: string
  columns: TableColumn[]
  rows: Record<string, string | number | null>[]
}

export const studentTable: TablePreview = {
  name: 'students',
  totalRows: 2512,
  primaryKey: 'student_id',
  columns: [
    { name: 'student_id', type: 'integer' },
    { name: 'first_name', type: 'text' },
    { name: 'last_name', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'major', type: 'text' },
    { name: 'minor', type: 'text' },
    { name: 'class_year', type: 'text' },
    { name: 'status', type: 'text' },
    { name: 'gpa', type: 'numeric' },
    { name: 'credits_earned', type: 'integer' },
    { name: 'advisor', type: 'text' },
    { name: 'residency', type: 'text' },
    { name: 'enrolled_term', type: 'text' },
  ],
  rows: [
    { student_id: 100231, first_name: 'Emma', last_name: 'Johnson', email: 'johnsone23@gcc.edu', major: 'Computer Science', minor: 'Mathematics', class_year: 'Senior', status: 'Active', gpa: 3.62, credits_earned: 104, advisor: 'Dr. Hutchins', residency: 'On campus', enrolled_term: 'Fall 2023' },
    { student_id: 100245, first_name: 'Noah', last_name: 'Miller', email: 'millern23@gcc.edu', major: 'Business Analytics', minor: null, class_year: 'Senior', status: 'Active', gpa: 3.18, credits_earned: 98, advisor: 'Dr. Patel', residency: 'Commuter', enrolled_term: 'Fall 2023' },
    { student_id: 100302, first_name: 'Olivia', last_name: 'Davis', email: 'daviso24@gcc.edu', major: 'Nursing', minor: 'Psychology', class_year: 'Junior', status: 'Active', gpa: 3.85, credits_earned: 71, advisor: 'Prof. Lang', residency: 'On campus', enrolled_term: 'Fall 2024' },
    { student_id: 100318, first_name: 'Liam', last_name: 'Wilson', email: 'wilsonl24@gcc.edu', major: 'Mechanical Engineering', minor: null, class_year: 'Junior', status: 'Active', gpa: 2.94, credits_earned: 66, advisor: 'Dr. Brooks', residency: 'On campus', enrolled_term: 'Fall 2024' },
    { student_id: 100327, first_name: 'Ava', last_name: 'Thompson', email: 'thompsona24@gcc.edu', major: 'Computer Science', minor: 'Business', class_year: 'Junior', status: 'Leave of Absence', gpa: 3.41, credits_earned: 58, advisor: 'Dr. Hutchins', residency: 'Commuter', enrolled_term: 'Fall 2024' },
    { student_id: 100411, first_name: 'Elijah', last_name: 'Martinez', email: 'martineze25@gcc.edu', major: 'Biology', minor: 'Chemistry', class_year: 'Sophomore', status: 'Active', gpa: 3.27, credits_earned: 34, advisor: 'Dr. Kim', residency: 'On campus', enrolled_term: 'Fall 2025' },
    { student_id: 100426, first_name: 'Sophia', last_name: 'Anderson', email: 'andersons25@gcc.edu', major: 'Undeclared', minor: null, class_year: 'Sophomore', status: 'Active', gpa: 2.88, credits_earned: 30, advisor: 'Prof. Reyes', residency: 'On campus', enrolled_term: 'Fall 2025' },
    { student_id: 100439, first_name: 'James', last_name: 'Taylor', email: 'taylorj25@gcc.edu', major: 'Business Analytics', minor: 'Economics', class_year: 'Sophomore', status: 'Withdrawn', gpa: 2.15, credits_earned: 15, advisor: 'Dr. Patel', residency: 'Commuter', enrolled_term: 'Fall 2025' },
    { student_id: 100502, first_name: 'Isabella', last_name: 'Moore', email: 'moorei26@gcc.edu', major: 'Elementary Education', minor: null, class_year: 'Freshman', status: 'Active', gpa: 3.70, credits_earned: 16, advisor: 'Prof. Lang', residency: 'On campus', enrolled_term: 'Fall 2026' },
    { student_id: 100517, first_name: 'Benjamin', last_name: 'Clark', email: 'clarkb26@gcc.edu', major: 'Computer Science', minor: null, class_year: 'Freshman', status: 'Active', gpa: null, credits_earned: 0, advisor: 'Dr. Hutchins', residency: 'On campus', enrolled_term: 'Fall 2026' },
  ],
}

export const facultyTable: TablePreview = {
  name: 'faculty',
  totalRows: 184,
  primaryKey: 'faculty_id',
  columns: [
    { name: 'faculty_id', type: 'integer' },
    { name: 'first_name', type: 'text' },
    { name: 'last_name', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'department', type: 'text' },
    { name: 'rank', type: 'text' },
    { name: 'tenure_status', type: 'text' },
    { name: 'employment_type', type: 'text' },
    { name: 'hire_year', type: 'integer' },
    { name: 'advisee_count', type: 'integer' },
    { name: 'office', type: 'text' },
  ],
  rows: [
    { faculty_id: 2011, first_name: 'Mark', last_name: 'Hutchins', email: 'mhutchins@gcc.edu', department: 'Computer Science', rank: 'Professor', tenure_status: 'Tenured', employment_type: 'Full-time', hire_year: 2004, advisee_count: 38, office: 'STEM 214' },
    { faculty_id: 2017, first_name: 'Priya', last_name: 'Patel', email: 'ppatel@gcc.edu', department: 'Business', rank: 'Associate Professor', tenure_status: 'Tenured', employment_type: 'Full-time', hire_year: 2012, advisee_count: 41, office: 'HAL 108' },
    { faculty_id: 2023, first_name: 'Susan', last_name: 'Lang', email: 'slang@gcc.edu', department: 'Nursing', rank: 'Assistant Professor', tenure_status: 'Tenure Track', employment_type: 'Full-time', hire_year: 2020, advisee_count: 27, office: 'HSC 302' },
    { faculty_id: 2030, first_name: 'Daniel', last_name: 'Brooks', email: 'dbrooks@gcc.edu', department: 'Engineering', rank: 'Professor', tenure_status: 'Tenured', employment_type: 'Full-time', hire_year: 2001, advisee_count: 33, office: 'STEM 120' },
    { faculty_id: 2042, first_name: 'Grace', last_name: 'Kim', email: 'gkim@gcc.edu', department: 'Biology', rank: 'Associate Professor', tenure_status: 'Tenured', employment_type: 'Full-time', hire_year: 2014, advisee_count: 29, office: 'STEM 331' },
    { faculty_id: 2055, first_name: 'Luis', last_name: 'Reyes', email: 'lreyes@gcc.edu', department: 'Academic Advising', rank: 'Lecturer', tenure_status: 'Non-tenure Track', employment_type: 'Full-time', hire_year: 2018, advisee_count: 112, office: 'SSC 015' },
    { faculty_id: 2061, first_name: 'Rachel', last_name: 'Owens', email: 'rowens@gcc.edu', department: 'Mathematics', rank: 'Assistant Professor', tenure_status: 'Tenure Track', employment_type: 'Full-time', hire_year: 2022, advisee_count: 14, office: 'STEM 205' },
    { faculty_id: 2068, first_name: 'Thomas', last_name: 'Greer', email: 'tgreer@gcc.edu', department: 'History', rank: 'Professor', tenure_status: 'Tenured', employment_type: 'Full-time', hire_year: 1998, advisee_count: 19, office: 'HAL 240' },
    { faculty_id: 2074, first_name: 'Hannah', last_name: 'Weiss', email: 'hweiss@gcc.edu', department: 'Computer Science', rank: 'Adjunct Instructor', tenure_status: 'Non-tenure Track', employment_type: 'Part-time', hire_year: 2024, advisee_count: 0, office: null },
    { faculty_id: 2079, first_name: 'Samuel', last_name: 'Ortiz', email: 'sortiz@gcc.edu', department: 'Psychology', rank: 'Visiting Professor', tenure_status: 'Non-tenure Track', employment_type: 'Full-time', hire_year: 2025, advisee_count: 6, office: 'SSC 118' },
  ],
}

export const sampleTables = [studentTable, facultyTable]

// Tracked table name -> tracked column names. Tables that are not tracked are left out.
export type TrackedTables = Record<string, string[]>
