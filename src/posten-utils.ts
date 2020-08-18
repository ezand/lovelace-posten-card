import moment from 'moment-with-locales-es6';
import { Moment } from 'moment';

import { PostenCardConfig } from './types';
import { localize } from './localize/localize';
import { DeliveryDay } from './types';
import * as dateUtils from './date-utils';

const months = {
  januar: 0,
  februar: 1,
  mars: 2,
  april: 3,
  mai: 4,
  juni: 5,
  juli: 6,
  august: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

export const defaultNumOfDays = 6;
export const defaultDateFormat = 'dddd D. MMMM';
export const defaultDeliveryTodayIcon = 'mdi:mailbox-open';
export const defaultNoDeliveryTodayIcon = 'mdi:mailbox';
export const defaultHideLogo = false;
export const defaultHideDeliveryTodayIcon = false;
export const defaultUsePostenBackgroundColor = true;

const daysUntil = (today: Moment, deliveryDay: Moment): number =>
  moment.duration(deliveryDay.startOf('day').diff(today.startOf('day'))).days();

export const daysUntilText = (daysUntil: number): string | undefined => {
  // Don't display if 'today' or  'tomorrow'
  if (daysUntil > 1) {
    return localize('common.days_until', 'DAYS_UNTIL', '' + daysUntil);
  }
  return undefined;
};

export const deliveryDayText = (idx: number, deliveryDay: Moment, formattedDate: string): string => {
  const isDeliveryToday = dateUtils.isDeliveryToday(deliveryDay);
  const isDeliveryTomorrow = dateUtils.isDeliveryTommorow(deliveryDay);

  if (isDeliveryToday && idx === 0) {
    return localize('common.today');
  } else if (isDeliveryTomorrow && idx === 0) {
    return localize('common.tomorrow');
  } else {
    return formattedDate || 'N/A';
  }
};

const parseDeliveryDay = (deliveryDay: string, locale: string, config: PostenCardConfig): DeliveryDay => {
  const dateFormat = !config.date_format || config.date_format.trim() === '' ? defaultDateFormat : config.date_format;
  const segments = deliveryDay.split(' ');
  const deliveryDayMoment = moment().month(months[segments[2]]).date(segments[1]);
  const formattedDate = dateUtils.formatDate(locale, dateFormat, deliveryDayMoment).capitalize();
  const daysUntilDelivery = daysUntil(moment(), deliveryDayMoment);
  const isDeliveryToday = dateUtils.isDeliveryToday(deliveryDayMoment);

  return {
    date: deliveryDayMoment,
    daysUntilDelivery: daysUntilDelivery,
    formattedDate: formattedDate,
    deliveryToday: isDeliveryToday,
  };
};

export const parseDeliveryDays = (
  numDays: number,
  rawDeliveryDays: string,
  language: string,
  config: PostenCardConfig,
): Array<DeliveryDay> => {
  return rawDeliveryDays
    .replaceAll('[', '')
    .replaceAll(']', '')
    .replaceAll("'", '')
    .replaceAll('i dag', '')
    .replaceAll('i morgen', '')
    .replaceAll('.', '')
    .split(',')
    .slice(0, numDays)
    .map((s) => parseDeliveryDay(s.trim(), language, config));
};
