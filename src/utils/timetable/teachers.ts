import Helpers from './helpers';
import Logger from './logger';

export default class Teachers {
  table = null;

  helpers = null;

  log = null;

  timetable = null;

  suitableTeachers = null;

  constructor(table) {
    this.table = table;
    this.helpers = new Helpers(table);
    this.log = new Logger(table);
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
      console.warn(classTitle, subjectTitle, sameClassSameSubjectTeachers);
    }

    return sameClassSameSubjectTeachers.length === 2;
  }
  
  filterDivisibleSubjects(teachers) {
    return teachers.filter((teacher) => {
      const coWorker = this.getCoWorker(teacher, teachers);
      if (this.isDivisiblePair(teacher.subjectIndex) && coWorker) {
        return true;
      }
    });
  }

  filterUniqueDivisibleSubjects = (teachers) => {
    // const divisibleTeachers = this.filterDivisibleSubjects(teachers)
    const foundSubjectIndexes = [];

    return teachers.filter(({ subjectIndex }, index) => {
      const fits = !foundSubjectIndexes.includes(subjectIndex);
      if (fits) foundSubjectIndexes.push(subjectIndex);

      return fits;
    });
  }

  getTeacherWorkloadCountInClass(teacher, workloadPerSubject?) {
    const { teacherIndex, subjectIndex } = teacher;
    const { workload } = this.table.teachers[teacherIndex];
    const { id: subjectId } = this.table.subjects[subjectIndex];
    const classIndex = this.helpers.getClassIndexFromTeacher(teacher);
    const { id: classId } = this.table.classes[classIndex];

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

    return workload.reduce((acc, w) => matches(w) ? acc + w.hours : acc, 0);
  }
  
  sortBySubjectDivisibility() {
    this.suitableTeachers = [...this.suitableTeachers]
      .sort(({ subjectIndex }) => this.isDivisiblePair(subjectIndex) ? -1 : 1);

    return this;
  }
  
  sortByLeftWorkload(customTeachers) {
    const teachersList = customTeachers || this.suitableTeachers;

    const teacherIndexes = new Set(teachersList.map(t => t.teacherIndex));
    const workloadPerSubject = teacherIndexes.size === 1;

    const teachers = [...teachersList].sort((first, second) => {
      const firstHoursCount = this.getTeacherWorkloadCountInClass(first, workloadPerSubject);
      const secondHoursCount = this.getTeacherWorkloadCountInClass(second, workloadPerSubject);

      return secondHoursCount - firstHoursCount;
    });

    if (customTeachers) return teachers;

    this.suitableTeachers = teachers;

    return this;
  }
  
  sortByWorkload() {
    this.suitableTeachers = this.table.teachers
      .sort((first, second) => first.workloadAmount - second.workloadAmount);

    return this;
  }

  classHasLeftLessons() {
    const { id: classId } = this.table.classes[this.table.classIndex];

    return this.table.teachers.find(({ workload }) => {
      return workload.find(w => w.classId === classId && w.hours);
    });
  }

  getTodaySubjectsIdOfClass(classIndex = this.table.classIndex) {
    return this.timetable[this.table.dayIndex]
      .map(hours => hours[classIndex]?.subjectId)
      .filter(Boolean)
      .flat();
  }
  
  // Get teachers that has enough left lessons for the class yet
  getWithLessonsInClass(
    customTeachers,
    {
      classIndex = this.table.classIndex,
    } = {}
  ) {
    const teachers = customTeachers || this.suitableTeachers;
    const { id: classId } = this.table.classes[classIndex];
  
    const teachersWithLessonsInClass = teachers
      .map(({ workload, workhours }, teacherIndex) => {
        // Filter teacher's workloads that has hours in current class
        const foundWorkloads = workload.filter(w => w.classId === classId && w.hours);
  
        // If didn't find any workload
        if (!foundWorkloads.length) return null;

        // if (
        //   this.log.match({
        //     day: 5,
        //     hour: 2,
        //     classTitle: '8e',
        //   })
        //   && teachers[teacherIndex].name.includes('Firəngiz Qona')
        //   && foundWorkloads.find(w => w.subjectId === '5db570c751076c6ac10655f8')
        // ) {
        //   console.log('foundWorkloads', foundWorkloads[0].hours)
        // }

        return foundWorkloads.map(work => ({
          teacherIndex,
          subjectIndex: this.helpers.getSubjectIndexById(work.subjectId),
          workloadIndex: workload.indexOf(work),
          workhours,
        }));
      })
      .filter(Boolean)
      .flat();

    if (customTeachers) return teachersWithLessonsInClass;

    this.suitableTeachers = teachersWithLessonsInClass;
  
    this.log.teachersError('teachersWithLessonsInClass', teachersWithLessonsInClass);
  
    return this;
  }

  // Get teachers that work today and at the hour
  getWorkingNow(customTeachers) {
    const teachers = customTeachers || this.suitableTeachers;
    const workingNowTeachers = teachers?.filter(({ workhours }) => workhours[this.table.dayIndex][this.table.hourIndex]);

    if (customTeachers) return workingNowTeachers;

    this.log.teachersError('workingNowTeachers', workingNowTeachers);

    this.suitableTeachers = workingNowTeachers;
    return this;
  }

  getFree(customTeachers) {
    const teachers = customTeachers || this.suitableTeachers;
    if (!teachers?.length) {
      if (customTeachers) return customTeachers;
      return this;
    }

    const { classId } = this.table.teachers[teachers[0].teacherIndex].workload[teachers[0].workloadIndex];
    const timetableHour = this.timetable[this.table.dayIndex][this.table.hourIndex];
  
    // Filter only the teachers that aren't in any class
    const freeTeachers = teachers.filter(({ teacherIndex }, index, arr) => {
      const { id: teacherId, name } = this.table.teachers[teacherIndex];
      // Loop through classes at current hour and check if
      // this teacher is in one of the classes
      // and choose only if she isn't in any class right now

      // if (
      //   this.log.match({
      //     day: 1,
      //     hour: 1,
      //     classTitle: '11c',
      //   }, arr[index])
      //   && name.includes('Ellada')
      //   // && this.helpers.getClassTitleById(classId).includes('5e')
      //   && !customTeachers
      // ) {
      //   debugger;
      // }

      // this.log.lesson(freeTeachers, {
      //   classTitle: '11c',
      //   day: 1,
      //   hour: 1,
      // }, freeTeachers);

      return !timetableHour.some(({ teachers: lessonTeachers }) => {
        // Find if the teacher has a lesson in any class right now
        return lessonTeachers?.find(({ id }) => id === teacherId);
      });
    });

    if (customTeachers) return freeTeachers;

    this.log.teachersError('free teachers', freeTeachers, teachers[0].subjectTitle);
  
    this.suitableTeachers = freeTeachers;
    return this;
  }

  getTeacherLeftDays(teacherIndex) {
    const { workhours } = this.table.teachers[teacherIndex];
    const curDayIndex = this.table.dayIndex;
    const { id: classId } = this.table.classes[this.table.classIndex];
    const maxHourForClass = Math.max(...Object.keys(this.table.maxClassHours[classId]).map(Number));

    return workhours
      .slice(curDayIndex, this.table.schoolDaysCount)
      .reduce((acc, day, di) => {
        const dayIndex = di + curDayIndex;
        // Slice the day's hours from current hour if the day is current day (today)
        // else just count rest of the day
        const hourStartIndex = dayIndex === curDayIndex ? this.table.hourIndex : 0;
        const daysCount = Number(
          day
            .slice(hourStartIndex, maxHourForClass)
            .filter(Boolean).length > 0
        );
        return acc + daysCount;
      }, 0);
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
    ));
  
    if (!sameSubjectTeachers?.length) return null;
  
    const teacher = sameSubjectTeachers[0];
  
    return teacher;
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

        // let maxHourForClass = Math.max(...classHoursLimit);

        // // Find max available hour for the class
        // if (this.table.maxClassHours[classId][maxHourForClass] - di <= 0) {
        //   maxHourForClass = Math.min(...classHoursLimit);
        // }

        // Start counting from the hour of each day
        // If it's today then count from current hour
        // Or else count from start of the day
        const hourStartIndex = dayIndex === curDayIndex ? this.table.hourIndex : 0;
        return day.slice(hourStartIndex, this.table.schoolHoursCount);
      });

    // For calculating work days
    if (returnWorkhours) return workhours;

    return workhours.flat().filter(Boolean).length;
  }
  
  howManyWorkDaysFromNow(teacher) {
    const workhours = this.howManyWorkhoursFromNow(teacher, true);

    return workhours.filter(day => day?.length).length;
  }

  sortByLessWorkhours(teachers) {
    return teachers.sort((first, second) => {
      const firstHours = this.howManyWorkhoursFromNow(first);
      const secondHours = this.howManyWorkhoursFromNow(second);

      // Ascending sort by left working hours count
      // because less hours left more important to include it
      return firstHours - secondHours;
    });
  }

  getTeacherWorkload = (teacher) => {
    const { subjectIndex, teacherIndex } = teacher;
    const { id: subjectId } = this.table.subjects[subjectIndex];
    const { workload } = this.table.teachers[teacherIndex];
    const classIndex = this.helpers.getClassIndexFromTeacher(teacher);
    const { id: classId } = this.table.classes[classIndex];
    
    return workload
      .find(w => w.classId === classId && w.subjectId === subjectId)?.hours;
  }

  getTeacherWorkloadInOtherClasses = (teacher) => {
    const { teacherIndex } = teacher;
    const { workload } = this.table.teachers[teacherIndex];
    const classIndex = this.helpers.getClassIndexFromTeacher(teacher);
    const { id: classId } = this.table.classes[classIndex];

    return workload.reduce((acc, w) => w.classId !== classId ? acc + w.hours : acc, 0);
  }

  sortByWorkloadInOtherClasses = (teachers) => {
    return [...teachers].sort((first, second) => {
      const firstWorkload = this.getTeacherWorkloadInOtherClasses(first);
      const secondWorkload = this.getTeacherWorkloadInOtherClasses(second);

      return secondWorkload - firstWorkload;
    });
  }

  sortByOverallWorkload = (teachers) => {
    return [...teachers].sort((first, second) => {
      const firstLeftWorkingHours = this.howManyWorkhoursFromNow(first);
      const firstOverallWorkload = this.getTeacherOverallWorkload(first);
      const firstHours = firstLeftWorkingHours - firstOverallWorkload;
      
      const secondLeftWorkingHours = this.howManyWorkhoursFromNow(second);
      const secondOverallWorkload = this.getTeacherOverallWorkload(second);
      const secondHours = secondLeftWorkingHours - secondOverallWorkload;

      return firstHours - secondHours;
    });
  }

  // Only if teachers have same amount of workload left
  sortByWorkIfNeeded(customTeachers) {
    let teachers = customTeachers || this.suitableTeachers;

    // this.log.lesson(teachers, {
    //   day: 1,
    //   hour: 1,
    //   teacherName: 'Rəhilə Xasməmmədo',
    //   classTitle: '1a',
    //   logEmpty: true,
    //   // justReturn: true,
    // });

    if (teachers.length <= 1) {
      if (customTeachers) return teachers;
      return this;
    }

    const teachersWorkloadHours = teachers.map(this.getTeacherWorkload);

    const uniqueWorkload = new Set(teachersWorkloadHours);

    // If all teachers have same workload
    if (uniqueWorkload.size === 1) {
      const teachersWorkhours = teachers.map(t => this.howManyWorkhoursFromNow(t));
      const uniqueWorkhours = new Set(teachersWorkhours);

      // If left work hours are also same
      if (uniqueWorkhours.size === 1) {
        teachers = this.sortByWorkloadInOtherClasses(teachers);
      } else {
        teachers = this.sortByLessWorkhours(teachers);
      }
    } else {
      const uniqueWorkloads = new Set(teachers.map(this.getTeacherOverallWorkload));

      // if (this.log.match({
      //   classTitle: '3a',
      //   day: 1,
      //   hour: 5,
      //   teacherName: 'Lalə Rəhmət',
      // }, teachers[0])) {
      //   debugger
      // }

      if (uniqueWorkloads.size === 1) {
        teachers = this.sortByLeftWorkload(teachers);
      } else {
        teachers = this.sortByOverallWorkload(teachers);
        
        // Sort workload on same teachers
        teachers = teachers.sort((first, second) => {
          if (first.teacherIndex !== second.teacherIndex) {
            return 0;
          }

          const { hours: firstHours } = this.table.teachers[first.teacherIndex].workload[first.workloadIndex]
          const { hours: secondHours } = this.table.teachers[second.teacherIndex].workload[second.workloadIndex]

          return secondHours - firstHours;
        });
      }

      // const uniqueClasses = new Set(teachers.map(t => this.table.teachers[t.teacherIndex].workload[t.workloadIndex].classId));
      // const uniqueTeachers = new Set(teachers.map(t => t.teacherIndex));

      // if (uniqueClasses.size === 1 && uniqueTeachers.size === 1) {
      //   const classIndex = this.helpers.getClassIndexFromTeacher(teachers[0]);
      //   const classNumber = this.table.classes[classIndex]?.number;
      //   const todaySubjectsId = this.getTodaySubjectsIdOfClass(classIndex);

      //   const hasntBeenWorkload = teachers.find(t => {
      //     const { subjectId } = this.table.teachers[t.teacherIndex].workload[t.workloadIndex];

      //     return !todaySubjectsId.includes(subjectId);
      //   });

      //   if (classNumber < 5 && hasntBeenWorkload) {
      //     teachers = [hasntBeenWorkload];
      //   }
      // }
    }

    if (customTeachers) return teachers;

    this.suitableTeachers = teachers;

    return this;
  }
  
  sortByLessWorkingDays(teachers) {
    return [...teachers].sort((first, second) => {
      const firstDays = this.howManyWorkDaysFromNow(first);
      const secondDays = this.howManyWorkDaysFromNow(second);

      return firstDays - secondDays;
    });
  }

  // First suitable teacher (with coworker if needed)
  filterWithCoWorkerIfNeeded(customTeachers) {
    const teachersList = customTeachers || this.suitableTeachers;

    const teachers = teachersList.filter(teacher => {
      const { classId } = this.table.teachers[teacher.teacherIndex].workload[teacher.workloadIndex];
      const classIndex = this.table.classes.findIndex(({ id }) => id === classId);

      if (this.isDivisiblePair(teacher.subjectIndex, classIndex)) {
        return !!this.getCoWorker(teacher, teachersList);
      }

      return true;
    });

    if (customTeachers) return teachers;

    this.suitableTeachers = teachers;
    return this;
  }

  doesTeacherHaveMoreHours = (teacher, customTeachers?) => {
    const { teacherIndex, workloadIndex, subjectIndex } = teacher;
    if (workloadIndex === -1) return false;

    const leftDays = this.getTeacherLeftDays(teacherIndex);
    
    const { hours: leftSubjectHours } = this.table.teachers[teacherIndex].workload[workloadIndex];
    let hasMoreLessons = leftSubjectHours >= leftDays;

    const classIndex = this.helpers.getClassIndexFromTeacher(teacher);

    // If the teacher doesn't have more hours
    // find out if coworker has
    if (this.isDivisiblePair(subjectIndex, classIndex) && !hasMoreLessons) {
      const coWorker = this.getCoWorker(teacher, customTeachers);

      if (coWorker) {
        const { hours: coWorkerLeftSubjectHours } = this.table
          .teachers[coWorker.teacherIndex]
          .workload[coWorker.workloadIndex];

        hasMoreLessons = coWorkerLeftSubjectHours >= this.getTeacherLeftDays(coWorker.teacherIndex);
      }
    }
    
    return hasMoreLessons;
  }

  getTeacherWithMinWorkload(teachers) {
    return this.getTeacherWorkloadCountInClass(this.sortByLeftWorkload(teachers)[0]);
  }

  getTeacherOverallWorkload = ({ teacherIndex }) => {
    const { workload } = this.table.teachers[teacherIndex];

    return workload.reduce((acc, w) => acc + w.hours, 0);
  }

  getTodayMustBe(customTeachers) {
    let teachers = customTeachers || this.suitableTeachers;

    if (!teachers.length) {
      if (customTeachers) return [];
      this.suitableTeachers = [];
      return this;
    }

    const haveMoreWorkloadThanHours = teachers.filter(teacher => {
      let overallWorkload = this.getTeacherOverallWorkload(teacher);
      let workhours = this.howManyWorkhoursFromNow(teacher);
      let hasMoreWorkloadThanHours = overallWorkload >= workhours;
      const coWorker = this.getCoWorker(teacher, teachers);
      const classIndex = this.helpers.getClassIndexFromTeacher(teacher);
      // const { title: classTitle } = this.table.classes[classIndex];

      if (this.isDivisiblePair(teacher.subjectIndex, classIndex) && coWorker && !hasMoreWorkloadThanHours) {
        overallWorkload = this.getTeacherOverallWorkload(coWorker);
        workhours = this.howManyWorkhoursFromNow(coWorker);

        hasMoreWorkloadThanHours = overallWorkload >= workhours;
      }

      return hasMoreWorkloadThanHours;
    });

    if (haveMoreWorkloadThanHours.length) {
      const todayMustBeTeachers = haveMoreWorkloadThanHours.filter((t, i, arr) => this.hasMoreLessonsThanLeftDays(t, arr));

      if (todayMustBeTeachers.length) {
        teachers = todayMustBeTeachers;
      } else {
        teachers = this.sortByLessWorkhours(haveMoreWorkloadThanHours);
      }
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
    return this;
  }

  hasMoreLessonsThanLeftDays = (teacher, teachers) => {
    const find = ({ teacherIndex, subjectIndex }): boolean => {
      const { workload } = this.table.teachers[teacherIndex];
      const { id: theSubjectId } = this.table.subjects[subjectIndex];
      const { id: theClassId } = this.table.classes[this.table.classIndex];
      const leftDays = this.getTeacherLeftDays(teacherIndex);

      const found = workload.find(({ hours, classId, subjectId }) => (
        classId === theClassId
          && hours >= leftDays
          && subjectId === theSubjectId
      ));

      return !!found;
    };

    let found = find(teacher);

    if (!found) {
      found = this.getCoWorker(teacher, teachers);
    }

    return found;
  }

  getHasntBeenYet(customTeachers, classIndex) {
    const teachers = customTeachers || this.suitableTeachers;
    if (!teachers?.length) {
      if (customTeachers) return customTeachers;
      return this;
    }

    // Filter only those who wasn't teaching today
    // Or got more hours than left days
    const hasntBeenYetTeachers = teachers.filter((teacher) => {
      const { teacherIndex, subjectIndex } = teacher;
      const { id: subjectId } = this.table.subjects[subjectIndex];
      const todayHasBeenTimes = this.getTodaySubjectsIdOfClass(classIndex)
        .filter(id => id === subjectId).length;

      const curClassIndex = this.helpers.getClassIndexFromTeacher(teacher);
      const theClass = this.table.classes[curClassIndex];
      const teacherInfo = this.table.teachers[teacherIndex];

      const { limit } = this.table.teacherLessonsLimit[teacherInfo.id][theClass.id][subjectId];

      const hasMoreLessons = this.hasMoreLessonsThanLeftDays(teacher, teachers);

      return (
        todayHasBeenTimes === 0
        || hasMoreLessons && todayHasBeenTimes < limit
      );
    });

    if (customTeachers) return hasntBeenYetTeachers;

    this.log.teachersError('hasntBeenYetTeachers', hasntBeenYetTeachers, teachers[0].subjectTitle);

    this.suitableTeachers = hasntBeenYetTeachers;
    return this;
  }

  decreaseWorkload(teachers) {
    teachers.forEach(({ teacherIndex, workloadIndex }) => {
      const teacher = this.table.teachers[teacherIndex];
      const { classId, subjectId } = teacher.workload[workloadIndex];

      teacher.workload[workloadIndex].hours -= 1;

      let todayHasBeenTimes = this.getTodaySubjectsIdOfClass()
        .filter(id => id === subjectId).length + 1;

      const limiterObj = this.table.teacherLessonsLimit[teacher.id][classId][subjectId];

      if (limiterObj[todayHasBeenTimes]) {
        limiterObj[todayHasBeenTimes] -= 1;
      }

      if (limiterObj[todayHasBeenTimes] === 0) {
        delete limiterObj[todayHasBeenTimes];
        const leftHours = Math.max.apply(null, Object.keys(limiterObj).filter(Number));

        limiterObj.limit = leftHours > 0 ? leftHours : 0;
      }

      // if (teacher.name.includes('Ellada') && this.table.dayIndex === 4 && this.table.hourIndex === 0) {
      //   console.log('limiterObj', limiterObj)
      // }

      if (todayHasBeenTimes) {
        // eslint-disable-next-line no-plusplus
        while(--todayHasBeenTimes) {
          if (todayHasBeenTimes) limiterObj[todayHasBeenTimes] += 1;
        }
      }
    });
  }

  noNeedToSkipForThisClass() {
    // let currentLessonTeachers = this.getTodayMustBe(this.suitableTeachers);
    // currentLessonTeachers = this.sortByWorkIfNeeded(currentLessonTeachers);
    // currentLessonTeachers = this.getLessonTeachers(currentLessonTeachers);

    const ignoreTeachers = [];

    const noNeedToSkipForThisClassTeachers = this.suitableTeachers.filter((teacher) => {
      const { teacherIndex, workloadIndex, subjectIndex } = teacher;
      const { workload, name, id: teacherId } = this.table.teachers[teacherIndex];
      const { subjectId, classId, hours } = workload[workloadIndex];
      const curClass = this.table.classes.find(c => c.id === classId);

      // const leftWorkingHours = this.howManyWorkhoursFromNow(teacher);
      // const overallWorkload = this.getTeacherOverallWorkload(teacher);
      const hasMoreHours = this.doesTeacherHaveMoreHours(teacher);

      const workloadByClass = workload.reduce((acc, w) => {
        if (!acc[w.classId]) acc[w.classId] = 0;

        acc[w.classId] += w.hours;

        return acc;
      }, {});

      let teachersOfOtherClass = false;
      let otherClassIsCriticalForCoWorker = false;
      let otherClassCanBeEmptyIfTake = false;

      const foundMoreSuitableClass = Object.keys(workloadByClass).find(theClassId => {
        const theClassHours = Object.keys(this.table.maxClassHours[theClassId]).map(Number);
        if (!theClassHours.length || theClassId === classId) return;

        const maxHourForTheClass = Math.max(...theClassHours);

        const classIndex = this.table.classes.findIndex(({ id }) => id === theClassId);
        const theClass = this.table.classes[classIndex];

        const classHasNoLessonNow = (
          this.timetable[this.table.dayIndex][this.table.hourIndex][classIndex]
          || maxHourForTheClass < this.table.hourIndex
        );

        if (classHasNoLessonNow) return;

        teachersOfOtherClass = this.getWithLessonsInClass(this.table.teachers, { classIndex });
        teachersOfOtherClass = this.getWorkingNow(teachersOfOtherClass);
        teachersOfOtherClass = this.getHasntBeenYet(teachersOfOtherClass, classIndex);
        teachersOfOtherClass = this.getFree(teachersOfOtherClass);
        const coWorkerForTheClass = this.getCoWorker(teacher, teachersOfOtherClass);
        const coWorkerTeacher = coWorkerForTheClass && this.table.teachers[coWorkerForTheClass.teacherIndex];

        let otherClassTeachersWithoutThis = teachersOfOtherClass.filter(t => (
          t.teacherIndex !== teacherIndex
          && t.teacherIndex !== coWorkerForTheClass?.teacherIndex
        ));
        teachersOfOtherClass = this.getTodayMustBe(teachersOfOtherClass);
        otherClassTeachersWithoutThis = this.getTodayMustBe(otherClassTeachersWithoutThis);

        if (teachersOfOtherClass.length > 1) {
          teachersOfOtherClass = this.filterWithCoWorkerIfNeeded(teachersOfOtherClass);
        }

        if (otherClassTeachersWithoutThis.length > 1) {
          otherClassTeachersWithoutThis = this.filterWithCoWorkerIfNeeded(otherClassTeachersWithoutThis);
        }
        otherClassTeachersWithoutThis = this.sortByWorkIfNeeded(otherClassTeachersWithoutThis);
        const possibleTeachersOfOtherClass = this.sortByWorkIfNeeded(teachersOfOtherClass);

        teachersOfOtherClass = this.getLessonTeachers(possibleTeachersOfOtherClass);

        const willBeInAnotherClass = teachersOfOtherClass.find(t => (
          t.teacherIndex === teacherIndex
          || t.teacherIndex === coWorkerForTheClass?.teacherIndex
        ));

        const coWorkerLeftWorkingHours = coWorkerForTheClass && this.howManyWorkhoursFromNow(coWorkerForTheClass);
        const coWorkerOverallWorkload = coWorkerForTheClass && this.getTeacherOverallWorkload(coWorkerForTheClass);
        const hasMoreHoursInOtherClass = coWorkerForTheClass && this.doesTeacherHaveMoreHours({
          ...teacher,
          workloadIndex: workload.findIndex(w => (
            w.classId === theClassId
            && w.subjectId === this.table.subjects[teacher.subjectIndex].id
          )),
        });

        otherClassCanBeEmptyIfTake = (
          !otherClassTeachersWithoutThis.length
          || (
            teachersOfOtherClass.length === 1
            && this.filterWithCoWorkerIfNeeded(teachersOfOtherClass).length === 0
          )
        );

        otherClassIsCriticalForCoWorker = (
          workloadByClass[theClassId] >= workloadByClass[classId]
          && hasMoreHoursInOtherClass
          && (
            coWorkerOverallWorkload === coWorkerLeftWorkingHours
            // || (
            //   this.table.teacherLessonsLimit[coWorkerTeacher.id][theClassId][subjectId].limit
            //   > this.table.teacherLessonsLimit[teacherId][classId][subjectId].limit
            // )
          )
        );

        if (willBeInAnotherClass && otherClassCanBeEmptyIfTake) {
          ignoreTeachers.push(teacherIndex);
        }

        // if (curClass.number === 1 && curClass.letter === 'e' && willBeInAnotherClass) {
        //   this.log.lesson(
        //     willBeInAnotherClass, {
        //       day: 1,
        //       hour: 6,
        //       // teacherName: 'Bəsdi Hak',
        //       // teacherName: 'Rəna Şir',
        //       // classTitle: '4b',
        //       noEmpty: true,
        //       // justReturn: true,
        //     },
        //     {
        //       coWorkerForTheClass: this.log.lesson(coWorkerForTheClass, { justReturn: true }).trim(),
        //       otherClassTeachersWithoutThis: this.log.lesson(otherClassTeachersWithoutThis, { justReturn: true }),
        //       workloadByClasstheClassId: workloadByClass[theClassId],
        //       workloadByClassclassId: workloadByClass[classId],
        //       otherClassIsCriticalForCoWorker,
        //       coWorkerOverallWorkload,
        //       coWorkerLeftWorkingHours,
        //       'this.table.teacherLessonsLimit[coWorkerTeacher.id][theClassId][subjectId]': coWorkerTeacher && this.table.teacherLessonsLimit[coWorkerTeacher.id][theClassId][subjectId].limit,
        //       'this.table.teacherLessonsLimit[teacherId][classId][subjectId]': this.table.teacherLessonsLimit[teacherId][classId][subjectId].limit,
        //       // leftWorkingHours,
        //       // overallWorkload,
        //       hasMoreHoursInOtherClass,
        //       otherClassCanBeEmptyIfTake,
        //       ignoreTeachers: ignoreTeachers.map(ti => this.table.teachers[ti].name),
        //     },
        //   );
        // }

        return willBeInAnotherClass && (
          workloadByClass[theClassId] > workloadByClass[classId]
          || otherClassIsCriticalForCoWorker
        );
      });

      // if (!customTeachers) {
        // this.log.lesson(teacher, {
        //   day: 4,
        //   hour: 5,
        //   // teacherName: 'Elnarə Nem',
        //   classTitle: '1ç',
        //   noEmpty: true,
        //   // justReturn: true,
        // }, foundMoreSuitableClass);
      // }

      if (foundMoreSuitableClass) {
        return hasMoreHours && !otherClassIsCriticalForCoWorker;
      }

      return !ignoreTeachers.includes(teacherIndex);
    });

    if (noNeedToSkipForThisClassTeachers.length) {
      this.suitableTeachers = noNeedToSkipForThisClassTeachers;
    }

    return this;
  }

  // Final lesson object's teachers
  getLessonTeachers(customTeachers) {
    const teachersList = customTeachers || this.suitableTeachers;
    const firstTeacher = teachersList[0];

    let teachers = [];
    if (firstTeacher) {
      teachers = [firstTeacher];

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

    this.suitableTeachers = teachers;

    return this;
  }
}