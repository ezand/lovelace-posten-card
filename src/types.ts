import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';
import { Moment } from 'moment';

declare global {
  interface String {
    replaceAll(search: string, replace: string): string;
    capitalize(): string;
  }
}

export interface PostenCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  entity: string;
  date_format: string;
  num_of_days: number;
  delivery_today_icon?: string;
  no_delivery_today_icon?: string;
  hide_delivery_today_icon?: boolean;
  hide_logo?: boolean;
  use_posten_background_color?: boolean;
}

export interface DeliveryDay {
  date: Moment;
  formattedDate: string;
  daysUntilDelivery: number;
  deliveryToday: boolean;
}
