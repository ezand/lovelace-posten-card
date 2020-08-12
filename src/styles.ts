import { css, CSSResult } from 'lit-element';

export const getStyles = (): CSSResult => {
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
    ha-card img {
      vertical-align: middle;
    }
  `;
};
