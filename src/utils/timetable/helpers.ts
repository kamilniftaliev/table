export default class Helpers {
  table = null;

  constructor(table) {
    this.table = table;
  }

  public getSubjectIndexById(id) {
    return this.table.subjects.findIndex(s => s.id === id)
  }
  
  public getSubjectById(id) {
    return this.table.subjects.find(s => s.id === id)
  }

  public getSubjectTitleById(id: string): string {
    return this.table.subjects.find(s => s.id === id)?.title
  }

  public getClassTitleById(id: string): string {
    return this.table.classes.find(s => s.id === id)?.title
  }
  
  public getClassIndexFromTeacher({ teacherIndex, workloadIndex }) {
    const { classId } = this.table.teachers[teacherIndex].workload[workloadIndex];
    return this.table.classes.findIndex(s => s.id === classId);
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

  public getMaxHoursForClass(schoolDaysCount) {
    return this.table.classes.reduce((acc, { id }, classIndex) => {
      const totalHoursOfClass = this.table.teachers
        .reduce((totalHours, { workload }) => {
          const teacherTotalClassHours = workload
            .filter(({ classId }) => classId === id)
            .reduce((teacherClassHours, { hours, subjectId }) => {
              const subject = this.getSubjectById(subjectId)
              if (this.isDivisiblePair(this.table.subjects.indexOf(subject), classIndex)) {
                hours /= 2;
              }
              return teacherClassHours + hours
            }, 0)
  
          return totalHours + teacherTotalClassHours
        }, 0)

      // console.log('totalHoursOfClass :', totalHoursOfClass, this.getClassTitleById(id));

      const totalDailyHours = totalHoursOfClass / schoolDaysCount
      const hours = {}

      // If every day will have same amount hours
      if (Number.isInteger(totalDailyHours)) {
        hours[totalDailyHours] = schoolDaysCount
      } else {
        const intTotalDailyHours = Math.floor(totalDailyHours)
        const moreHoursCount = totalHoursOfClass - (intTotalDailyHours * schoolDaysCount)

        // if (intTotalDailyHours - moreHoursCount === 0) {
        //   debugger
        // }

        hours[intTotalDailyHours] = Math.round(totalDailyHours - moreHoursCount);
        hours[intTotalDailyHours + 1] = moreHoursCount
      }

      acc[id] = hours

      return acc
    }, {})
  }

  public decreaseClassHour(maxClassHours, classId, curHour) {
    const classHours = maxClassHours[classId]
    const maxHoursProp = Math.max(...Object.keys(classHours).map(Number))
    const classHourLimit = classHours[maxHoursProp]

    // If current hour exceeds max hour limit of the class,
    // don't decrease and return falsy value to indicate about that
    if (maxHoursProp < curHour) return;

    if (maxHoursProp === curHour) {
      // Decrease total hours count
      if (classHourLimit === 1) delete classHours[maxHoursProp]
      else classHours[maxHoursProp] -= 1
    }

    // Return true to indicate about decreasement
    return true
  }
}