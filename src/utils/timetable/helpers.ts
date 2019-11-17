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

  public getMaxLessonsForClass(schoolDaysCount) {
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
  
      acc[id] = Math.round(totalHoursOfClass / schoolDaysCount)
      
      return acc
    }, {})
  }
}