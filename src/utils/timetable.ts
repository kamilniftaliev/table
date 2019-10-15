const days = 5

export function generate(table) {
  return Array(days).fill(null).map(() => {
    const hour = {
      lessonTitle: 'Русский язык',
      teacherName: 'Some some',
    };
    const hourOfClasses = table.classes.map(() => hour);
    return Array(8).fill(hourOfClasses);
  });
}

export default {
  generate
}