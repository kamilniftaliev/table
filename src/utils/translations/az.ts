export default {
  signInTitle: 'Cədvəllər yaratmaq hələ belə asan olmamışdı !',
  username: 'İstifadəçi adı',
  password: 'Şifrə',
  signIn: 'Daxil ol',
  errorPassword: 'Yanlış istifadəçi adı və ya şifrə',
  logout: 'Çıxış',

  tables: 'Cədvəllər',
  table: 'Cədvəl',
  teachers: 'Müəllimlər',
  classes: 'Sinflər',
  subjects: 'Fənnlər',

  tableName: 'Cədvəlin adı',
  lastModified: 'Son düzəliş',
  created: 'Yaradılıb',

  no: 'Xeyr',
  yes: 'Bəli',
  create: 'Yarat',
  edit: 'Dəyiş',
  actions: 'Əməliyyatlar',
  
  addNewTable: 'Yeni cədvəl yarat',
  newTableTitle: 'Yeni cədvəlin adı',
  exampleTablePlaceholder: 'Nümunə: "Dərs cədvəli"',
  editTableTitle: 'Cədvəlin yeni adı',
  pleaseConfirmTableDelete: (title: string): string =>
    `Əminsiz ki, "${title}" cədvəli silmək istəyirsiz?`,

  addNewSubject: 'Yeni fənn yarat',
  newSubject: 'Yeni fənn',
  exampleSubjectPlaceholder: 'Nümunə: "Riyaziyyat"',
  isDivisibleByGroups: 'Qruplara bölünür',
  subjectTitle: 'Fənnin Adı',
  pleaseConfirmSubjectDelete: (title: string): string =>
    `Əminsiz ki, "${title}" fənnini silmək istəyirsiz?`,

  addNewTeacher: 'Yeni müəllim əlavə et',
  newTeacher: 'Yeni müəllim',
  exampleTeacherPlaceholder: 'Nümunə: "Kamil Niftəliyev"',
  teacherName: 'Müəllimin Adı',
  pleaseConfirmTeacherDelete: (title: string): string =>
    `Əminsiz ki, "${title}" fənnini silmək istəyirsiz?`,
  
  addNewClass: 'Yeni sinif yarat',
  newClass: 'Yeni sinif',
  exampleClassPlaceholder: 'Nümunə: "9a"',
  classTitle: 'Sinfin Adı',
  pleaseConfirmClassDelete: (title: string): string =>
    `Əminsiz ki, "${title}" sinfini silmək istəyirsiz?`,

  workloadTitle: 'Dərs yükü',
  hour: 'saat',

  workhoursTitle: 'İş saatları',
  lesson: 'Dərs',
  days: 'Günlər',

  generateTimeTable: 'Cədvəli yenilə',
};
