import Helpers from './helpers'
import Logger from './logger'

export default class Teachers {
  table = null;

  helpers = null;

  log = null;

  timetable = null;

  suitableTeachers = null;

  constructor(table) {
    this.table = table;
    this.helpers = new Helpers(table)
    this.log = new Logger(table)
  }

  isDivisiblePair(subjectIndex) {
    return (
      this.table.classes[this.table.classIndex].isDivisible
      && this.table.subjects[subjectIndex].isDivisible
    )
  }
  
  findNotDivisibleSubject(teachers) {
    return teachers.filter(({ subjectIndex }) => {
      return !(
        this.table.subjects[subjectIndex].isDivisible
        && this.table.classes[this.table.classIndex].isDivisible
      )
    })
  }

  getTeacherHoursCountInClass({ teacherIndex, subjectIndex }) {
    const { workload } = this.table.teachers[teacherIndex]
    const { id: classId } = this.table.classes[this.table.classIndex]
    const { id: subjectId } = this.table.subjects[subjectIndex]

    return workload.find(w => w.classId === classId && w.subjectId === subjectId)?.hours
  }
  
  sortBySubjectDivisibility() {
    this.suitableTeachers = this.suitableTeachers.sort(({ subjectIndex }) => this.isDivisiblePair(subjectIndex) ? -1 : 1)
    return this
  }
  
  sortByHoursCount() {
    this.suitableTeachers = this.suitableTeachers
      .sort((first, second) => {
        const firstHoursCount = this.getTeacherHoursCountInClass(first)
        const secondHoursCount = this.getTeacherHoursCountInClass(second)

        return secondHoursCount - firstHoursCount
      })

    return this
  }
  
  sortByWorkload() {
    this.suitableTeachers = this.table.teachers.sort((first, second) => first.workloadAmount - second.workloadAmount)
    return this;
  }

  classHasLeftLessons() {
    const { id: classId } = this.table.classes[this.table.classIndex]

    return this.table.teachers.find(({ workload }) => {
      return workload.find(w => w.classId === classId && w.hours)
    })
  }

  getTodaySubjectsIdOfClass() {
    return this.timetable[this.table.dayIndex]
      .map(hours => hours[this.table.classIndex]?.subjectId)
      .filter(Boolean)
      .flat()
  }
  
  // Get teachers that has enough left lessons for the class yet
  getWithLessonsInClass() {
    const teachers = this.suitableTeachers
    const { id: theClassId, title } = this.table.classes[this.table.classIndex]
    const todaysSubjectsId = this.getTodaySubjectsIdOfClass()
  
    const teachersWithLessonsInClass = teachers
      .map(({ workload, workhours }, teacherIndex) => {
        // Find index of teacher's workload that has hours yet
        const foundWorkloads = workload.filter(({ classId, hours }) => (classId === theClassId && hours > 0))
  
        // If didn't find any workload
        if (!foundWorkloads.length) return null;
        
        // Find a workload with a new subject that hasn't been yet today
        let foundWorkIndex = foundWorkloads.findIndex(foundWorkload => !todaysSubjectsId.includes(foundWorkload.subjectId))
  
        // If didn't find subject that hasn't been today
        if (foundWorkIndex === -1) {
          // If there's workload that already been today
          if (foundWorkloads.length) foundWorkIndex = workload.indexOf(foundWorkloads[0])
          else return null
        } else {
          // Index of the founded workload that hasn't been today
          foundWorkIndex = workload.indexOf(foundWorkloads[foundWorkIndex])
        }
        
        const { subjectId } = workload[foundWorkIndex]
  
        return {
          teacherIndex,
          subjectIndex: this.helpers.getSubjectIndexById(subjectId),
          workloadIndex: foundWorkIndex,
          workhours,
        }
      })
      .filter(Boolean)

    this.suitableTeachers = teachersWithLessonsInClass
  
    this.log.teachersError('teachersWithLessonsInClass', teachersWithLessonsInClass);
  
    return this
  }

