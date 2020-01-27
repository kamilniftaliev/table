import Helpers from './helpers';

import { Workload, TableTeacher } from '../../models';

export default class Logger {
  table = null;

  logWarnings = false;

  helpers = null;

  history = [];

  constructor(table) {
    this.table = table;
    this.helpers = new Helpers(table);
  }

  workload = ({ classId, subjectId, hours }: Workload): string => {
    const classTitle = this.helpers.getClassTitleById(classId);
    const subjectTitle = this.helpers.getSubjectTitleById(subjectId);
  
    return `${classTitle}, ${subjectTitle}, ${hours}`;
  }

  howManyWorkhoursFromNow = ({ teacherIndex, workloadIndex }: TableTeacher): number => {
    const curDayIndex = this.table.dayIndex;
    const teacher = this.table.teachers[teacherIndex];
    const { classId } = teacher.workload[workloadIndex];
    const classHoursLimit = Object.keys(this.table.maxClassHours[classId]).map(Number);

    const workhours = teacher.workhours
      .slice(curDayIndex, this.table.schoolDaysCount)
      .map((day: [boolean], di: number) => {
        const dayIndex = di + curDayIndex;

        let maxHourForClass = Math.max(...classHoursLimit);

        // Find max available hour for the class
        if (this.table.maxClassHours[classId][maxHourForClass] - di <= 0) {
          maxHourForClass = Math.min(...classHoursLimit);
        }

        // Start counting from the hour of each day
        // If it's today then count from current hour
        // Or else count from start of the day
        const hourStartIndex = dayIndex === curDayIndex ? this.table.hourIndex : 0;
        return day.slice(hourStartIndex, maxHourForClass);
      });

    return workhours.flat().filter(Boolean).length;
  }

  getTeacherOverallWorkload = ({ teacherIndex }: TableTeacher): number => {
    const { workload } = this.table.teachers[teacherIndex];

    return workload.reduce((acc: number, w: Workload) => acc + w.hours, 0);
  }

  lessonLimits = () => {
    const { teacherLessonsLimit, teachers } = this.table;
    const logText = Object.entries(teacherLessonsLimit).reduce((acc, [teacherId, lessons]) => {
      const teacher = teachers.find(t => t.id === teacherId);
      const lessonsText = Object.entries(lessons).reduce((acc, [classId, workload]) => {
        const classTitle = this.helpers.getClassTitleById(classId);

        const subjectsText = Object.entries(workload).reduce((acc, [subjectId, hours]) => {
          const subjectTitle = this.helpers.getSubjectTitleById(subjectId);
          return `${acc}${subjectTitle}: ${hours}\n`;
        }, '');

        return `${acc}\t\t\t${classTitle}\n${subjectsText}`;
      }, '');

      return `${acc}\t\t${teacher.name}\n${lessonsText}`;
    }, '');

    console.log(logText);
  }

  match(
    {
      day,
      hour,
      classTitle,
      teacherName,
    },
    teacher = {},
  ): string | boolean {
    const { teacherIndex, workloadIndex } = teacher;
    let { classIndex } = this.table;

    let teacherInfo = {};

    if (teacher) {
      teacherInfo = this.table.teachers[teacherIndex];

      // If need to read class title from given teacher
      if (typeof teacherIndex === 'number' && typeof workloadIndex === 'number') {
        const { classId } = this.table.teachers[teacherIndex].workload[workloadIndex];
        classIndex = this.table.classes.findIndex(({ id }) => id === classId);
      }
    }

    const curDay = this.table.dayIndex + 1;
    const curHour = this.table.hourIndex + 1;
    const { number, letter } = this.table.classes[classIndex];
    const curClassTitle = `${number}${letter}`;
    const timeText = `${curClassTitle}, day: ${curDay}, hour: ${curHour}`;
    const fitsDay = (typeof day === 'number' && curDay === day) || typeof day !== 'number';
    const fitsHour = (typeof hour === 'number' && curHour === hour) || typeof hour !== 'number';
    const fitsClass = (typeof classTitle !== 'undefined' && curClassTitle.includes(classTitle)) || typeof classTitle === 'undefined';
    const fitsTeacher = (teacher && teacherName && teacherInfo.name.includes(teacherName)) || typeof teacherName === 'undefined';

    const match = fitsDay && fitsHour && fitsClass && fitsTeacher;
    
    // Time fits
    return match ? timeText : false;
  }
  
