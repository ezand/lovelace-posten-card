# Posten Card by [@ezand](https://www.github.com/ezand)

A Lovelace card to display Norwegian Posten delivery days.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

![Project Maintenance][maintenance-shield]

## Prerequisites

This card assumes you have a sensor that provides the next delivery days, see [this gists](https://gist.github.com/ezand/592aefd2ee880eb5723e041d413d7be0)
as an example. Remember to replace the `postCode` parameter with your

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