  // Get teachers that work today and at the hour
  getWorkingNow() {
    const workingNowTeachers = this.suitableTeachers?.filter(({ workhours }) => workhours[this.table.dayIndex][this.table.hourIndex])

    this.log.teachersError('workingNowTeachers', workingNowTeachers);

    this.suitableTeachers = workingNowTeachers
    return this
  }

  getFree() {
    const teachers = this.suitableTeachers
    if (!teachers?.length) return this
  
    // Filter only the teachers that aren't in any class
    const freeTeachers = teachers.filter(({ teacherIndex }) => {
      const { id: teacherId } = this.table.teachers[teacherIndex]
      // Loop through classes at current hour and check if
      // this teacher is in one of the classes
      // and choose only if she isn't in any class right now
      return !this.timetable[this.table.dayIndex][this.table.hourIndex].some(({ teachers: lessonTeachers }) => {
        // Find if the teacher has a lesson in any class right now
        return lessonTeachers?.find(({ id }) => id === teacherId)
      })
    })

    this.log.teachersError('free teachers', freeTeachers, teachers[0].subjectTitle);
  
    this.suitableTeachers = freeTeachers
    return this
  }

  getTeacherLeftDays(teacherIndex) {
    const { workhours } = this.table.teachers[teacherIndex]

    return workhours
      .slice(this.table.dayIndex, this.table.schoolDaysCount)
      .reduce((acc, day) => {
        const daysCount = Number(
          day
            .slice(this.table.hourIndex, this.table.schoolHoursCount - 1)
            .filter(Boolean).length > 0
        )
        return acc + daysCount;
      }, 0)
  }

  getCoWorker({ subjectIndex, teacherIndex }, suitableTeachers) {
    const subject = this.table.subjects[subjectIndex]
    const theClass = this.table.classes[this.table.classIndex]
  
    if (!subject.isDivisible || !theClass.isDivisible) return null
  
    const sameSubjectTeachers = suitableTeachers.filter(t => (
        t.subjectIndex === subjectIndex
        && t.teacherIndex !== teacherIndex
    ))
  
    if (!sameSubjectTeachers?.length) return null
  
    const teacher = sameSubjectTeachers[0]
  
    return teacher
  }

  howManyWorkHoursFromNow({ teacherIndex }, returnWorkhours) {
    const workhours = this.table.teachers[teacherIndex].workhours
      .slice(this.table.dayIndex, this.table.schoolDaysCount)
      .map(hours => hours.slice(this.table.hourIndex, this.table.schoolHoursCount - 1))

    // For calculating work days
    if (returnWorkhours) return workhours

    return workhours.flat().filter(Boolean).length
  }
  
  howManyWorkDaysFromNow(teacher) {
    const workhours = this.howManyWorkHoursFromNow(teacher, true)

    return workhours.filter(day => day.length).length
  }

  sortByLessWorkingHours(teachers) {
    return teachers.sort((first, second) => {
      const firstHours = this.howManyWorkHoursFromNow(first)
      const secondHours = this.howManyWorkHoursFromNow(second)

      // Ascending sort by left working hours count
      // because less hours left more important to include it
      return firstHours - secondHours
    })
  }
  
  sortByLessWorkingDays(teachers) {
    return teachers.sort((first, second) => {
      const firstDays = this.howManyWorkDaysFromNow(first)
      const secondDays = this.howManyWorkDaysFromNow(second)

      return firstDays - secondDays
    })
  }

