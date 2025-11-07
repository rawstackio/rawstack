import dayjs from 'dayjs';
import advanced from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

const initDate = () => {
  dayjs.extend(advanced);
  dayjs.extend(relativeTime);
};

export { initDate };
