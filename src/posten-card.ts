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
import moment from 'moment-with-locales-es6';

import './editor';
import postenLogo from './images/posten.png';

import { PostenCardConfig } from './types';
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
  januar: 'Jan',
  februar: 'Feb',
  mars: 'Mar',
  april: 'Apr',
  mai: 'May',
  juni: 'Jun',
  juli: 'Jul',
  august: 'Aug',
  september: 'Sep',
  oktober: 'Oct',
  november: 'Nov',
  desember: 'Dec',
};

const toDate = (deliverDay: string): number => {
  const segments = deliverDay.split(' ');
  const date = segments[1].replace('.', '');
  const month = months[segments[2]];
  const year = new Date().getFullYear();

  return Date.parse(month + ' ' + date + ', ' + year);
};

const formatDate = (locale: string, format = 'dddd D. MMMM', date: number): string =>
  moment(date)
    .locale(locale)
    .format(format);

const deliveryDayText = (isDeliveryDayToday: boolean, idx: number, deliveryDay: string): string => {
  return isDeliveryDayToday && idx === 0 ? localize('common.today') : deliveryDay;
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
      name: 'Posten leveringsdager',
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
    const deliveryDays = this.hass.states[this._config.entity].state
      .replaceAll('[', '')
      .replaceAll(']', '')
      .replaceAll("'", '')
      .replaceAll('i dag', '')
      .split(',')
      .slice(0, numOfDays)
      .map(s => s.trim())
      .map(toDate)
      .map(d => formatDate(this.hass.language, this._config.date_format, d))
      .map((d, idx: number) => deliveryDayText(isDeliveryToday, idx, d))
      .map(d => d.capitalize());
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
        <div class="card-header" style="display: flex; align-items: center">
          <img src="${postenLogo}" style="margin-right: 20px" />
          ${this._config.name}
          <span style="flex: 1; text-align: right">
            <ha-icon icon="${icon}"></ha-icon>
          </span>
        </div>
        <div class="table" style="background-color: #fff; color: #000">
          ${deliveryDays.map(
            item =>
              html`
                <div style="padding: 8px">${item}</div>
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
      .table div:nth-child(even) {
        background-color: #f2f2f2;
      }
      card-header {
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
      delivery-days {
        background-color: #fff;
      }
    `;
  }
}
