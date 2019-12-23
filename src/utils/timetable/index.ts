import Logger from './logger';
import Helpers from './helpers';
import TeachersClass from './teachers';

import { Table, Lesson, ClassHours } from '../../models';

const schoolDaysCount = 5;
const schoolHoursCount = 7;

let maxClassHours: ClassHours = {};
let log = null;
let helpers = null;
let Teachers = null;
let table = null;
let timetable = [];
let dayIndex: number;
let hourIndex: number;
let classIndex: number;

const emptyLesson = {
  subjectId: null,
  teachers: [],
};

const notFoundLesson = {
  subjectId: '----',
  teachers: [],
};

function getLesson(): Lesson {
  // log.lesson(Teachers
  //   .sortByWorkload()
  //   .getWithLessonsInClass()
  //   .getWorkingNow()
  //   .getHasntBeenYet()
  //   .getFree()
  //   .filterWithCoWorkerIfNeeded()
  //   .noNeedToSkipForThisClass()
  //   .filterWithCoWorkerIfNeeded()
  //   .getTodayMustBe()
  //   .sortByWorkIfNeeded()
  //   // .getLessonTeachers()
  // , {
  //   day: 1,
  //   hour: 7,
  //   classTitle: 6,
  //   logEmpty: true,
  // });

  const { suitableTeachers: teachers } = Teachers.sortByWorkload()
    .getWithLessonsInClass()
    .getWorkingNow()
    .getHasntBeenYet()
    .getFree()
    .filterWithCoWorkerIfNeeded()
    .noNeedToSkipForThisClass()
    .filterWithCoWorkerIfNeeded()
    .getTodayMustBe()
    .sortByWorkIfNeeded()
    .getLessonTeachers();

  if (!teachers.filter(Boolean).length) return null;

  Teachers.decreaseWorkload(teachers);

  const lesson = {
    subjectId: table.subjects[teachers[0].subjectIndex].id,
    teachers: teachers.map(({ teacherIndex }) => table.teachers[teacherIndex]),
  };

  return lesson;
}

export function generate(defaultTable: Table): object {
  // The very init
  table = JSON.parse(JSON.stringify(defaultTable));
  table.schoolDaysCount = schoolDaysCount;
  table.schoolHoursCount = schoolHoursCount;

  // console.log('SHIFT table :', table);

  log = new Logger(table);
  if (!window.log) window.log = log;
  helpers = new Helpers(table);
  Teachers = new TeachersClass(table);
  if (!window.T) window.T = Teachers;
  maxClassHours = helpers.getMaxHoursForClass(schoolDaysCount);
  table.maxClassHours = maxClassHours;

  // console.log('maxClassHours :', JSON.parse(JSON.stringify(maxClassHours)));

  timetable = [];
  Teachers.timetable = timetable;

  // Loop through school days
  Array(schoolDaysCount)
    .fill(null)
    .forEach((d, curDayIndex) => {
      // Init the day
      dayIndex = curDayIndex;
      table.dayIndex = dayIndex;
      timetable[dayIndex] = [];

      // Loop through school hours
      Array(schoolHoursCount)
        .fill(null)
        .forEach((h, curHourIndex) => {
          // Init the hour
          hourIndex = curHourIndex;
          const hour = hourIndex + 1;
          table.hourIndex = hourIndex;
          timetable[dayIndex][hourIndex] = [];

          // Loop through all classes and get a lesson for the hour
          table.classes.forEach(
            ({ id: classId }, curClassIndex: number): void => {
              // Init the hour of the class
              classIndex = curClassIndex;
              table.classIndex = classIndex;

              timetable[dayIndex][hourIndex][classIndex] = emptyLesson;

              if (!helpers.decreaseClassHour(maxClassHours, classId, hour))
                return;

              const lesson = getLesson();

              // If no teachers found, put a placeholder for now
              if (!lesson) {
                const stillLeftLessons = Teachers.classHasLeftLessons();
                if (stillLeftLessons)
                  timetable[dayIndex][hourIndex][classIndex] = notFoundLesson;
                return;
              }

              // Building a lesson's actual data
              timetable[dayIndex][hourIndex][classIndex] = lesson;
            },
          );
        });
    });

  // log.results()
  return timetable;
}

export default {
  generate,
  getSubjectTitleById: (id): string => helpers.getSubjectTitleById(id),
};
