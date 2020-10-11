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
  teacherCount: (count: number): string => {
    if (count === 0) return 'müəllim yoxdur';

    return `${count} müəllim`;
  },
  classes: 'Sinflər',
  classCount: (count: number): string => {
    if (count === 0) return 'sinif yoxdur';

    return `${count} sinif`;
  },
  subjects: 'Fənnlər',
  subjectCount: (count: number): string => {
    if (count === 0) return 'fənn yoxdur';

    return `${count} fənn`;
  },

  tableName: 'Cədvəlin adı',
  lastModified: 'Son düzəliş',
  created: 'Yaradılıb',

  no: 'Xeyr',
  yes: 'Bəli',
  create: 'Yarat',
  delete: 'Sil',
  save: 'Yaddaşa sal',
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

  addNewTeacher: 'Yeni müəllim əlavə et',
  newTeacher: 'Yeni müəllim',
  exampleTeacherPlaceholder: 'Nümunə: "Aysel Məmmədova"',
  teacherName: 'Müəllimin Adı',
  pleaseConfirmTeacherDelete: (title: string): string =>
    `Əminsiz ki, "${title}" silmək istəyirsiz?`,
  
  addNewClass: 'Yeni sinif yarat',
  newClass: 'Yeni sinif',
  exampleClassPlaceholder: 'Nümunə: "9a"',
  classTitle: 'Sinfin Adı',
  pleaseConfirmClassDelete: (title: string): string =>
    `Əminsiz ki, "${title}" sinfini silmək istəyirsiz?`,

  workloadTitle: 'Dərs yükü',
  hour: (count: number): string => {
    if (count === 0) return 'dərs yoxdur';

    return `${count} saat`;
  },
  workhour: (count: number): string => {
    if (count === 0) return 'işləmir';

    return `${count} saat`;
  },

  workhoursTitle: 'İş saatları',
  lesson: 'Dərs',
  days: 'Günlər',

  lessonHours: 'Dərs saatı',

  generateTimeTable: 'Cədvəli yenilə',

  shift: (shift: number): string => {
    if (shift === 1 || shift === 2) {
      return `${shift}-ci növbə`;
    }

    return 'Növbə';
  },

  addNewWorkload: 'Dərs yükü əlavə et',
  selectSubject: 'Fənni seçin',
  selectClass: 'Sinfi seçin',
  selectHours: 'Saat sayını seçin',
  selectSector: 'Sinfin bölməsini seçin',

  az: 'Azərbaycan',
  ru: 'Rus',

  letter: 'Hərf',
  class: 'Sinif',
  sector: 'Bölmə',

  classInfo: 'Sinfin məlumatları',

  weekDay: (day = 1, short?: false): string => {
    const days = [
      ['B.e.', 'Bazar ertəsi'],
      ['Ç.a.', 'Çərşənbə axşamı'],
      ['Ç.', 'Çərşənbə'],
      ['C.a.', 'Cümə axşamı'],
      ['C.', 'Cümə'],
      ['Ş.', 'Şənbə'],
      ['B.', 'Bazar'],
    ];

    return days[day - 1][short ? 0 : 1];
  },

  educationLevel: 'Təhsil pilləsi',
  educationLevelBeginner: 'İbtidai',
  educationLevelMiddle: 'Ümumi orta',
  educationLevelHigh: 'Tam orta',

  all: 'Bütün',

  emptyTableMessage: 'Sorğunuza görə nəticə tapılmadı',

  lostLessonsTitle: (lessonCount: number): string => `İtən dərslər (${lessonCount} saat)`,

  lostLesson: ({ name, subjectTitle, classTitle, hours }): string => {
    return `${classTitle} sinfində ${name} ${hours} saat ${subjectTitle}`;
  }
};
