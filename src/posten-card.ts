import {
  LitElement,
  html,
  customElement,
  property,
  internalProperty,
  CSSResult,
  TemplateResult,
  css,
} from 'lit-element';
import {
  HomeAssistant,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
  LovelaceCard,
} from 'custom-card-helpers';
import { Moment } from 'moment';
import moment from 'moment-with-locales-es6';

import './editor';
import postenLogo from './images/posten.png';

import { PostenCardConfig, DeliveryDay } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  POSTEN-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'posten-card',
  name: 'Posten Card',
  description: 'A custom card that display Norwegian mail delivery days',
});

String.prototype.replaceAll = function(this: string, search: string, replace: string): string {
  return this.split(search).join(replace);
};

String.prototype.capitalize = function(): string {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

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

const toDeliveryDay = (
  isDeliveryTodayOrTomorrow: boolean,
  idx: number,
  today: Moment,
  deliverDay: string,
): DeliveryDay => {
  const segments = deliverDay.split(' ');
  const date = segments[1].replace('.', '');
  const month = months[segments[2]];
  const deliveyDayMoment = moment()
    .month(month)
    .date(date);
  const numOfDaysUntil = moment.duration(deliveyDayMoment.startOf('day').diff(today.startOf('day'))).days();
  const daysUntil: string | undefined =
    isDeliveryTodayOrTomorrow && idx === 0 ? undefined : localize('common.days_until', 'DAYS_UNTIL', numOfDaysUntil);

  return {
    day: deliveyDayMoment,
    daysUntil: daysUntil,
  };
};

const formatDate = (locale: string, format = 'dddd D. MMMM', deliveryday: DeliveryDay): DeliveryDay => ({
  ...deliveryday,
  dayFormatted: deliveryday.day.locale(locale).format(format),
});

const deliveryDayText = (
  isDeliveryDayToday: boolean,
  isDeliveryTomorrow: boolean,
  idx: number,
  deliveryDay: DeliveryDay,
): DeliveryDay => {
  let text: string;
  if (isDeliveryDayToday && idx === 0) {
    text = localize('common.today');
  } else if (isDeliveryTomorrow && idx === 0) {
    text = localize('common.tomorrow');
  } else {
    text = deliveryDay.dayFormatted || 'N/A';
  }
  return {
    ...deliveryDay,
    dayText: text.capitalize(),
  };
};

@customElement('posten-card')
export class PostenCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('posten-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private _config!: PostenCardConfig;

  public setConfig(config: PostenCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }
    if (!config.entity) {
      throw new Error(localize('common.missing_sensor'));
    }

    this._config = {
      name: localize('common.delivery_days'),
      ...config,
    };
  }

  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this._config.show_warning) {
      return this.showWarning(localize('common.show_warning'));
    }

    const numOfDays = this._config.num_of_days || 6;
    const isDeliveryToday = this.hass.states[this._config.entity].state.includes('i dag');
    const isDeliveryTomorrow = this.hass.states[this._config.entity].state.includes('i morgen');
    const today = moment();
    const deliveryDays = this.hass.states[this._config.entity].state
      .replaceAll('[', '')
      .replaceAll(']', '')
      .replaceAll("'", '')
      .replaceAll('i dag', '')
      .replaceAll('i morgen', '')
      .split(',')
      .slice(0, numOfDays)
      .map(s => s.trim())
      .map((s, idx) => toDeliveryDay(isDeliveryToday || isDeliveryTomorrow, idx, today, s))
      .map(d => formatDate(this.hass.language, this._config.date_format, d))
      .map((d, idx: number) => deliveryDayText(isDeliveryToday, isDeliveryTomorrow, idx, d));
    const icon = isDeliveryToday
      ? this._config.delivery_today_icon || 'mdi:mailbox-open'
      : this._config.no_delivery_today_icon || 'mdi:mailbox';

    return html`
      <ha-card
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleClick: hasAction(this._config.double_tap_action),
        })}
        tabindex="0"
        aria-label=${`Posten: ${this._config.entity}`}
      >
        <div class="card-header">
          <img class="logo" src="${postenLogo}" />
          ${this._config.name}
          <span class="icon">
            <ha-icon icon="${icon}"></ha-icon>
          </span>
        </div>
        <div class="deliveryDays">
          ${deliveryDays.map(
            deliveryDay =>
              html`
                <div class="deliveryDay">
                  <span>${deliveryDay.dayText}</span>
                  <span class="daysUntil">${deliveryDay.daysUntil}</span>
                </div>
              `,
          )}
        </div>
      </ha-card>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this._config && ev.detail.action) {
      handleAction(this, this.hass, this._config, ev.detail.action);
    }
  }

  private showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card') as LovelaceCard;
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this._config,
    });

    return html`
      ${errorCard}
    `;
  }

  static get styles(): CSSResult {
    return css`
      .logo {
        margin-right: 20px;
      }
      .icon {
        flex: 1;
        text-align: right;
      }
      .deliveryDays {
        background-color: #fff;
        color: #000;
      }
      .deliveryDays div:nth-child(even) {
        background-color: #f2f2f2;
      }
      .deliveryDay {
        display: flex;
        padding: 8px;
      }
      .deliveryDay .daysUntil {
        flex: 1;
        text-align: right;
        font-size: 0.8em;
        color: gray;
      }
      .card-header {
        display: flex;
        align-items: center;
      }
      ha-card {
        color: #fff;
        background-color: #e32d22;
      }
      ha-card img {
        vertical-align: middle;
      }
    `;
  }
}
