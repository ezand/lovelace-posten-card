# Posten Card by [@ezand](https://www.github.com/ezand)

A Lovelace card to display Norwegian Posten delivery days.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

![Project Maintenance][maintenance-shield]

## Prerequisites

This card assumes you have a sensor that provides the next delivery days,
see [this example](https://github.com/ezand/home-assistant-config/blob/master/sensors/posten-delivery-days.yaml).
Remember to replace the `postCode` parameter with your own.

## Installation

### [HACS](https://hacs.xyz/) (Home Assistant Community Store)

1. Go to HACS page on your Home Assistant instance
1. Select `Frontend`
1. Press add icon and search for `posten`
1. Select Posten Card repo and install
1. Force refresh the Home Assistant page (<kbd>Ctrl</kbd> + <kbd>F5</kbd>)
1. Add posten-card to your page

### Manual

1. Download the 'posten-card.js' from the latest [release](https://github.com/ezand/lovelace-posten-card/releases) (with right click, save link as)
1. Place the downloaded file on your Home Assistant machine in the `config/www` folder (when there is no `www` folder in the folder where your `configuration.yaml` file is, create it and place the file there)
1. In Home Assistant go to `Configuration->Lovelace Dashboards->Resources` (When there is no `resources` tag on the `Lovelace Dashboard` page, enable advanced mode in your account settings, rand retry this step)
1. Add a new resource
   1. Url = `/local/posten-card.js`
   1. Resource type = `module`
1. Force refresh the Home Assistant page (<kbd>Ctrl</kbd> + <kbd>F5</kbd>)
1. Add posten-card to your page

## Options

| Name                        | Type    | Requirement  | Description                                              | Default            |
| --------------------------- | ------- | ------------ | -------------------------------------------------------- | ------------------ |
| type                        | string  | **Required** | `custom:posten-card`                                     |                    |
| entity                      | string  | **Required** | The entity id for the Posten sensor                      |                    |
| name                        | string  | **Optional** | Card name                                                | `Leveringsdager`   |
| num_of_days                 | number  | **Optional** | Max number of days to display                            | `6`                |
| date_format                 | string  | **Optional** | Delivery date format                                     | `dddd D. MMMM`     |
| delivery_today_icon         | string  | **Optional** | Icon to display on delivery days                         | `mdi:mailbox-open` |
| no_delivery_today_icon      | string  | **Optional** | Icon to display when it's not a delivery day             | `mdi:mailbox`      |
| hide_delivery_today_icon    | boolean | **Optional** | Specify if the delivery today icon should be visible     | `true`             |
| hide_logo                   | boolean | **Optional** | Specify if the Posten logo should be visible             | `true`             |
| use_posten_background_color | boolean | **Optional** | Specify if the Posten background color should be applied | `true`             |

## Screenshots

![Card screenshot][screenshot-card]
![Edit card screenshot][screenshot-card-edit]

[commits]: https://github.com/ezand/lovelace-posten-card/commits/master
[devcontainer]: https://code.visualstudio.com/docs/remote/containers
[license-shield]: https://img.shields.io/github/license/ezand/lovelace-posten-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2020.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/v/release/ezand/lovelace-posten-card.svg?style=for-the-badge
[releases]: https://github.com/ezand/lovelace-posten-card/releases
[screenshot-card]: ./docs/screenshot_card.png
[screenshot-card-edit]: ./docs/screenshot_card_edit.png
