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
let dayIndex, hourIndex, classIndex
const emptyLesson = {
  subjectId: null,
  teachers: [],
}

const notFoundLesson = {
  subjectId: '----',
  teachers: [],
}

function getLesson() {
  const {
    suitableTeachers: teachers
  } = Teachers
    .sortByWorkload()
    .getWithLessonsInClass()
    .getWorkingNow()
    .getFree()
    .getHasntBeenYet()
    .getTodayMustBe()
    .sortBySubjectDivisibility()
    .findWithCoWorker()

  log.lesson(
    Teachers
      .sortByWorkload()
      .getWithLessonsInClass()
      .getWorkingNow()
      .getFree()
      .getHasntBeenYet()
      .getTodayMustBe()
      .sortBySubjectDivisibility()
      // .findWithCoWorker()
  , { day: 1, classTitle: '5ə' })

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
  log = new Logger(table)
  window.log = log
  helpers = new Helpers(table)
  Teachers = new TeachersClass(table)
  maxLessons = helpers.getMaxLessonsForClass(schoolDaysCount)

  timetable = [];
  Teachers.timetable = timetable;
  Teachers.schoolDaysCount = schoolDaysCount

  // Loop through school days
  Array(schoolDaysCount).fill(null).forEach((d, curDayIndex) => {
    // Init the day
    dayIndex = curDayIndex
    log.dayIndex = dayIndex
    Teachers.dayIndex = dayIndex
    timetable[dayIndex] = []
    
    // Loop through school hours
    Array(schoolHoursCount).fill(null).forEach((hour, curHourIndex) => {
      // Init the hour
      hourIndex = curHourIndex
      log.hourIndex = hourIndex
      Teachers.hourIndex = hourIndex
      timetable[dayIndex][hourIndex] = []

      // Loop through all classes and get a lesson for the hour
      table.classes.forEach(({ id }, curClassIndex) => {
        // Init the hour of the class
        classIndex = curClassIndex
        log.classIndex = classIndex
        Teachers.classIndex = classIndex

        timetable[dayIndex][hourIndex][classIndex] = emptyLesson

        // If current hour exceeds max hour limit of the class
        if (maxLessons[id] < hourIndex + 1) return

        const lesson = getLesson()

        // If no teachers found, put a placeholder for now
        if (!lesson) {
          timetable[dayIndex][hourIndex][classIndex] = notFoundLesson
          return
        }
        
        // Building a lesson's actual data
        timetable[dayIndex][hourIndex][classIndex] = lesson
      })
    })
  });

  log.results()
  return timetable
}

export default {
  generate,
  getSubjectTitleById: id => helpers.getSubjectTitleById(id),
}