export interface Class {
  id: string;
  title: string;
  shift: number;
}

export interface Table {
  id: string;
  title: string;
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
  tableSlug: string;
}

export interface Subject {
  id: string;
  title: string;
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
}

export interface Lesson {
  id?: string;
  classTitle: Class['title'];
  subjectTitle: Subject['title'];
  teachersName: string;
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