  findWithCoWorker(customTeachers) {
    let teachers = []
    const teachersWithCoWorker = []
    const teachersWithoutCoWorker = []
    const teachersList = customTeachers || this.suitableTeachers
    const haveMoreHours = teachersList.filter(({ teacherIndex, workloadIndex }) => {
      const hasMoreLessons = this.doesTeacherHaveMoreHours({ teacherIndex, workloadIndex })
      const { subjectId } = this.table.teachers[teacherIndex].workload[workloadIndex]

      const todayHasBeenTimes = this.getTodaySubjectsIdOfClass().filter(id => id === subjectId).length

      return todayHasBeenTimes === 0 || (hasMoreLessons && todayHasBeenTimes < 2)
    })

    const suitableTeachers = haveMoreHours.length ? haveMoreHours : teachersList
    suitableTeachers.find(teacher => {  
      const coWorker = this.getCoWorker(teacher, suitableTeachers)
      if (coWorker && this.isDivisiblePair(teacher.subjectIndex)) {
        teachersWithCoWorker.push(teacher, coWorker)
        return true
      }
    })
  
    let notDivisibleTeachers = this.findNotDivisibleSubject(suitableTeachers)
    notDivisibleTeachers = this
      .sortByLessWorkingDays(
        this
          .sortByLessWorkingHours(notDivisibleTeachers)
      )
    
    if (notDivisibleTeachers?.length) {
      teachersWithoutCoWorker.push(notDivisibleTeachers[0])
    }

    const withCoWorkerHours = teachersWithCoWorker.length ? this.getTeacherHoursCountInClass(teachersWithCoWorker[0]) : 0
    const withoutCoWorkerHours = teachersWithoutCoWorker.length ? this.getTeacherHoursCountInClass(teachersWithoutCoWorker[0]) : 0

    if (!withCoWorkerHours && !withoutCoWorkerHours) {
      teachers = teachersList.filter(({ teacherIndex }) => !suitableTeachers.find(t => t.teacherIndex === teacherIndex))
    } else if (withCoWorkerHours >= withoutCoWorkerHours) {
      teachers = teachersWithCoWorker
    } else if (withCoWorkerHours < withoutCoWorkerHours) {
      teachers = teachersWithoutCoWorker
    }

    if (customTeachers) return teachers

    this.suitableTeachers = teachers
    return this
  }

  doesTeacherHaveMoreHours = (props) => {
    const { teacherIndex, workloadIndex } = props;
    const leftDays = this.getTeacherLeftDays(teacherIndex)
    const { hours: leftSubjectHours } = this.table.teachers[teacherIndex].workload[workloadIndex]
    const hasMoreLessons = leftSubjectHours >= leftDays
    
    return hasMoreLessons
  }

  getTodayMustBe() {
    let teachers = this.suitableTeachers
    
    const todayMustBe = this.findWithCoWorker(
      teachers.filter(this.doesTeacherHaveMoreHours)
    )

    if (todayMustBe.length) teachers = todayMustBe

    this.suitableTeachers = teachers
    return this
  }

  hasMoreLessonsThanLeftDays(teacherIndex, subjectIndex) {
    const { workload } = this.table.teachers[teacherIndex]
    const { id: theSubjectId } = this.table.subjects[subjectIndex]
    const { id: theClassId } = this.table.classes[this.table.classIndex]
    const leftDays = this.getTeacherLeftDays(teacherIndex)
  
    return !!workload.find(({ hours, classId, subjectId }) => {
      return classId === theClassId && hours >= leftDays && subjectId === theSubjectId
    })
  }
  
  howManyTimesTeacherHasBeenToday(subjectIndex) {
    const { id: subjectId } = this.table.subjects[subjectIndex]
  
    let found = false
    this.timetable[this.table.dayIndex].forEach(hour => {
      if (hour[this.table.classIndex]?.subjectId === subjectId) found = true
    })
  
    return found
  }
  
  getHasntBeenYet() {
    const teachers = this.suitableTeachers
    if (!teachers?.length) return this
  
    const hasntBeenYetTeachers = teachers.filter(({ teacherIndex, subjectIndex }) => {
      const subjectAlreadyBeen = this.howManyTimesTeacherHasBeenToday(subjectIndex)
  
      const hasMoreLessons = this.hasMoreLessonsThanLeftDays(teacherIndex, subjectIndex)
  
      return !subjectAlreadyBeen || hasMoreLessons
    })

    this.log.teachersError('hasntBeenYetTeachers', hasntBeenYetTeachers, teachers[0].subjectTitle);
  
    this.suitableTeachers = hasntBeenYetTeachers
    return this
  }

  decreaseWorkload(teachers) {
    teachers.forEach(({ teacherIndex, workloadIndex }) => {
      this.table.teachers[teacherIndex].workload[workloadIndex].hours -= 1
    })
  }
}