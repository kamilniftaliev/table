import Helpers from './helpers'

export default class Loggger {
  table = null;

  logWarnings = false;

  constructor(table) {
    this.table = table;
    this.helpers = new Helpers(table)
  }

  workload = ({ classId, subjectId, hours }) => {
    const classTitle = this.helpers.getClassTitleById(classId)
    const subjectTitle = this.helpers.getSubjectTitleById(subjectId)
  
    return `${classTitle}, ${subjectTitle}, ${hours}`
  }

  howManyWorkingHoursFromNow({ teacherIndex }) {
    const workhours = this.table.teachers[teacherIndex].workhours
      .slice(this.table.dayIndex, this.table.schoolDaysCount - 1)
      .map(hours => hours.slice(this.table.hourIndex, this.table.schoolHoursCount))

    return workhours.flat().filter(Boolean).length
  }
  
  parseLesson = (lesson) => {
    if (!lesson) return ''
    const { teacherIndex, subjectIndex } = lesson
    const { title: subject, id: subjectId } = this.table.subjects[subjectIndex]
    const { name: lessonTeacher, workload } = this.table.teachers[teacherIndex]
    const { id: classId } = this.table.classes[this.table.classIndex]
    const leftLessonsInClass = workload.find(w => w.classId === classId && w.subjectId === subjectId)?.hours;
    const leftWorkingHours = this.howManyWorkingHoursFromNow(lesson)
    
    return `${subject}, ${lessonTeacher}, ${leftLessonsInClass} lessons, ${leftWorkingHours} hours`;
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

    const curDay = this.table.dayIndex + 1
    const curHour = this.table.hourIndex + 1
    const { title: curClassTitle } = this.table.classes[this.table.classIndex]
    const timeText = `${curClassTitle}, day: ${curDay}, hour: ${curHour}`
    const fitsDay = (typeof day === 'number' && curDay === day) || typeof day !== 'number'
    const fitsHour = (typeof hour === 'number' && curHour === hour) || typeof hour !== 'number'
    const fitsClass = (typeof classTitle !== 'undefined' && curClassTitle.includes(classTitle)) || typeof classTitle === 'undefined'
    const timeFits = fitsDay && fitsHour && fitsClass
    
    const teachersLog = teachers?.reduce((acc, lesson) => {
      const log = `${timeText}, ${this.parseLesson(lesson)}`
  
      const fitsTeacher = (typeof teacher !== 'undefined' && log.includes(teacher)) || typeof teacher === 'undefined'
  
      const fits = timeFits && fitsTeacher
  
      return fits ? `${acc}\n${log}` : acc;
    }, '').trim()

    let logArr = ''
  
    if (teachersLog?.length) {
      logArr = `${title}\n${teachersLog}`
    } else if (timeFits && logEmpty) {
      logArr = `NOTHING ${title}`
    }

    if (logArr) {
      console.log(`${logArr}\n`, ...rest)
    }
    return logArr
  }

  warning = (...text) => {
    if (!this.logWarnings) return;
    const { title: classTitle } = this.table.classes[this.table.classIndex]
    console.info(text.join(','), classTitle, this.table.dayIndex + 1, this.table.hourIndex + 1)
  }

  // If couldn't find a teacher that works in the class
  teachersError = (title, teachers, ...text) => {
    if (!teachers?.length) this.warning(`Couldn"t find ${title}`, ...text);
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