import { LitElement, html, customElement, property, TemplateResult, CSSResult, css } from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { PostenCardConfig } from './types';
import * as postenUtils from './posten-utils';

const options = {
  entity: {
    name: 'Entity',
  },
  num_of_days: {
    name: 'Number of days to display',
  },
  date_format: {
    name: 'Date format',
  },
  delivery_today_icon: {
    name: 'Delivery today icon',
  },
  no_delivery_today_icon: {
    name: 'No delivery today icon',
  },
  hide_delivery_today_icon: {
    name: 'Hide delivery today icon?',
    default: postenUtils.defaultHideDeliveryTodayIcon,
  },
  hide_logo: {
    name: 'Hide Posten logo?',
    default: postenUtils.defaultHideLogo,
  },
  use_posten_background_color: {
    name: 'Use Posten colored background?',
    default: postenUtils.defaultUsePostenBackgroundColor,
  },
};

@customElement('posten-card-editor')
export class PostenCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) private _config?: PostenCardConfig;
  @property({ attribute: false }) private _toggle?: boolean;

  public setConfig(config: PostenCardConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    // You can restrict on domain type
    const entities = Object.keys(this.hass.states).filter((eid) => eid.substr(0, eid.indexOf('.')) === 'sensor');

    const deliveryTodayIcon = this._config?.delivery_today_icon || postenUtils.defaultDeliveryTodayIcon;
    const noDeliveryTodayIcon = this._config?.no_delivery_today_icon || postenUtils.defaultNoDeliveryTodayIcon;

    const _entity = (): string => {
      if (this._config) {
        return this._config.entity;
      }
      return '';
    };

    return html`
      <div class="card-config">
        <paper-dropdown-menu label="Entity (Required)" @value-changed=${this._valueChanged} .configValue=${'entity'}>
          <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(_entity())}>
            ${entities.map((entity) => {
              return html`<paper-item>${entity}</paper-item>`;
            })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-input
          @keyup=${this._valueChanged}
          always-float-label
          label=${options.num_of_days.name}
          value=${this._config?.num_of_days || ''}
          .configValue=${'num_of_days'}
        ></paper-input>

        <paper-input
          @keyup=${this._valueChanged}
          always-float-label
          label=${options.date_format.name}
          value=${this._config?.date_format || ''}
          .configValue=${'date_format'}
        ></paper-input>

        <div class="icon-input">
          <paper-input
            @keyup=${this._valueChanged}
            always-float-label
            label=${options.delivery_today_icon.name}
            value=${this._config?.delivery_today_icon || ''}
            .configValue=${'delivery_today_icon'}
          ></paper-input>
          <ha-icon icon=${deliveryTodayIcon}></ha-icon>
        </div>

        <div class="icon-input">
          <paper-input
            @keyup=${this._valueChanged}
            always-float-label
            label=${options.no_delivery_today_icon.name}
            value=${this._config?.no_delivery_today_icon || ''}
            .configValue=${'no_delivery_today_icon'}
          ></paper-input>
          <ha-icon icon=${noDeliveryTodayIcon}></ha-icon>
        </div>

        <div class="checkbox-input">
          <iron-label for="hideDeliveryTodayIcon">${options.hide_delivery_today_icon.name}</iron-label>
          <ha-switch
            id="hideDeliveryTodayIcon"
            aria-label=${`Hide delivery today icon ${this._config?.hide_delivery_today_icon ? 'off' : 'on'}`}
            .checked=${this._config?.hide_delivery_today_icon == undefined
              ? postenUtils.defaultHideDeliveryTodayIcon
              : this._config.hide_delivery_today_icon}
            .configValue=${'hide_delivery_today_icon'}
            @change=${this._valueChanged}
          ></ha-switch>
        </div>

        <div class="checkbox-input">
          <iron-label for="hideLogoCB">${options.hide_logo.name}</iron-label>
          <ha-switch
            id="hideLogoCB"
            aria-label=${`Hide logo ${this._config?.hide_logo ? 'off' : 'on'}`}
            .checked=${this._config?.hide_logo == undefined ? postenUtils.defaultHideLogo : this._config.hide_logo}
            .configValue=${'hide_logo'}
            @change=${this._valueChanged}
          ></ha-switch>
        </div>

        <div class="checkbox-input">
          <iron-label for="usePostenBackgroundColorCB">${options.use_posten_background_color.name}</iron-label>
          <ha-switch
            id="usePostenBackgroundColorCB"
            aria-label=${`Use Posten background color ${this._config?.use_posten_background_color ? 'off' : 'on'}`}
            .checked=${this._config?.use_posten_background_color == undefined
              ? postenUtils.defaultUsePostenBackgroundColor
              : this._config.use_posten_background_color}
            .configValue=${'use_posten_background_color'}
            @change=${this._valueChanged}
          ></ha-switch>
        </div>
      </div>
    `;
  }

  private _toggleOption(ev): void {
    this._toggleThing(ev, options);
  }

  private _toggleThing(ev, optionList): void {
    const show = !optionList[ev.target.option].show;
    for (const [key] of Object.entries(optionList)) {
      optionList[key].show = false;
    }
    optionList[ev.target.option].show = show;
    this._toggle = !this._toggle;
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (target.configValue) {
      const targetValue = target.value !== undefined ? target.value : target.checked;
      if (
        targetValue === '' ||
        (options[target.configValue].default !== undefined && options[target.configValue].default == targetValue)
      ) {
        const filterAwayKeys = [target.configValue];
        const filtered = Object.keys(this._config)
          .filter((key) => !filterAwayKeys.includes(key))
          .reduce(
            (obj, key) => {
              return {
                ...obj,
                [key]: this._config ? this._config[key] : '',
              };
            },
            {
              type: this._config.type,
              entity: this._config.entity,
            },
          );

        this._config = filtered;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value || false,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
      }
      ha-switch {
        padding-bottom: 8px;
      }
      .icon-input {
        display: flex;
        width: 100%;
        align-items: center;
      }
      .icon-input paper-input {
        flex: 1;
      }
      .checkbox-input {
        display: flex;
        width: 100%;
        align-items: center;
        padding-bottom: 10px;
        padding-top: 10px;
      }
      .checkbox-input iron-label {
        flex: 1;
      }
    `;
  }
}
