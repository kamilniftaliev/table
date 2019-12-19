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

  // If class and the given subject both are divisible
  isDivisiblePair(subjectIndex, classIndex = this.table.classIndex) {
    const { id: classId, title: classTitle } = this.table.classes[classIndex];
    const { id: subjectId, title: subjectTitle } = this.table.subjects[subjectIndex];

    const sameClassSameSubjectTeachers = this.table.teachers.filter(({ workload }) => {
      return workload.find(w => (
        w.classId === classId
        && w.subjectId === subjectId
        && w.hours
      ));
    });

    // If same subject is taught by more than 2 teachers
    // Warn about it
    if (sameClassSameSubjectTeachers.length > 2) {
      console.warn(classTitle, subjectTitle, sameClassSameSubjectTeachers)
    }

    return sameClassSameSubjectTeachers.length === 2;
  }
  
  filterDivisibleSubjects(teachers) {
    return teachers.filter((teacher) => {
      const coWorker = this.getCoWorker(teacher, teachers)
      if (this.isDivisiblePair(teacher.subjectIndex) && coWorker) {
        return true
      }
    })
  }

  filterUniqueDivisibleSubjects(teachers) {
    // const divisibleTeachers = this.filterDivisibleSubjects(teachers)
    const foundSubjectIndexes = []

    return teachers.filter(({ subjectIndex }, index) => {
      const fits = !foundSubjectIndexes.includes(subjectIndex)
      if (fits) foundSubjectIndexes.push(subjectIndex)

      return fits
      // return divisibleTeachers.find((t2, t2Index) => {
      //   return (
      //     t.subjectIndex !== t2.subjectIndex // Subject is same
      //     // && t.teacherIndex !== t2.teacherIndex // Teacher is different
      //   )
      // })
    })
  }

  // filterNotDivisibleSubjects(teachers) {
  //   return teachers.filter(({ subjectIndex }) => {
  //     return !(
  //       this.table.subjects[subjectIndex].isDivisible
  //       && this.table.classes[this.table.classIndex].isDivisible
  //     )
  //   })
  // }

  getTeacherWorkloadCountInClass(teacher, workloadPerSubject?) {
    const { teacherIndex, subjectIndex } = teacher;
    const { workload } = this.table.teachers[teacherIndex]
    const { id: subjectId } = this.table.subjects[subjectIndex]
    const classIndex = this.helpers.getClassIndexFromTeacher(teacher);
    const { id: classId } = this.table.classes[classIndex]

    // If per subject is requested then test by subject
    // otherwise if there are other teachers
    // match only classId
    const matches = w => (
      w.classId === classId
        && (
          workloadPerSubject
          && w.subjectId === subjectId
        )
    );

    return workload.reduce((acc, w) => matches(w) ? acc + w.hours : acc, 0)
  }
  
  sortBySubjectDivisibility() {
    this.suitableTeachers = this.suitableTeachers
      .sort(({ subjectIndex }) => this.isDivisiblePair(subjectIndex) ? -1 : 1)

    return this
  }
  
  sortByLeftWorkload(customTeachers) {
    const teachers = customTeachers || this.suitableTeachers

    const teacherIndexes = new Set(teachers.map(t => t.teacherIndex));
    const workloadPerSubject = teacherIndexes.size === 1;

    teachers.sort((first, second) => {
      const firstHoursCount = this.getTeacherWorkloadCountInClass(first, workloadPerSubject)
      const secondHoursCount = this.getTeacherWorkloadCountInClass(second, workloadPerSubject)

      return secondHoursCount - firstHoursCount
    })

    if (customTeachers) return teachers;

    this.suitableTeachers = teachers

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

  getTodaySubjectsIdOfClass(classIndex = this.table.classIndex) {
    return this.timetable[this.table.dayIndex]
      .map(hours => hours[classIndex]?.subjectId)
      .filter(Boolean)
      .flat()
  }
  
  // Get teachers that has enough left lessons for the class yet
  getWithLessonsInClass(
    customTeachers,
    {
      classIndex = this.table.classIndex,
    } = {}
  ) {
    const teachers = customTeachers || this.suitableTeachers
    const { id: theClassId } = this.table.classes[classIndex]
    const todaysSubjectsId = this.getTodaySubjectsIdOfClass()
  
    const teachersWithLessonsInClass = teachers
      .map(({ workload, workhours }, teacherIndex) => {
        // Find index of teacher's workload that has hours yet
        const foundWorkloads = workload.filter(({ classId, hours }) => (classId === theClassId && hours > 0))
  
        // If didn't find any workload
        if (!foundWorkloads.length) return null;
        
        // Find a workloads with a new subject that hasn't been yet today
        let foundWorks = foundWorkloads//.filter(foundWorkload => !todaysSubjectsId.includes(foundWorkload.subjectId))
  
        // If didn't find subject that hasn't been today
        // if (!foundWorks.length) {
        //   // If there's workload that already been today
        //   if (foundWorkloads.length) [foundWorks] = foundWorkloads
        //   else return null
        // }

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

    if (customTeachers) return teachersWithLessonsInClass;

    this.suitableTeachers = teachersWithLessonsInClass
  
    this.log.teachersError('teachersWithLessonsInClass', teachersWithLessonsInClass);
  
    return this
  }

  // Get teachers that work today and at the hour
  getWorkingNow(customTeachers) {
    const teachers = customTeachers || this.suitableTeachers;
    const workingNowTeachers = teachers?.filter(({ workhours }) => workhours[this.table.dayIndex][this.table.hourIndex])

    if (customTeachers) return workingNowTeachers;

    this.log.teachersError('workingNowTeachers', workingNowTeachers);

    this.suitableTeachers = workingNowTeachers
    return this
  }

  getFree(customTeachers) {
    const teachers = customTeachers || this.suitableTeachers
    if (!teachers?.length) {
      if (customTeachers) return customTeachers;
      return this
    }

    const { classId } = this.table.teachers[teachers[0].teacherIndex].workload[teachers[0].workloadIndex]
    const timetableHour = this.timetable[this.table.dayIndex][this.table.hourIndex];
  
    // Filter only the teachers that aren't in any class
    const freeTeachers = teachers.filter(({ teacherIndex }) => {
      const { id: teacherId, name } = this.table.teachers[teacherIndex]
      // Loop through classes at current hour and check if
      // this teacher is in one of the classes
      // and choose only if she isn't in any class right now

      // if (
      //   this.log.match({
      //     day: 4,
      //     hour: 2,
      //     classTitle: 8,
      //   })
      //   // && name.includes('ülnarə Nəzirova')
      //   && this.helpers.getClassTitleById(classId).includes('5e')
      //   && customTeachers
      // ) {
      //   debugger;
      // }

      return !timetableHour.some(({ teachers: lessonTeachers }) => {
        // Find if the teacher has a lesson in any class right now
        return lessonTeachers?.find(({ id }) => id === teacherId)
      })
    });

    if (customTeachers) return freeTeachers;

    this.log.teachersError('free teachers', freeTeachers, teachers[0].subjectTitle);
  
    this.suitableTeachers = freeTeachers
    return this
  }

  getTeacherLeftDays(teacherIndex) {
    const { workhours } = this.table.teachers[teacherIndex]
    const curDayIndex = this.table.dayIndex;
    const { id: classId } = this.table.classes[this.table.classIndex];
    const maxHourForClass = Math.max(...Object.keys(this.table.maxClassHours[classId]).map(Number));

    return workhours
      .slice(curDayIndex, this.table.schoolDaysCount)
      .reduce((acc, day, di) => {
        const dayIndex = di + curDayIndex
        // Slice the day's hours from current hour if the day is current day (today)
        // else just count rest of the day
        const hourStartIndex = dayIndex === curDayIndex ? this.table.hourIndex : 0;
        const daysCount = Number(
          day
            .slice(hourStartIndex, maxHourForClass)
            .filter(Boolean).length > 0
        )
        return acc + daysCount;
      }, 0)
  }

  getCoWorker(
    { subjectIndex, teacherIndex },
    suitableTeachers = this.suitableTeachers
  ) {
    // const subject = this.table.subjects[subjectIndex]
    if (!suitableTeachers[0]) return null;

    const teacherInfo = suitableTeachers[0];

    const { classId } = this.table.teachers[teacherInfo.teacherIndex].workload[teacherInfo.workloadIndex];
    const classIndex = this.table.classes.findIndex(({ id }) => id === classId);
  
    if (!this.isDivisiblePair(subjectIndex, classIndex)) return null;
  
    const sameSubjectTeachers = suitableTeachers.filter(t => (
      t.subjectIndex === subjectIndex
      && t.teacherIndex !== teacherIndex
    ))
  
    if (!sameSubjectTeachers?.length) return null
  
    const teacher = sameSubjectTeachers[0]
  
    return teacher
  }

  howManyWorkhoursFromNow = (
    {
      teacherIndex,
      workloadIndex,
    },
    returnWorkhours?
  ) => {
    const curDayIndex = this.table.dayIndex;
    const teacher = this.table.teachers[teacherIndex];
    const { classId } = teacher.workload[workloadIndex];
    const classHoursLimit = Object.keys(this.table.maxClassHours[classId]).map(Number);

    const workhours = teacher.workhours
      .slice(curDayIndex, this.table.schoolDaysCount)
      .map((day, di) => {
        const dayIndex = di + curDayIndex;

        let maxHourForClass = Math.max(...classHoursLimit);

        // Find max available hour for the class
        if (this.table.maxClassHours[classId][maxHourForClass] - di <= 0) {
          maxHourForClass = Math.min(...classHoursLimit);
        }

        // Start counting from the hour of each day
        // If it's today then count from current hour
        // Or else count from start of the day
        const hourStartIndex = dayIndex === curDayIndex ? this.table.hourIndex : 0
        return day.slice(hourStartIndex, maxHourForClass)
      });

    // For calculating work days
    if (returnWorkhours) return workhours;

    return workhours.flat().filter(Boolean).length;
  }
  
  howManyWorkDaysFromNow(teacher) {
    const workhours = this.howManyWorkhoursFromNow(teacher, true)

    return workhours.filter(day => day?.length).length
  }

  sortByLessWorkhours(teachers) {
    return teachers.sort((first, second) => {
      const firstHours = this.howManyWorkhoursFromNow(first)
      const secondHours = this.howManyWorkhoursFromNow(second)

      // Ascending sort by left working hours count
      // because less hours left more important to include it
      return firstHours - secondHours
    })
  }

  getTeacherWorkload = (teacher) => {
    const { subjectIndex, teacherIndex } = teacher;
    const { id: subjectId } = this.table.subjects[subjectIndex]
    const { workload } = this.table.teachers[teacherIndex]
    const classIndex = this.helpers.getClassIndexFromTeacher(teacher);
    const { id: classId } = this.table.classes[classIndex];
    
    return workload
      .find(w => w.classId === classId && w.subjectId === subjectId)?.hours;
  }

  getTeacherWorkloadInOtherClasses = (teacher) => {
    const { teacherIndex } = teacher;
    const { workload } = this.table.teachers[teacherIndex]
    const classIndex = this.helpers.getClassIndexFromTeacher(teacher);
    const { id: classId } = this.table.classes[classIndex]

    return workload.reduce((acc, w) => w.classId !== classId ? acc + w.hours : acc, 0);
  }

  sortByWorkloadInOtherClasses = (teachers) => {
    return teachers.sort((first, second) => {
      const firstWorkload = this.getTeacherWorkloadInOtherClasses(first)
      const secondWorkload = this.getTeacherWorkloadInOtherClasses(second)

      return secondWorkload - firstWorkload
    })
  }

  sortByOverallWorkload = (teachers) => {
    return teachers.sort((first, second) => {
      const firstLeftWorkingHours = this.howManyWorkhoursFromNow(first)
      const firstOverallWorkload = this.getTeacherOverallWorkload(first)
      const firstHours = firstLeftWorkingHours - firstOverallWorkload;
      
      const secondLeftWorkingHours = this.howManyWorkhoursFromNow(second)
      const secondOverallWorkload = this.getTeacherOverallWorkload(second)
      const secondHours = secondLeftWorkingHours - secondOverallWorkload;

      return firstHours - secondHours
    })
  }

  // Only if teachers have same amount of workload left
  sortByWorkIfNeeded(customTeachers) {
    let teachers = customTeachers || this.suitableTeachers;

    if (teachers.length <= 1) {
      if (customTeachers) return teachers;
      return this;
    }

    const teachersWorkloadHours = teachers.map(this.getTeacherWorkload)

    const uniqueWorkload = new Set(teachersWorkloadHours)

    // If all teachers have same workload
    if (uniqueWorkload.size === 1) {
      const teachersWorkhours = teachers.map(t => this.howManyWorkhoursFromNow(t))
      const uniqueWorkhours = new Set(teachersWorkhours)

      // If left work hours are also same
      if (uniqueWorkhours.size === 1) {
        teachers = this.sortByWorkloadInOtherClasses(teachers)
      } else {
        teachers = this.sortByLessWorkhours(teachers)
      }
    } else {
      const uniqueWorkloads = new Set(teachers.map(this.getTeacherOverallWorkload));

      if (uniqueWorkloads.size === 1) {
        teachers = this.sortByLeftWorkload(teachers);
      } else {
        teachers = this.sortByOverallWorkload(teachers);
      }
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

  // First suitable teacher (with coworker if needed)
  filterWithCoWorkerIfNeeded(customTeachers) {
    const teachersList = customTeachers || this.suitableTeachers

    const teachers = teachersList.filter(teacher => {
      const { classId } = this.table.teachers[teacher.teacherIndex].workload[teacher.workloadIndex];
      const classIndex = this.table.classes.findIndex(({ id }) => id === classId);

      if (this.isDivisiblePair(teacher.subjectIndex, classIndex)) {
        return !!this.getCoWorker(teacher, teachersList)
      }

      return true;
    })

    if (customTeachers) return teachers

    this.suitableTeachers = teachers
    return this
  }

  doesTeacherHaveMoreHours = (teacher, customTeachers?) => {
    const { teacherIndex, workloadIndex, subjectIndex } = teacher;
    const leftDays = this.getTeacherLeftDays(teacherIndex)
    const { hours: leftSubjectHours } = this.table.teachers[teacherIndex].workload[workloadIndex]
    let hasMoreLessons = leftSubjectHours >= leftDays;

    const classIndex = this.helpers.getClassIndexFromTeacher(teacher);

    // If the teacher doesn't have more hours
    // find out if coworker has
    if (this.isDivisiblePair(subjectIndex, classIndex) && !hasMoreLessons) {
      const coWorker = this.getCoWorker(teacher, customTeachers);

      if (coWorker) {
        const { hours: coWorkerLeftSubjectHours } = this.table
          .teachers[coWorker.teacherIndex]
          .workload[coWorker.workloadIndex]

        hasMoreLessons = coWorkerLeftSubjectHours >= this.getTeacherLeftDays(coWorker.teacherIndex)
      }
    }
    
    return hasMoreLessons
  }

  getTeacherWithMinWorkload(teachers) {
    return this.getTeacherWorkloadCountInClass(this.sortByLeftWorkload(teachers)[0])
  }

  getTeacherOverallWorkload = ({ teacherIndex }) => {
    const { workload } = this.table.teachers[teacherIndex]

    return workload.reduce((acc, w) => acc + w.hours, 0);
  }

  getTodayMustBe(customTeachers) {
    let teachers = customTeachers || this.suitableTeachers

    if (!teachers.length) {
      if (customTeachers) return [];
      this.suitableTeachers = []
      return this;
    }

    const haveMoreWorkloadThanHours = teachers.filter(teacher => {
      let overallWorkload = this.getTeacherOverallWorkload(teacher)
      let workhours = this.howManyWorkhoursFromNow(teacher)
      let hasMoreWorkloadThanHours = overallWorkload >= workhours
      const coWorker = this.getCoWorker(teacher, teachers)
      const classIndex = this.helpers.getClassIndexFromTeacher(teacher);
      // const { title: classTitle } = this.table.classes[classIndex];

      if (this.isDivisiblePair(teacher.subjectIndex, classIndex) && coWorker && !hasMoreWorkloadThanHours) {
        overallWorkload = this.getTeacherOverallWorkload(coWorker)
        workhours = this.howManyWorkhoursFromNow(coWorker)

        hasMoreWorkloadThanHours = overallWorkload >= workhours
      }

      return hasMoreWorkloadThanHours
    });

    // if (
    //   !customTeachers
    //   && this.log.match({
    //     day: 2,
    //     hour: 2,
    //     classTitle: '5ə',
    //   })
    // ) {
    //   const teach = this.log.lesson(haveMoreWorkloadThanHours, { justReturn: true });
    //   console.log(teach);
    //   debugger;
    // }
    
    if (haveMoreWorkloadThanHours.length) {
      teachers = this.sortByLessWorkhours(haveMoreWorkloadThanHours);
    } else {
      let filtered = [];
      const sortedByWorkload = this.sortByWorkIfNeeded(teachers);
      const bestTeacher = sortedByWorkload[0];

      const bestTeacherWorkhours = this.howManyWorkhoursFromNow(bestTeacher);
      const bestTeacherWorkload = this.getTeacherOverallWorkload(bestTeacher);
      if (bestTeacherWorkhours - bestTeacherWorkload < 2) {
        filtered = teachers.filter(t => t.subjectIndex === bestTeacher.subjectIndex);
      } else {
        filtered = teachers.filter(t => this.doesTeacherHaveMoreHours(t, teachers));
      }
      const todayMustBe = this.filterWithCoWorkerIfNeeded(filtered);

      if (todayMustBe.length) teachers = todayMustBe;
    }

    if (customTeachers) return teachers;

    this.suitableTeachers = teachers;
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
  
  getHasntBeenYet(customTeachers, classIndex) {
    const teachers = customTeachers || this.suitableTeachers
    if (!teachers?.length) {
      if (customTeachers) return customTeachers;
      return this
    }
  
    // Filter only those who wasn't teaching today
    // Or got more hours than left days
    const hasntBeenYetTeachers = teachers.filter((teacher) => {
      const { teacherIndex, subjectIndex } = teacher;
      const { id: subjectId } = this.table.subjects[subjectIndex]
      const todayHasBeenTimes = this.getTodaySubjectsIdOfClass(classIndex)
        .filter(id => id === subjectId).length
  
      const hasMoreLessons = this.hasMoreLessonsThanLeftDays(teacherIndex, subjectIndex)
  
      return todayHasBeenTimes === 0 || (hasMoreLessons && todayHasBeenTimes < 2)
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
    const noNeedToSkipForThisClassTeachers = this.suitableTeachers.filter((theTeacher, index, arr) => {
      const checkSkip = (teacher) => {
        const { teacherIndex, workloadIndex, subjectIndex } = teacher;
        const { workload, name } = this.table.teachers[teacherIndex];
        const { subjectId, classId, hours } = workload[workloadIndex]

        let hasMoreHours = this.doesTeacherHaveMoreHours(teacher)

        const workloadByClass = workload.reduce((acc, w) => {
          if (!acc[w.classId]) acc[w.classId] = 0;

          acc[w.classId] += w.hours;

          return acc;
        }, {});

        // const maxHourAmongClasses = Math.max(...Object.values(workloadByClass));

        // const hasMoreWorkloadInOtherClass = workloadByClass[classId] < maxHourAmongClasses;
        // const hasEqualWorkloadInOtherClass = workloadByClass[classId] <= maxHourAmongClasses;

        // if (hasMoreWorkloadInOtherClass) return false;

        // const hasSameWorkloadInOtherClass = workloadByClass[classId] === maxHourAmongClasses;
        const maxHourForClass = Math.max(...Object.keys(this.table.maxClassHours[classId]).map(Number));

        const overallWorkload = workload
          .filter(w => w.classId === classId)
          .reduce((acc, w) => acc + w.hours, 0)

        // let otherClassHasMoreWorkloadAndLessDailyHours = false;
        let otherClassWillBeEmptyIfTake = false;
        let otherClassHasLessDailyHours = false;
        let otherClassTeachersWithoutThisOne = false;
        let teachersOfOtherClass = false;
        // let overallWorkloadInOtherClass = false;
        // let hasMoreWorkloadInOtherClass = false;

        const found = Object.keys(workloadByClass).find(theClassId => {
          const theClassHours = Object.keys(this.table.maxClassHours[theClassId]).map(Number);
          if (!theClassHours.length) return;

          const maxHourForTheClass = Math.max(...theClassHours);

          otherClassHasLessDailyHours = maxHourForTheClass < maxHourForClass;

          const classIndex = this.table.classes.findIndex(({ id }) => id === theClassId);
          const theClass = this.table.classes[classIndex];
          
          // hasMoreWorkloadInOtherClass = workloadByClass[theClass.id];

          const hasntBeenYetInOtherClass = this.getHasntBeenYet([teacher], classIndex)?.length;

          if (!hasntBeenYetInOtherClass) return false

          // overallWorkloadInOtherClass = workload
          //   .filter(w => w.classId === theClassId)
          //   .reduce((acc, w) => acc + w.hours, 0)

          // otherClassHasMoreWorkloadAndLessDailyHours = (
          //   overallWorkloadInOtherClass >= overallWorkload
          //   && otherClassHasLessDailyHours
          // )

          const classHasNoLessonNow = (
            !this.timetable[this.table.dayIndex][this.table.hourIndex][classIndex]
            || maxHourForTheClass <= this.table.hourIndex
          );

          if (!classHasNoLessonNow) return;

          teachersOfOtherClass = this.getWithLessonsInClass(this.table.teachers, { classIndex });
          teachersOfOtherClass = this.getWorkingNow(teachersOfOtherClass);
          teachersOfOtherClass = this.getHasntBeenYet(teachersOfOtherClass, classIndex);
          teachersOfOtherClass = this.getFree(teachersOfOtherClass);
          teachersOfOtherClass = this.getTodayMustBe(teachersOfOtherClass);
          if (teachersOfOtherClass.length > 1) {
            teachersOfOtherClass = this.filterWithCoWorkerIfNeeded(teachersOfOtherClass);
          }
          teachersOfOtherClass = this.sortByWorkIfNeeded(teachersOfOtherClass);
          teachersOfOtherClass = this.getLessonTeachers(teachersOfOtherClass);

          otherClassTeachersWithoutThisOne = teachersOfOtherClass.filter(t => t.teacherIndex !== teacherIndex);

          otherClassWillBeEmptyIfTake = teachersOfOtherClass.length && !otherClassTeachersWithoutThisOne.length;

          // console.log('object :', this.helpers.getClassIndexFromTeacher(teachersOfOtherClass[0]));

          const coWorkerForTheClass = this.getCoWorker(teacher, teachersOfOtherClass);

          // const isDivisible = this.isDivisiblePair(subjectIndex, classIndex);

          // const sameSubjectTeachers = teachersOfOtherClass.filter(t => (
          //   t.subjectIndex === subjectIndex
          //   && t.teacherIndex !== teacherIndex
          // ))

          const willBeInOtherClass = teachersOfOtherClass.find(t => (
            t.teacherIndex === teacherIndex
            || t.teacherIndex === coWorkerForTheClass?.teacherIndex
          ));
          // const willBeInOtherClass = (
          //   teachersOfOtherClass[0]
          //   && teachersOfOtherClass[0].teacherIndex === teacherIndex
          //   || teachersOfOtherClass[0].teacherIndex === coWorker.teacherIndex
          // );
          
          // if (
          //   this.log.match({
          //     day: 1,
          //     hour: 2,
          //     classTitle: '5ə',
          //   })
          //   && name.includes('Ellada')
          //   // && theClass.title.includes('8')
          // ) {
          //   const teach = this.log.lesson(teacher, { justReturn: true }, theClass.title);

          //   this.log.lesson(teachersOfOtherClass, {}, {
          //     teach,
          //     coWorker: this.log.lesson(coWorkerForTheClass, { justReturn: true }),
          //     willBeInOtherClass: this.log.lesson(willBeInOtherClass, { justReturn: true }),
          //     'workloadByClass[classId]': workloadByClass[classId],
          //     'workloadByClass[theClassId]': workloadByClass[theClassId],
          //   });
          // }

          return willBeInOtherClass && workloadByClass[theClassId] > workloadByClass[classId]
            // || canBeInOtherClass && (
            //   otherClassWillBeEmptyIfTake
            //   || overallWorkloadInOtherClass > overallWorkload
            //   || otherClassHasLessDailyHours
            // );
        });

        if (found) {
          this.log.lesson(teacher, {
            day: 1,
            hour: 2,
            classTitle: '4e',
            teacher: 'Bəsdi',
          }, {
            found: this.helpers.getClassTitleById(found),
            // hasMoreWorkloadInOtherClass,
            hasMoreHours,
            // otherClassHasMoreWorkloadAndLessDailyHours,
            // hasEqualWorkloadInOtherClass,
            // maxHourAmongClasses,
            workloadByClass: workloadByClass[classId],
            otherClassWillBeEmptyIfTake,
            otherClassHasLessDailyHours,
            // overallWorkloadInOtherClass,
            overallWorkload,
            otherClassTeachersWithoutThisOne,
            // teachersWithoutThisLesson,
            teachersOfOtherClass: this.log.lesson(teachersOfOtherClass, { justReturn: true }),
          })
        }

        // const isEqualOtherHasLessHours = hasEqualWorkloadInOtherClass && otherClassHasMoreWorkloadAndLessDailyHours;

        if (found) {
          return hasMoreHours;
        }

        return true
      }

      // return checkSkip(theTeacher);

      let dontSkip = checkSkip(theTeacher);

      if (!dontSkip && this.isDivisiblePair(theTeacher.subjectIndex)) {
        const coWorker = this.getCoWorker(theTeacher);
        if (coWorker) dontSkip = checkSkip(coWorker);
      }

      return dontSkip;
    })
    if (noNeedToSkipForThisClassTeachers.length) {
      this.suitableTeachers = noNeedToSkipForThisClassTeachers
    }

    return this
  }

  // Final lesson object's teachers
  getLessonTeachers(customTeachers) {
    const teachersList = customTeachers || this.suitableTeachers;
    const firstTeacher = teachersList[0]

    let teachers = []
    if (firstTeacher) {
      teachers = [firstTeacher]

      if (
        this.isDivisiblePair(
          firstTeacher.subjectIndex
        )
      ) {
        const coWorker = this.getCoWorker(firstTeacher, teachersList);
        if (coWorker) teachers.push(coWorker);
      }
    }

    if (customTeachers) return teachers;

    this.suitableTeachers = teachers

    return this
  }
}