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

  public getMaxHoursForClass(schoolDaysCount) {
    return this.table.classes.reduce((acc, { id, isDivisible }) => {
      const totalHoursOfClass = this.table.teachers
        .reduce((totalHours, { workload }) => {
          const teacherTotalClassHours = workload
            .filter(({ classId }) => classId === id)
            .reduce((teacherClassHours, { hours, subjectId }) => {
              const { isDivisible: isSubjectDivisible } = this.getSubjectById(subjectId)
              if (isDivisible && isSubjectDivisible) {
                hours = hours / 2
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
        
        hours[intTotalDailyHours] = intTotalDailyHours - moreHoursCount
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