  parseLesson = (lesson: TableTeacher): string => {
    if (!lesson) return '';
    const { teacherIndex, subjectIndex, workloadIndex } = lesson;
    const { title: subject, id: subjectId } = this.table.subjects[subjectIndex];
    const { name: lessonTeacher, workload } = this.table.teachers[teacherIndex];
    const { classId } = workload[workloadIndex];
    // const { id: classId } = this.table.classes[this.table.classIndex];
    const leftLessonsInClass = workload.find(w => w.classId === classId && w.subjectId === subjectId)?.hours;
    const leftWorkingHours = this.howManyWorkhoursFromNow(lesson);
    const overallWorkload = this.getTeacherOverallWorkload(lesson);
    
    return `${subject.ru}, ${lessonTeacher}, ${leftLessonsInClass}/${overallWorkload} lessons, ${leftWorkingHours} hours`;
  }

  lesson = (
    teachersList: [TableTeacher] | TableTeacher | object,
    {
      day,
      hour,
      classTitle,
      teacherName,
      noEmpty = false,
      title = '',
      logFunc = console.log,
      justReturn = false,
    } = {},
    ...rest
  ): string => {
    const teachersIsObject = (!!teachersList) && !Array.isArray(teachersList);
    let teachers = teachersList;
    if (teachersIsObject) {
      if (Array.isArray(teachersList.suitableTeachers)) teachers = teachersList.suitableTeachers;
      else teachers = [teachersList];
    }

    const timeText = teachers[0] && this.match({ day, hour, classTitle }, teachers[0]);

    // console.log('day, hour, classTitle', day, hour, classTitle)

    if (!timeText || !teachers) return;

    console.log('teachers.length', teachers.length)
    
    const teachersLog = teachers.reduce((acc, lesson) => {
      const log = typeof lesson.workloadIndex === 'number' ? this.parseLesson(lesson) : '';
  
      const fitsTeacher = (typeof teacherName !== 'undefined' && log.includes(teacherName)) || typeof teacherName === 'undefined';
  
      const fits = fitsTeacher;
  
      return fits ? `${acc}\n${log}` : acc;
    }, '').trim();

    let logArr = '';
    const extendedTitle = title ? `\t\t\t\t\t${title}\n` : '';

    if (teachersLog) {
      logArr = `${extendedTitle}\t\t\t\t${timeText}\n${teachersLog}`;
    } else if (!noEmpty) {
      logArr = `NOTHING ${extendedTitle}`;
    }

    if (logArr && !justReturn) {
      logFunc(`${logArr}\n`, ...rest);
    }

    return logArr;
  }

  warning = (...text): void => {
    if (!this.logWarnings) return;
    const { number, letter } = this.table.classes[this.table.classIndex];
    const classTitle = `${number}${letter}`;
    console.info(text.join(','), classTitle, this.table.dayIndex + 1, this.table.hourIndex + 1);
  }

  // If couldn't find a teacher that works in the class
  teachersError = (title: string, teachers: [TableTeacher], ...text: [string]): void => {
    if (!teachers?.length) this.warning(`Couldn"t find ${title}`, ...text);
  }
  
  results = (): void => {
    console.log('--------- LEFT TEACHERS -------');
    const resultTable = JSON.parse(JSON.stringify(this.table));
    let totalLeftHours = 0;
    resultTable.teachers.forEach(({ workload, name }) => {
      const leftHours = workload.filter(({ hours }) => hours);
  
      leftHours.forEach(({ subjectId, classId, hours }) => {
        const subjectTitle = this.helpers.getSubjectTitleById(subjectId);
        const classTitle = this.helpers.getClassTitleById(classId);
  
        if (subjectTitle) {
          totalLeftHours += hours;
          console.log(name, subjectTitle, classTitle, hours);
        }
      });
    });

    console.log('TOTAL LEFT HOURS :', totalLeftHours);
    console.log('------- END LEFT TEACHERS END ------- ');
  }
}