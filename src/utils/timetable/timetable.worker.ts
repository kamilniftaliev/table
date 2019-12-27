import TimetableGenerator from './index';

onmessage = e => postMessage(TimetableGenerator(...e.data));
