export default {
  signInTitle: 'Расписания никогда еще так легко не создавались !',
  username: 'Имя пользователя',
  password: 'Пароль',
  signIn: 'Войти',
  errorPassword: 'Неправильное имя пользователя или пароль',
  logout: 'Выход',

  tables: 'Таблицы',
  table: 'Таблица',
  teachers: 'Учителя',
  teacherCount: (count: number): string => {
    if (count === 0) return 'нет учителей';
    if (count === 1) return '1 учитель';
    if (count > 1 && count < 5) return `${count} учителя`;

    return `${count} учителей`;
  },
  classes: 'Классы',
  classCount: (count: number): string => {
    if (count === 0) return 'нет классов';
    if (count === 1) return '1 класс';
    if (count > 1 && count < 5) return `${count} класса`;

    return `${count} классов`;
  },
  subjects: 'Предметы',
  subjectCount: (count: number): string => {
    if (count === 0) return 'нет предметов';
    if (count === 1) return `1 предмет`;
    if (count > 1 && count < 5) return `${count} предмета`;

    return `${count} предметов`;
  },

  tableName: 'Название таблицы',
  lastModified: 'Последняя правка',
  created: 'Создано',
  addNewTable: 'Создать новую таблицу',
  pleaseConfirmDelete: (tableTitle): string =>
    `Вы уверены что хотите удалить таблицу "${tableTitle}"?`,
  no: 'Нет',
  yes: 'Да',
  create: 'Создать',
  delete: 'Удалить',
  save: 'Сохранить',
  edit: 'Изменить',
  actions: 'Действия',

  exampleTablePlaceholder: 'Пример: "Расписание уроков"',
  newTableTitle: 'Название новой таблицы',
  editTableTitle: 'Новое название таблицы',

  addNewSubject: 'Добавить предмет',
  newSubject: 'Новый предмет',
  exampleSubjectPlaceholder: 'Пример: "Математика"',
  isDivisibleByGroups: 'Делится на группы',
  subjectTitle: 'Название предмета',

  addNewTeacher: 'Добавить нового учителя',
  newTeacher: 'Новый учитель',
  exampleTeacherPlaceholder: 'Пример: "Айсель Мамедова"',
  teacherName: 'Имя учителя',
  pleaseConfirmTeacherDelete: (title: string): string =>
    `Вы уверены что хотите удалить "${title}"?`,

  addNewClass: 'Добавить новый класс',
  newClass: 'Новый класс',
  exampleClassPlaceholder: 'Пример: "9кл"',
  classTitle: 'Название класса',

  workloadTitle: 'Количество уроков',
  hour: (count: number): string => {
    if (count === 0) return 'нет часов';
    if (count === 1) return `1 час`;
    if (count > 1 && count < 5) return `${count} часа`;

    return `${count} часов`;
  },
  workhour: (count: number): string => {
    if (count === 0) return 'не работает';

    return `${count} часов`;
  },

  workhoursTitle: 'Рабочие часы',
  lesson: 'Урок',
  days: 'Дни',

  lessonHours: 'Количество уроков',

  generateTimeTable: 'Обновить таблицу',

  shift: (shift: number): string => {
    if (shift === 1 || shift === 2) {
      return `${shift}-ая смена`;
    }

    return 'Смена';
  },

  addNewWorkload: 'Добавить рабочие часы',
  selectSubject: 'Выберите предмет',
  selectClass: 'Выберите класс',
  selectHours: 'Выберите количество часов',
  selectSector: 'Выберите сектор класса',

  az: 'Азербайджанский',
  ru: 'Русский',

  class: 'Класс',
  letter: 'Буква',
  sector: 'Сектор',

  classInfo: 'Данные класса',

  weekDay: (day = 1, short?: false): string => {
    const days = [
      ['Пн.', 'Понедельник'],
      ['Вт.', 'Вторник'],
      ['Ср.', 'Среда'],
      ['Чт.', 'Четверг'],
      ['Пт.', 'Пятница'],
      ['Сб.', 'Суббота'],
      ['Вс.', 'Воскресенье'],
    ];

    return days[day - 1][short ? 0 : 1];
  },

  educationLevel: 'Уровень образования',
  educationLevelBeginner: 'Начальное',
  educationLevelMiddle: 'Основное общее',
  educationLevelHigh: 'Среднее общее',

  all: 'Все',

  emptyTableMessage: 'По вашему запросу нет результатов',

  lostLessonsTitle(lessonCount: number): string {
    return `Утерянных уроки (${this.hourByNumber(lessonCount)})`;
  },

  hourByNumber(number: number): string {
    switch (number) {
      case 1:
        return `1 час`;
      case 2:
      case 3:
      case 4:
        return `${number} часа`;
      default:
        return `${number} часов`;
    }
  },

  lostLesson({ name, subjectTitle, classTitle, hours }): string {
    return `В ${classTitle} классе ${name} ${this.hourByNumber(hours)} ${subjectTitle}`;
  }
};
