import { Subject, Class, Workload, ClassHours } from '../../models';

export default class Helpers {
  table = null;

  constructor(table) {
    this.table = table;
  }

  public getSubjectIndexById(id: Subject['id']): number {
    return this.table.subjects.findIndex(s => s.id === id);
  }
  
  public getSubjectById(id: Subject['id']): Subject {
    return this.table.subjects.find((s: Subject) => s.id === id);
  }

  public getSubjectTitleById(id: Subject['id']): Subject['title'] {
    return this.table.subjects.find((s: Subject) => s.id === id)?.title.ru || '';
  }

  public getClassTitleById(id: Class['id']): Class['title'] {
    const theClass = this.table.classes.find((s: Class) => s.id === id);

    return `${theClass.number}${theClass.letter}`;
  }
  
  public getClassTitleFromTeacher({ teacherIndex, workloadIndex }): Class['title'] {
    const { classId } = this.table.teachers[teacherIndex].workload[workloadIndex];
    return this.getClassTitleById(classId);
  }

  public getClassIndexFromTeacher({ teacherIndex, workloadIndex }): number {
    const { classId } = this.table.teachers[teacherIndex].workload[workloadIndex];
    return this.table.classes.findIndex((s: Class) => s.id === classId);
  }

  // If class and the given subject both are divisible
  isDivisiblePair(subjectIndex: number, classIndex = this.table.classIndex): boolean {
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

  public getTeacherLessonsLimit(shift) {
    return this.table.teachers.reduce((acc, teacher, teacherIndex) => {
      const { workload, workhours, name, id } = teacher;

      const teacherWorkDays = workhours.slice(0, this.table.schoolDaysCount).filter(day => day.find(Boolean)).length;

      const totalHours = workload
        .filter(w => w.hours)
        .reduce((acc, workload) => {
          const theClass = this.table.classes.find(c => c.id === workload.classId);
          const workDays = Math.min(teacherWorkDays, this.table.schoolDaysCount);

          const limit = workload.hours / workDays;
          const minDailyLessons = Math.floor(limit);
          let limits = {};

          if (minDailyLessons === 0) {
            limits = { 1: workload.hours };
          } else {
            let minLessonDaysCount = Math.min(minDailyLessons * workDays, workDays);
            let maxLessonsDaysCount = 0;

            limits = {
              [minDailyLessons]: minLessonDaysCount,
            };

            if (limit > minDailyLessons) {
              maxLessonsDaysCount = workload.hours - minDailyLessons * workDays;
              minLessonDaysCount -= maxLessonsDaysCount;
              limits[minDailyLessons] = minLessonDaysCount;
              limits[minDailyLessons + 1] = maxLessonsDaysCount;
            }
          }

          limits.limit = Math.max.apply(null, Object.keys(limits).map(Number));
          
          // if (theClass.number === 2 && theClass.letter === 'b' && teacher.name.includes('Umg')) {
          //   console.log('limits', limits, workload.hours, minDailyLessons, limit, hours, Object.keys(limits), this.table.subjects.find(s => s.id === workload.subjectId)?.title?.ru);
          // }

          return {
            ...acc,
            [workload.classId]: {
              ...(acc[workload.classId] || {}),
              [workload.subjectId]: limits,
            },
          };
        }, {});

      // const limits = Object.entries(totalHours).reduce((limitsAcc, [classId, hours]) => {
      //   const limit = Math.ceil(hours / Math.min(workDays, this.table.schoolDaysCount));

      //   if (name.includes('Simnarə Sul') && classId === "5e0233b7f908f9a51350bc24") {
      //     debugger
      //   }

      //   return {
      //     ...limitsAcc,
      //     [classId]: limit,
      //   };
      // }, {});

      return {
        ...acc,
        [id]: totalHours,
      };
    }, {});
  }

  public getMaxHoursForClass(schoolDaysCount: number): ClassHours {
    return this.table.classes.reduce((acc: ClassHours, { id, number }, classIndex: number) => {
      const totalHoursOfClass = this.table.teachers
        .reduce((totalHours, { workload }) => {
          const teacherTotalClassHours = workload
            .filter(({ classId }) => classId === id)
            .reduce((teacherClassHours: number, w: Workload) => {
              let { hours } = w;
              const subject = this.getSubjectById(w.subjectId);
              if (this.isDivisiblePair(this.table.subjects.indexOf(subject), classIndex)) {
                hours /= 2;
              }
              return teacherClassHours + hours;
            }, 0);
  
          return totalHours + teacherTotalClassHours;
        }, 0);

      // console.log('totalHoursOfClass :', totalHoursOfClass, this.getClassTitleById(id));

      const totalDailyHours = totalHoursOfClass / schoolDaysCount;
      const hours = {};

      // If every day will have same amount hours
      if (Number.isInteger(totalDailyHours)) {
        hours[totalDailyHours] = schoolDaysCount;
      } else {
        const intTotalDailyHours = Math.floor(totalDailyHours);
        const moreHoursCount = totalHoursOfClass - (intTotalDailyHours * schoolDaysCount);

        hours[intTotalDailyHours] = Math.round(schoolDaysCount - moreHoursCount);
        hours[intTotalDailyHours + 1] = moreHoursCount;
      }

      acc[id] = hours;

      return acc;
    }, {});
  }

  public decreaseClassHour = (
    maxClassHours: object,
    classId: string,
    curHour: number
  ): boolean => {
    const classHours = maxClassHours[classId];
    const { number } = this.table.classes.find(c => c.id === classId);
    const initMaxHour = Math.max(...Object.keys(classHours).map(Number));
    const classHourLimit = classHours[initMaxHour];

    const maxHour = number === 1 ? initMaxHour + 1 : initMaxHour;

    // If current hour exceeds max hour limit of the class,
    // don't decrease and return falsy value to indicate about that
    if (maxHour < curHour || (number === 1 && curHour === 1)) return;

    if (maxHour === curHour) {
      // Decrease total hours count
      if (classHourLimit === 1) delete classHours[initMaxHour];
      else classHours[initMaxHour] -= 1;
    }

    // Return true to indicate about decreasement
    return true;
  }
}