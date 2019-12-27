import Logger from './logger';
import Helpers from './helpers';
import TeachersClass from './teachers';

import { Table, Lesson, ClassHours, Workload, Subject } from '../../models';

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

// const id = (): string => Math.random().toString(36).slice(2);

const emptyLesson = {
  subjectTitle: '',
};

const notFoundLesson = {
  subjectTitle: '-',
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
    subjectTitle: table.subjects[teachers[0].subjectIndex].title?.ru,  
    teachersName: teachers.map(({ teacherIndex }) => table.teachers[teacherIndex].name).join(' və '),
  };

  return lesson;
}

function getShiftFromTable(
  { classes, teachers, ...rest }: Table,
  shift: number,
): Table {
  return JSON.parse(JSON.stringify({
    ...rest,
    classes: classes.filter(c => c.shift === shift),
    teachers: teachers.map(teacher => ({
      ...teacher,
      workhours: teacher.workhours.map(hours =>
        shift === 1 ? hours.slice(0, 8) : hours.slice(8),
      ),
      workload: teacher.workload.filter(
        (w: Workload) => classes.find(c => c.id === w.classId)?.shift === shift,
      ),
    })),
  }));
}

export default function(defaultTable: Table, subjects: Subject[]): object {
  return Array(defaultTable.shifts).fill(null).map((s, shiftIndex) => {
    const shift = shiftIndex + 1;

    // The very init
    table = getShiftFromTable(defaultTable, shift);
    table.schoolDaysCount = schoolDaysCount;
    table.schoolHoursCount = schoolHoursCount;
    table.subjects = subjects;

    // console.log('SHIFT table :', table);

    log = new Logger(table);
    // if (!window.log) window.log = log;
    helpers = new Helpers(table);
    Teachers = new TeachersClass(table);
    // if (!window.T) window.T = Teachers;
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
                let lesson = emptyLesson;

                if (helpers.decreaseClassHour(maxClassHours, classId, hour)) {
                  lesson = getLesson();

                  // If no teachers found, put a placeholder for now
                  if (!lesson) {
                    const stillLeftLessons = Teachers.classHasLeftLessons();
                    if (stillLeftLessons) lesson = notFoundLesson;
                  }
                }

                const lessonId = `${dayIndex}-${hourIndex}-${classIndex}`;

                // Building a lesson's actual data
                timetable[dayIndex][hourIndex][classIndex] = {
                  ...lesson,
                  id: lessonId,
                  classTitle: helpers.getClassTitleById(classId),
                };
              },
            );
          });
      });

    return timetable;
  });
}
