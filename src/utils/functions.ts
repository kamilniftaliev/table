/* eslint-disable import/prefer-default-export */

import { Table, Subject } from '../models';
import { letters } from './constants';

interface TableStatsModel {
  subjects: {
    [field: string]: number;
  },
  classes: {
    [field: string]: number;
  }
}

export function setTableStats(initTable: Table, subjects: Subject[]): Table {
  const {
    teachers: initTeachers,
    classes: initClasses,
    ...otherFields
  } = initTable;

  if (!subjects?.length) return initTable;

  const teachers = initTeachers
    .map(teacher => {
      const stats = teacher.workload
        .filter(({ hours }) => hours)
        .reduce<TableStatsModel>(
        (acc, { hours, subjectId, classId }) => ({
          subjects: {
            ...acc.subjects,
            [subjectId]: (acc.subjects[subjectId] || 0) + hours,
          },
          classes: {
            ...acc.classes,
            [classId]: (acc.classes[classId] || 0) + hours,
          },
        }),
        {
          subjects: {},
          classes: {},
        },
      );

      const workhoursAmount = teacher.workhours
        .slice(0, 7) // @TODO DAYS
        .map(day => day.slice(0, 8)) // @TODO HOURS WITH SHIFT
        .flat()
        .reduce((acc, works) => (works ? acc + 1 : acc), 0);

      const subjectsStats = Object.values(stats.subjects);

      return {
        ...teacher,
        subjects: subjectsStats.length,
        classes: Object.keys(stats.classes).length,
        workhoursAmount,
        workloadAmount: subjectsStats.reduce(
          (acc, hours) => acc + hours,
          0,
        ),
      };
    })
    .sort((first, second) => {
      const getFirstDifference = (left: string, right: string, from = 0) => {
        const leftLetter = left.slice(from, from + 1).toLowerCase();
        const rightLetter = right.slice(from, from + 1).toLowerCase();

        if (leftLetter === rightLetter) return getFirstDifference(left, right, from + 1);

        return [leftLetter, rightLetter];
      };

      const [leftLetter, rightLetter] = getFirstDifference(first.slug, second.slug);

      return letters.indexOf(leftLetter) - letters.indexOf(rightLetter)
    });

  const classes = initClasses
    .map(theClass => {
      let teachersCount = 0;
      const classSubjects = Object.values(
        teachers.reduce<TableStatsModel['classes']>((acc, { workload }) => {
          const classWorkload = workload.filter(
            w => w.classId === theClass.id && w.hours,
          );
          if (!classWorkload.length) return acc;
          const subjectHours = classWorkload.reduce((prevHours, w) => {
            const subjectTitle = subjects.find(
              s => s.id === w.subjectId,
            )?.title.ru;
            return {
              ...prevHours,
              [subjectTitle]: w.hours,
            };
          }, {});
          teachersCount += 1;
          return {
            ...acc,
            ...subjectHours,
          };
        }, {}),
      );
      return {
        ...theClass,
        teachers: teachersCount,
        subjects: classSubjects.length,
        lessons: classSubjects.reduce(
          (acc, hours) => acc + hours,
          0,
        ),
      };
    })
    .sort((first, second) => {
      const numbers = first.number - second.number;

      if (numbers !== 0) return numbers;

      return letters.indexOf(first.letter) - letters.indexOf(second.letter);
    });

  return {
    ...otherFields,
    teachers,
    classes,
  };
};
