export interface Class {
  id: string;
  number: number;
  letter: string;
  sector: string;
  shift: number;

  teachers: number;
  subjects: number;
  lessons: number;
}

export interface Table {
  id: string;
  slug: string;
  title: string;
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
  tableSlug: string;
  shifts: number;
}

export interface SubjectTitle {
  ru: string;
}

export interface Subject {
  id: string;
  title: SubjectTitle;
}

export interface Workload {
  hours: number;
  subjectId: Subject['id'];
  classId: Class['id'];
}

export interface Teacher {
  id: string;
  name: string;
  workload: Workload[];
  workhours: boolean[][];
  workloadAmount: number;
  workhoursAmount: number;
  subjects?: number;
  classes?: number;
}

export interface Lesson {
  id?: string;
  classTitle: string;
  subjectTitle: Subject['title'];
  teachersName: Teacher['name'];
}

export interface ClassHour {
  [hour: number]: number;
}

export interface ClassHours {
  [classId: string]: ClassHour;
}


// ---------- TABLE ----------------- //

export interface TableTeacher {
  teacherIndex: number;
  subjectIndex: number;
  workloadIndex: number;
}

// export type Timetable []