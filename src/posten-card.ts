import { LitElement, html, customElement, property, internalProperty, CSSResult, TemplateResult } from 'lit-element';
import {
  HomeAssistant,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  LovelaceCard,
} from 'custom-card-helpers';

import './editor';
import { PostenCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import * as postenUtils from './posten-utils';
import { localize } from './localize/localize';
import { getStyles } from './styles';

import postenLogo from './images/posten.png';

/* eslint no-console: 0 */
console.info(
  `%c  POSTEN-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

const defaultNumOfDays = 6;

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'posten-card',
  name: 'Posten Card',
  description: 'A custom card that displays Norwegian mail delivery days',
});

String.prototype.replaceAll = function(this: string, search: string, replace: string): string {
  return this.split(search).join(replace);
};

String.prototype.capitalize = function(): string {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

@customElement('posten-card')
export class PostenCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('posten-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

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
      use_posten_background_color: true,
      ...config,
    };
  }

  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this._config.show_warning) {
      return this.showWarning(localize('common.show_warning'));
    }

    const postenDeliveryDays = this.hass.states[this._config.entity].state;
    const daysToDisplay = this._config.num_of_days || defaultNumOfDays;
    const deliveryDays = postenUtils.parseDeliveryDays(
      daysToDisplay,
      postenDeliveryDays,
      this.hass.language,
      this._config,
    );
    const icon = deliveryDays.some(d => d.deliveryToday)
      ? this._config.delivery_today_icon || 'mdi:mailbox-open'
      : this._config.no_delivery_today_icon || 'mdi:mailbox';
    const isHideIcon = this._config.hide_delivery_today_icon && this._config.hide_delivery_today_icon === true;
    const isHideLogo = this._config.hide_logo && this._config.hide_logo === true;
    const isUsePostenBackgroundColor =
      this._config.use_posten_background_color && this._config.use_posten_background_color === true;

    return html`
      <ha-card
        style="${isUsePostenBackgroundColor ? 'background-color: #e32d22; color: #fff' : ''}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleClick: hasAction(this._config.double_tap_action),
        })}
        tabindex="0"
        aria-label=${`Posten: ${this._config.entity}`}
      >
        <div class="card-header">
          ${!isHideLogo
            ? html`
                <img class="logo" src="${postenLogo}" />
              `
            : html``}
          ${this._config.name}
          ${!isHideIcon
            ? html`
                <span class="icon">
                  <ha-icon icon="${icon}"></ha-icon>
                </span>
              `
            : html``}
        </div>
        <div class="deliveryDays">
          ${deliveryDays.map(
            (deliveryDay, idx) =>
              html`
                <div class="deliveryDay">
                  <span>${postenUtils.deliveryDayText(idx, deliveryDay.date, deliveryDay.formattedDate)}</span>
                  <span class="daysUntil">${postenUtils.daysUntilText(deliveryDay.daysUntilDelivery)}</span>
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
    return getStyles();
  }
}
