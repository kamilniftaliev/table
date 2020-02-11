import TimetableGenerator from './index';

onmessage = (e): void => {
  const data = TimetableGenerator(...e.data);

  data.logs.map(l => console.log(l));

  postMessage(data);
};
