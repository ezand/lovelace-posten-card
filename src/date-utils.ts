import moment from 'moment-with-locales-es6';
import { Moment } from 'moment';

export const formatDate = (locale: string, format: string, deliveryday: Moment): string =>
  deliveryday.locale(locale).format(format);

export const isDeliveryToday = (deliveryDay: Moment): boolean =>
  deliveryDay.startOf('day').diff(moment().startOf('day')) === 0;

export const isDeliveryTommorow = (deliveryDay: Moment): boolean =>
  deliveryDay.startOf('day').diff(
    moment()
      .add(1, 'day')
      .startOf('day'),
  ) === 0;
