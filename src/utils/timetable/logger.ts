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
    const curDayIndex = this.table.dayIndex
    const { id: classId } = this.table.classes[this.table.classIndex];
    const maxHourForClass = Math.max(...Object.keys(this.table.maxClassHours[classId]).map(Number));
  
    const workhours = this.table.teachers[teacherIndex].workhours
      .slice(curDayIndex, this.table.schoolDaysCount)
      .map((day, di) => {
        const dayIndex = curDayIndex + di
        // Start counting from the hour of each day
        // If it's today then count from current hour
        // Or else count from start of the day
        const hourStartIndex = dayIndex === curDayIndex ? this.table.hourIndex : 0
        return day.slice(hourStartIndex, maxHourForClass)
      })

    return workhours.flat().filter(Boolean).length
  }

  getTeacherOverallWorkload = ({ teacherIndex }) => {
    const { workload } = this.table.teachers[teacherIndex]

    return workload.reduce((acc, w) => acc + w.hours, 0);
  }

  match({
    day,
    hour,
    classTitle,
  }) {
    const curDay = this.table.dayIndex + 1
    const curHour = this.table.hourIndex + 1
    const { title: curClassTitle } = this.table.classes[this.table.classIndex]
    const timeText = `${curClassTitle}, day: ${curDay}, hour: ${curHour}`
    const fitsDay = (typeof day === 'number' && curDay === day) || typeof day !== 'number'
    const fitsHour = (typeof hour === 'number' && curHour === hour) || typeof hour !== 'number'
    const fitsClass = (typeof classTitle !== 'undefined' && curClassTitle.includes(classTitle)) || typeof classTitle === 'undefined'

    const match = fitsDay && fitsHour && fitsClass
    
    // Time fits
    return match ? timeText : false;
  }
  
  parseLesson = (lesson) => {
    if (!lesson) return ''
    const { teacherIndex, subjectIndex } = lesson
    const { title: subject, id: subjectId } = this.table.subjects[subjectIndex]
    const { name: lessonTeacher, workload } = this.table.teachers[teacherIndex]
    const { id: classId } = this.table.classes[this.table.classIndex]
    const leftLessonsInClass = workload.find(w => w.classId === classId && w.subjectId === subjectId)?.hours;
    const leftWorkingHours = this.howManyWorkingHoursFromNow(lesson)
    const overallWorkload = this.getTeacherOverallWorkload(lesson)
    
    return `${subject}, ${lessonTeacher}, ${leftLessonsInClass}/${overallWorkload} lessons, ${leftWorkingHours} hours`;
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

    const timeText = this.match({ day, hour, classTitle })

    if (!timeText || !teachers) return;
    
    const teachersLog = teachers.reduce((acc, lesson) => {
      const log = this.parseLesson(lesson)
  
      const fitsTeacher = (typeof teacher !== 'undefined' && log.includes(teacher)) || typeof teacher === 'undefined'
  
      const fits = fitsTeacher
  
      return fits ? `${acc}\n${log}` : acc;
    }, '').trim()

    let logArr = ''
  
    if (teachersLog) {
      logArr = `${title}\n\t\t\t\t${timeText}\n${teachersLog}`
    } else if (logEmpty) {
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
    let totalLeftHours = 0;
    resultTable.teachers.forEach(({ workload, name }) => {
      const leftHours = workload.filter(({ hours }) => hours)
  
      leftHours.forEach(({ subjectId, classId, hours }) => {
        const subjectTitle = this.helpers.getSubjectTitleById(subjectId)
        const classTitle = this.helpers.getClassTitleById(classId)
  
        if (subjectTitle) {
          totalLeftHours += hours;
          console.log(name, subjectTitle, classTitle, hours);
        }
      })
  
    })

    console.log('TOTAL LEFT HOURS :', totalLeftHours);
    console.log('------- END LEFT TEACHERS END ------- ');
  }
}