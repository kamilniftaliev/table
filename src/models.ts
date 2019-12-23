export interface Class {
  id: string;
  title: string;
  shift: number;
}

export interface Table {
  id: string;
  title: string;
  classes: [Class];
  subjects: [Subject];
  tableSlug: string;
}

export interface Subject {
  id: string;
  title: string;
}

export interface Workload {
  hours: number;
  subjectId: string;
  classId: string;
}

export interface Teacher {
  id: string;
  name: string;
  workload: Workload;
}

export interface Lesson {
  // id: string;
  subjectId: string;
  teachers: [Teacher];
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