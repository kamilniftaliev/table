import Helpers from './helpers'

export default class Loggger {
  table = null;

  logWarnings = false;

  dayIndex = null;

  hourIndex = null;

  classIndex = null;

  constructor(table) {
    this.table = table;
    this.helpers = new Helpers(table)
  }

  set day(value) { return this.dayIndex = value; }
  set hour(value) { return this.hourIndex = value; }
  set theClass(value) { return this.classIndex = value; }

  workload = ({ classId, subjectId, hours }) => {
    const classTitle = this.helpers.getClassTitleById(classId)
    const subjectTitle = this.helpers.getSubjectTitleById(subjectId)
  
    return `${classTitle}, ${subjectTitle}, ${hours}`
  }
  
  parseLesson = (lesson) => {
    if (!lesson) return ''
    const { teacherIndex, subjectIndex } = lesson
    const { name: lessonTeacher } = this.table.teachers[teacherIndex]
    const { title: subject } = this.table.subjects[subjectIndex]
    return `${subject}, ${lessonTeacher}`
  }

  lesson = (
    teachers,
    {
      day,
      hour,
      classTitle,
      teacher,
      logEmpty = false,
      title = '',
    } = {},
    ...rest
  ) => {
    const teachersIsObject = (!!teachers) && !Array.isArray(teachers);
    if (teachersIsObject) {
      if (Array.isArray(teachers.suitableTeachers)) teachers = teachers.suitableTeachers
      else teachers = [teachers]
    }

    const curDay = this.dayIndex + 1
    const curHour = this.hourIndex + 1
    const { title: curClassTitle } = this.table.classes[this.classIndex]
    const timeText = `${curClassTitle}, day: ${curDay}, hour: ${curHour}`
    
    const teachersLog = teachers?.reduce((acc, lesson) => {
      const log = `${timeText}, ${this.parseLesson(lesson)}`
  
      const fitsDay = (typeof day === 'number' && curDay === day) || typeof day !== 'number'
      const fitsHour = (typeof hour === 'number' && curHour === hour) || typeof hour !== 'number'
      const fitsClass = (typeof classTitle !== 'undefined' && curClassTitle.includes(classTitle)) || typeof classTitle === 'undefined'
      const fitsTeacher = (typeof teacher !== 'undefined' && log.includes(teacher)) || typeof teacher === 'undefined'
  
      const fits = fitsDay && fitsHour && fitsClass && fitsTeacher
  
      return fits ? `${acc}\n${log}` : acc;
    }, '').trim()

    let logArr = []
  
    if (teachersLog?.length) {
      logArr = [`${title}\n${teachersLog}`, ...rest]
    } else if (logEmpty) {
      logArr = [`NOTHING FOR ${title}`]
    }

    console.log.apply(null, logArr)
    return logArr
  }

  warning = (...text) => {
    if (!this.logWarnings) return;
    const { title: classTitle } = this.table.classes[this.classIndex]
    console.info(text.join(','), classTitle, this.dayIndex + 1, this.hourIndex + 1)
  }
  
  results = () => {
    console.log('--------- LEFT TEACHERS -------');
    const resultTable = JSON.parse(JSON.stringify(this.table))
    resultTable.teachers.forEach(({ workload, name }) => {
      const leftHours = workload.filter(({ hours }) => hours)
  
      leftHours.forEach(({ subjectId, classId, hours }) => {
        const subjectTitle = this.helpers.getSubjectTitleById(subjectId)
        const classTitle = this.helpers.getClassTitleById(classId)
  
        if (subjectTitle) {
          console.log(name, subjectTitle, classTitle, hours);
        }
      })
  
    })
    console.log('------- END LEFT TEACHERS END ------- ');
  }
}