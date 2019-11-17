import Logger from './logger'
import Helpers from './helpers'
import TeachersClass from './teachers'

const schoolDaysCount = 5
const schoolHoursCount = 7

let maxLessons = {}
let log = null
let helpers = null
let Teachers = null
let table = null
let timetable = []
let dayIndex
let hourIndex
let classIndex

const emptyLesson = {
  subjectId: null,
  teachers: [],
}

const notFoundLesson = {
  subjectId: '----',
  teachers: [],
}

function getLesson() {
  const { suitableTeachers: teachers } = Teachers
    .sortByWorkload()
    .getWithLessonsInClass()
    .getWorkingNow()
    .getFree()
    .getHasntBeenYet()
    .getTodayMustBe()
    .sortBySubjectDivisibility()
    .sortByHoursCount()
    .findWithCoWorker()

  // log.lesson(Teachers
  //   .sortByWorkload()
  //   .getWithLessonsInClass()
  //   // .getWorkingNow()
  //   // .getFree()
  //   // .getHasntBeenYet()
  //   // .getTodayMustBe()
  //   // .sortBySubjectDivisibility()
  //   // .sortByHoursCount()
  //   // .findWithCoWorker()
  // , {
  //   day: 5,
  //   hour: 3,
  //   classTitle: 9,
  //   // logEmpty: true,
  // })

  if (!teachers.filter(Boolean).length) return null

  Teachers.decreaseWorkload(teachers)

  const lesson = {
    subjectId: table.subjects[teachers[0].subjectIndex].id,
    teachers: teachers.map(({ teacherIndex }) => table.teachers[teacherIndex]),
  }

  return lesson
}

export function generate(defaultTable: object): object {
  // The very init
  table = JSON.parse(JSON.stringify(defaultTable));
  table.schoolDaysCount = schoolDaysCount
  table.schoolHoursCount = schoolHoursCount

  log = new Logger(table)
  window.log = log
  helpers = new Helpers(table)
  Teachers = new TeachersClass(table)
  maxLessons = helpers.getMaxLessonsForClass(schoolDaysCount)

  timetable = [];
  Teachers.timetable = timetable;

  // Loop through school days
  Array(schoolDaysCount).fill(null).forEach((d, curDayIndex) => {
    // Init the day
    dayIndex = curDayIndex
    table.dayIndex = dayIndex
    timetable[dayIndex] = []
    
    // Loop through school hours
    Array(schoolHoursCount).fill(null).forEach((hour, curHourIndex) => {
      // Init the hour
      hourIndex = curHourIndex
      table.hourIndex = hourIndex
      timetable[dayIndex][hourIndex] = []

      // Loop through all classes and get a lesson for the hour
      table.classes.forEach(({ id }, curClassIndex) => {
        // Init the hour of the class
        classIndex = curClassIndex
        table.classIndex = classIndex

        timetable[dayIndex][hourIndex][classIndex] = emptyLesson

        // If current hour exceeds max hour limit of the class
        if (maxLessons[id] < hourIndex + 1) return

        const lesson = getLesson()

        // If no teachers found, put a placeholder for now
        if (!lesson) {
          const stillLeftLessons = Teachers.classHasLeftLessons()
          if (stillLeftLessons) timetable[dayIndex][hourIndex][classIndex] = notFoundLesson
          return
        }
        
        // Building a lesson's actual data
        timetable[dayIndex][hourIndex][classIndex] = lesson
      })
    })
  });

  // log.results()
  return timetable
}

export default {
  generate,
  getSubjectTitleById: id => helpers.getSubjectTitleById(id),
}