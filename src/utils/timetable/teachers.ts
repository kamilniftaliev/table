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
      this.table.classes[this.classIndex].isDivisible
      && this.table.subjects[subjectIndex].isDivisible
    )
  }
  
  findNotDivisibleSubject(teachers) {
    return teachers.filter(({ subjectIndex }) => {
      return !this.table.subjects[subjectIndex].isDivisible
    })
  }
  
  sortBySubjectDivisibility() {
    const teachers = this.suitableTeachers
    this.suitableTeachers = teachers.sort(({ subjectIndex }) => this.isDivisiblePair(subjectIndex) ? -1 : 1)
    return this
  }
  
  sortByWorkload() {
    this.suitableTeachers = this.table.teachers.sort((first, second) => first.workloadAmount - second.workloadAmount)
    return this;
  }

  getTodaySubjectsIdOfClass() {
    return this.timetable[this.dayIndex]
      .map(hours => hours[this.classIndex]?.subjectId)
      .filter(Boolean)
      .flat()
  }
  
  // Get teachers that has enough left lessons for the class yet
  getWithLessonsInClass() {
    const teachers = this.suitableTeachers
    const { id: theClassId } = this.table.classes[this.classIndex]
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
  
    // If couldn't find a teacher that works in the class
    if (!teachersWithLessonsInClass?.length) {
      this.log.warning('Couldn"t find teachersWithLessonsInClass :');
      return this
    }
  
    this.suitableTeachers = teachersWithLessonsInClass
    return this
  }

  // Get teachers that work today and at the hour
  getWorkingNow() {
    const teachers = this.suitableTeachers
    const workingNowTeachers = teachers?.filter(({ workhours }) => workhours[this.dayIndex][this.hourIndex])

    if (!workingNowTeachers.length) {
      this.log.warning('Couldn"t find workingNowTeachers :');
      return this
    }

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
      return !this.timetable[this.dayIndex][this.hourIndex].some(({ teachers: lessonTeachers }) => {
        // Find if the teacher has a lesson in any class right now
        return lessonTeachers?.find(({ id }) => id === teacherId)
      })
    })

    // if (this.dayIndex === 0 && this.hourIndex === 1 && this.classIndex === 7) {
    //   console.log('freeTeachers :', freeTeachers);
    // }
  
    if (!freeTeachers.length) {
      this.log.warning('Couldn"t find a free teacher: ', teachers[0].subjectTitle)
      return this
    }
  
    this.suitableTeachers = freeTeachers
    return this
  }

  getTeacherLeftDays(teacherIndex) {
    const { workhours } = this.table.teachers[teacherIndex]

    return workhours
      .slice(this.dayIndex, this.schoolDaysCount - 1)
      .reduce((acc, day) => acc + Number(day.filter(Boolean).length > 0), 0)
  }

  getCoWorker({ subjectIndex, teacherIndex }, suitableTeachers) {
    const subject = this.table.subjects[subjectIndex]
    const theClass = this.table.classes[this.classIndex]
  
    if (!subject.isDivisible || !theClass.isDivisible) return null
  
    const sameSubjectTeachers = suitableTeachers.filter(t => (
        t.subjectIndex === subjectIndex
        && t.teacherIndex !== teacherIndex
    ))
  
    if (!sameSubjectTeachers?.length) return null
  
    const teacher = sameSubjectTeachers[0]
  
    return teacher
  }

  howManyHoursFromNow({ teacherIndex }) {
    const workhours = this.table.teachers[teacherIndex].workhours.slice(this.dayIndex, this.schoolDaysCount - 1)

    return workhours.flat().filter(Boolean).length
  }

  findWithCoWorker(customTeachers) {
    const teachers = []
    const suitableTeachers = customTeachers || this.suitableTeachers
    suitableTeachers.find(teacher => {  
      const coWorker = this.getCoWorker(teacher, suitableTeachers)
  
      if (coWorker && this.isDivisiblePair(teacher.subjectIndex)) {
        teachers.push(teacher, coWorker)
        return true
      }
    })

    
    // if (!teachers.length) {
    //   let notDivisibleTeachers = this.findNotDivisibleSubject(suitableTeachers)
    //   notDivisibleTeachers = notDivisibleTeachers.sort((first, second) => {
    //     const firstHours = this.howManyHoursFromNow(first)
    //     const secondHours = this.howManyHoursFromNow(second)
    //     return firstHours - secondHours
    //   })
    //   if (notDivisibleTeachers?.length) teachers.push(notDivisibleTeachers[0])
    // }

    if (customTeachers) return teachers
  
    this.suitableTeachers = teachers
    return this
  }

  getTodayMustBe() {
    let teachers = this.suitableTeachers
    const todayMustBeTeachers = teachers.filter(({ teacherIndex, workloadIndex }) => {
      const leftDays = this.getTeacherLeftDays(teacherIndex)
      const { hours: leftSubjectHours } = this.table.teachers[teacherIndex].workload[workloadIndex]
      const hasMoreLessons = leftSubjectHours >= leftDays

      return hasMoreLessons
    })

    if (this.findWithCoWorker(todayMustBeTeachers).length) {
      teachers = todayMustBeTeachers
    }

    this.suitableTeachers = teachers
    return this
  }

  hasMoreLessonsThanLeftDays(teacherIndex, subjectIndex) {
    const { workload } = this.table.teachers[teacherIndex]
    const { id: theSubjectId } = this.table.subjects[subjectIndex]
    const { id: theClassId } = this.table.classes[this.classIndex]
    const leftDays = this.getTeacherLeftDays(teacherIndex)
  
    return !!workload.find(({ hours, classId, subjectId }) => {
      return classId === theClassId && hours >= leftDays && subjectId === theSubjectId
    })
  }
  
  howManyTimesTeacherHasBeenToday(subjectIndex) {
    const { id: subjectId } = this.table.subjects[subjectIndex]
  
    let found = false
    this.timetable[this.dayIndex].forEach(hour => {
      if (hour[this.classIndex]?.subjectId === subjectId) found = true
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
  
    if (!hasntBeenYetTeachers.length) {
      this.log.warning('Couldn"t find a hasntBeenYetTeachers: ', teachers[0].subjectTitle)
      return this
    }
  
    this.suitableTeachers = hasntBeenYetTeachers
    return this
  }

  decreaseWorkload(teachers) {
    teachers.forEach(({ teacherIndex, workloadIndex }) => {
      this.table.teachers[teacherIndex].workload[workloadIndex].hours -= 1
    })
  }
}