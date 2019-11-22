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

    return workload.reduce((acc, w) => w.classId === classId ? acc + w.hours : acc, 0)
  }
  
  sortBySubjectDivisibility() {
    this.suitableTeachers = this.suitableTeachers
      .sort(({ subjectIndex }) => this.isDivisiblePair(subjectIndex) ? -1 : 1)

    return this
  }
  
  sortByLeftWorkload() {
    this.suitableTeachers = this.suitableTeachers
      .sort((first, second) => {
        const firstHoursCount = this.getTeacherHoursCountInClass(first)
        const secondHoursCount = this.getTeacherHoursCountInClass(second)

        return secondHoursCount - firstHoursCount
      })

    return this
  }
  
  sortByWorkload() {
    this.suitableTeachers = this.table.teachers
      .sort((first, second) => first.workloadAmount - second.workloadAmount)

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
    const { id: theClassId } = this.table.classes[this.table.classIndex]
    const todaysSubjectsId = this.getTodaySubjectsIdOfClass()
  
    const teachersWithLessonsInClass = teachers
      .map(({ workload, workhours }, teacherIndex) => {
        // Find index of teacher's workload that has hours yet
        const foundWorkloads = workload.filter(({ classId, hours }) => (classId === theClassId && hours > 0))
  
        // If didn't find any workload
        if (!foundWorkloads.length) return null;
        
        // Find a workloads with a new subject that hasn't been yet today
        let foundWorks = foundWorkloads.filter(foundWorkload => !todaysSubjectsId.includes(foundWorkload.subjectId))
  
        // If didn't find subject that hasn't been today
        if (!foundWorks.length) {
          // If there's workload that already been today
          if (foundWorkloads.length) [foundWorks] = foundWorkloads
          else return null
        }

        const makeTeacher = (work) => ({
          teacherIndex,
          subjectIndex: this.helpers.getSubjectIndexById(work.subjectId),
          workloadIndex: workload.indexOf(work),
          workhours,
        })
        
        if (Array.isArray(foundWorks)) {
          return foundWorks.map(makeTeacher)
        } else {
          return makeTeacher(foundWorks)
        }

        
      })
      .filter(Boolean)
      .flat()

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
    const curDayIndex = this.table.dayIndex;

    return workhours
      .slice(curDayIndex, this.table.schoolDaysCount)
      .reduce((acc, day, dayIndex) => {
        // Slice the day's hours from current hour if the day is current day (today)
        // else just count rest of the day
        const hourStartIndex = dayIndex === curDayIndex ? this.table.hourIndex : 0;
        const daysCount = Number(
          day
            .slice(hourStartIndex, this.table.schoolHoursCount)
            .filter(Boolean).length > 0
        )
        return acc + daysCount;
      }, 0)
  }

  getCoWorker({ subjectIndex, teacherIndex }, suitableTeachers = this.suitableTeachers) {
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
    const curDayIndex = this.table.dayIndex
    const workhours = this.table.teachers[teacherIndex].workhours
      .slice(curDayIndex, this.table.schoolDaysCount)
      .map((day, dayIndex) => {
        // Start counting from the hour of each day
        // If it's today then count from current hour
        // Or else count from start of the day
        const hourStartIndex = dayIndex === curDayIndex ? this.table.hourIndex : 0
        return day.slice(hourStartIndex, this.table.schoolHoursCount)
      })

    // For calculating work days
    if (returnWorkhours) return workhours

    return workhours.flat().filter(Boolean).length
  }
  
  howManyWorkDaysFromNow(teacher) {
    const workhours = this.howManyWorkHoursFromNow(teacher, true)

    return workhours.filter(day => day?.length).length
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

  // Only if teachers have same amount of workload left
  sortByWorkhoursIfNeeded(customTeachers) {
    let teachers = customTeachers || this.suitableTeachers;

    if (teachers.length <= 1) {
      if (customTeachers) return teachers;
      return this;
    }

    const teachersHours = teachers.map(({ subjectIndex, teacherIndex }) => {
      const { id: subjectId } = this.table.subjects[subjectIndex]
      const { workload } = this.table.teachers[teacherIndex]
      const { id: classId } = this.table.classes[this.table.classIndex]
      
      return workload
        .find(w => w.classId === classId && w.subjectId === subjectId)?.hours;
    })

    const set = new Set(teachersHours)

    // If all teachers have same workload
    if (set.size === 1) {
      teachers = this.sortByLessWorkingHours(teachers)
    }

    if (customTeachers) return teachers;

    this.suitableTeachers = teachers

    return this
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
    const haveMoreHours = teachersList.filter(teacher => {
      const { teacherIndex, workloadIndex } = teacher
      const hasMoreLessons = this.doesTeacherHaveMoreHours(teacher)
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
    notDivisibleTeachers = this.sortByLessWorkingDays(
      this.sortByLessWorkingHours(notDivisibleTeachers)
    )
    
    if (notDivisibleTeachers?.length) {
      notDivisibleTeachers = this.sortByWorkhoursIfNeeded(notDivisibleTeachers)
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

  doesTeacherHaveMoreHours = ({ teacherIndex, workloadIndex, subjectIndex }) => {
    const leftDays = this.getTeacherLeftDays(teacherIndex)
    const { hours: leftSubjectHours } = this.table.teachers[teacherIndex].workload[workloadIndex]
    let hasMoreLessons = leftSubjectHours >= leftDays

    // If the teacher doesn't have more hours
    // find out if coworker has
    if (this.isDivisiblePair(subjectIndex) && !hasMoreLessons) {
      const coWorker = this.getCoWorker({ subjectIndex, teacherIndex })

      if (coWorker) {
        const { hours: coWorkerLeftSubjectHours } = this.table
          .teachers[coWorker.teacherIndex]
          .workload[coWorker.workloadIndex]

        hasMoreLessons = coWorkerLeftSubjectHours >= this.getTeacherLeftDays(coWorker.teacherIndex)
      }
    }
    
    return hasMoreLessons
  }

  getTodayMustBe() {
    let teachers = this.suitableTeachers

    const filtered = teachers.filter(this.doesTeacherHaveMoreHours);
    
    const todayMustBe = this.findWithCoWorker(filtered)

    if (todayMustBe.length) teachers = todayMustBe

    this.suitableTeachers = teachers
    return this
  }

  hasMoreLessonsThanLeftDays(teacherIndex, subjectIndex) {
    const { workload } = this.table.teachers[teacherIndex]
    const { id: theSubjectId } = this.table.subjects[subjectIndex]
    const { id: theClassId } = this.table.classes[this.table.classIndex]
    const leftDays = this.getTeacherLeftDays(teacherIndex)

    const found = workload.find(({ hours, classId, subjectId }) => (
      classId === theClassId
        && hours >= leftDays
        && subjectId === theSubjectId
    ))

    return !!found;
  }
  
  hasBeenToday(subjectIndex, classIndex = this.table.classIndex) {
    const { id: subjectId } = this.table.subjects[subjectIndex]
  
    let found = false
    this.timetable[this.table.dayIndex].forEach(hour => {
      if (hour[classIndex]?.subjectId === subjectId) found = true
    })
  
    return found
  }
  
  getHasntBeenYet(customTeachers, classIndex) {
    const teachers = customTeachers || this.suitableTeachers
    if (!teachers?.length) return this
  
    const hasntBeenYetTeachers = teachers.filter((teacher) => {
      const { teacherIndex, subjectIndex } = teacher;
      const subjectAlreadyBeen = this.hasBeenToday(subjectIndex, classIndex)
  
      const hasMoreLessons = this.hasMoreLessonsThanLeftDays(teacherIndex, subjectIndex)
  
      return !subjectAlreadyBeen || hasMoreLessons
    })

    if (customTeachers) return hasntBeenYetTeachers;

    this.log.teachersError('hasntBeenYetTeachers', hasntBeenYetTeachers, teachers[0].subjectTitle);
  
    this.suitableTeachers = hasntBeenYetTeachers
    return this
  }

  decreaseWorkload(teachers) {
    teachers.forEach(({ teacherIndex, workloadIndex }) => {
      this.table.teachers[teacherIndex].workload[workloadIndex].hours -= 1
    })
  }

  noNeedToSkipForThisClass() {
    const noNeedToSkipForThisClassTeachers = this.suitableTeachers.filter((teacher) => {
      const { teacherIndex, workloadIndex, subjectIndex } = teacher;
      const { workload } = this.table.teachers[teacherIndex];
      const { subjectId, classId, hours } = workload[workloadIndex]

      let hasMoreHours = this.doesTeacherHaveMoreHours(teacher)
      let coWorker;
      let coWorkerHasMoreHours;

      if (this.isDivisiblePair(subjectIndex)) {
        coWorker = this.getCoWorker(teacher)
        coWorkerHasMoreHours = coWorker && this.doesTeacherHaveMoreHours(coWorker)
        hasMoreHours = hasMoreHours || coWorkerHasMoreHours
      }

      const hasMoreImportantWorkload = workload.find((w, index) => {
        const hasMoreWorkloadInOtherClass = w.classId !== classId && w.subjectId === subjectId && w.hours > hours 

        if (!hasMoreWorkloadInOtherClass) return false

        const classIndex = this.table.classes.findIndex(s => s.id === w.classId)
        const hasntBeenYetInOtherClass = this.getHasntBeenYet([teacher], classIndex)?.length

        if (!hasntBeenYetInOtherClass) return false

        const hasMoreHoursInOtherClass = this.doesTeacherHaveMoreHours({
          ...teacher,
          workloadIndex: index,
        })

        return hasMoreHoursInOtherClass
      })

      // The teacher have more hours in other class
      // So include the teacher only if it's inevitable
      if (hasMoreImportantWorkload) {
        if (this.log.match({
          day: 5,
          hour: 2,
          classTitle: '5ə',
          logEmpty: true,
        })) {
          // console.log('hasMoreImportantWorkload :', hasMoreImportantWorkload);
          debugger
        }
        return hasMoreHours
      }
      
      return true
    })

    if (noNeedToSkipForThisClassTeachers.length) {
      this.suitableTeachers = noNeedToSkipForThisClassTeachers
    }

    return this
  }
}