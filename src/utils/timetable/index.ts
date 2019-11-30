import Logger from './logger'
import Helpers from './helpers'
import TeachersClass from './teachers'

const schoolDaysCount = 5
const schoolHoursCount = 7

let maxClassHours = {}
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
  log.lesson(Teachers
    .sortByWorkload()
    .getWithLessonsInClass()
    .getWorkingNow()
    .getHasntBeenYet()
    .getFree()
    .noNeedToSkipForThisClass()
    .filterWithCoWorkerIfNeeded()
    // .getTodayMustBe()
    // .sortByWorkIfNeeded()
    // .getLessonTeachers()
  , {
    day: 4,
    hour: 5,
    classTitle: '5e',
    logEmpty: true,
  })

  const { suitableTeachers: teachers } = Teachers
    .sortByWorkload()
    .getWithLessonsInClass()
    .getWorkingNow()
    .getHasntBeenYet()
    .getFree()
    .noNeedToSkipForThisClass()
    .filterWithCoWorkerIfNeeded()
    .getTodayMustBe()
    .sortByWorkIfNeeded()
    .getLessonTeachers()

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
  maxClassHours = helpers.getMaxHoursForClass(schoolDaysCount)
  table.maxClassHours = maxClassHours;

  console.log('maxClassHours :', JSON.parse(JSON.stringify(maxClassHours)));

  timetable = [];
  Teachers.timetable = timetable;

  // Loop through school days
  Array(schoolDaysCount).fill(null).forEach((d, curDayIndex) => {
    // Init the day
    dayIndex = curDayIndex
    table.dayIndex = dayIndex
    timetable[dayIndex] = []
    
    // Loop through school hours
    Array(schoolHoursCount).fill(null).forEach((h, curHourIndex) => {
      // Init the hour
      hourIndex = curHourIndex
      const hour = hourIndex + 1
      table.hourIndex = hourIndex
      timetable[dayIndex][hourIndex] = []

      const findLesson = ({ id: classId }, curClassIndex) => {
        // Init the hour of the class
        classIndex = curClassIndex
        table.classIndex = classIndex

        timetable[dayIndex][hourIndex][classIndex] = emptyLesson

        if (!helpers.decreaseClassHour(maxClassHours, classId, hour)) return

        const lesson = getLesson()

        // If no teachers found, put a placeholder for now
        if (!lesson) {
          const stillLeftLessons = Teachers.classHasLeftLessons()
          if (stillLeftLessons) timetable[dayIndex][hourIndex][classIndex] = notFoundLesson
          return
        }

        // Building a lesson's actual data
        timetable[dayIndex][hourIndex][classIndex] = lesson
      }

      // Loop through all classes and get a lesson for the hour
      table.classes.forEach(findLesson)

      // Switch lessons between classes
      // So that maybe it can fill empty lessons
      // table.classes.forEach(({ id: classId, title }, curClassIndex) => {
      //   if (timetable[dayIndex][hourIndex][curClassIndex] === notFoundLesson) {
      //     // Find replacable lesson for absence lesson
      //     const replacableClassIndex = timetable[dayIndex][hourIndex].findIndex(({ teachers }) => {
      //       // Find replacable teacher
      //       return teachers.find(({ workload, workhours }) => {
      //         const hasWorkInClass = workload.find(w => w.classId === classId)
      //         if (!hasWorkInClass) return false;

      //         const canWorkNow = workhours[dayIndex][hourIndex]
      //         return canWorkNow
      //       })
      //     })

      //     if (!~replacableClassIndex) return;

      //     timetable[dayIndex][hourIndex][curClassIndex] = timetable[dayIndex][hourIndex][replacableClassIndex]
      //     timetable[dayIndex][hourIndex][replacableClassIndex] = null;

      //     findLesson({ id: classId }, replacableClassIndex)

      //     // console.log(dayIndex + 1, hourIndex + 1, title, timetable[dayIndex][hourIndex][replacableClassIndex]);
          
      //     if (timetable[dayIndex][hourIndex][replacableClassIndex] === notFoundLesson) {
      //       // timetable[dayIndex][hourIndex][replacableClassIndex] = timetable[dayIndex][hourIndex][curClassIndex]
      //       // timetable[dayIndex][hourIndex][curClassIndex] = notFoundLesson
      //     }
      //   }
      // })
    })
  });

  // log.results()
  return timetable
}

export default {
  generate,
  getSubjectTitleById: id => helpers.getSubjectTitleById(id),
}