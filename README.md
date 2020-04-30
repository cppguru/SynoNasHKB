# Synology NAS companion

/* DISCLAIMER: I'm a C#/Python developer! not a Javascript expert.
 *  So be kind to me.
 */

This project aims to provide an Apple HomeKit interface to operate synology 
NAS products.

The idea here is to turn main web functions into Accessories for Apple HomeKit
that allows you to change the device states using the Home app on your Apple device.

Once all sensors are finished, everything will be neatly packed as a Docker container.

| Feature         | Accessory Type     | Description                                   | Status      |
|      ---        |        ---         |              ---                              |     ---     |
| System Temp     | Temperature sensor | Display NAS Temperature                       | Done        |
| Disk Temp       | Temperature sensor | Individual sensor for HD temp                 | In progress |
| Free space      | Temperature sensor | Return nas free disk space                    | Planned     |
| Used space      | Temperature sensor | Return nas used disk space                    | Planned     |
| Memory          | Temperature sensor | Return nas  memory usage                      | Planned     |
| CPU             | Temperature sensor | Return CPU usage                              | Planned     |
| VPN Connector   | On/Off switch      | Individual switchs to connect VPN             | Planned     |
| Disk Health status  | Temperature sensor | Individual disk health status             | Planned     |
| Upload total    | Temperature sensor | Total uploaded last day                       | Planned     |
| Reboot          | On/Off switch      | Toggle to reboot NAS                          | Planned     |
| Connected Users | On/Off switch      | Individual switchs to disconnect NAS sessions | Planned     |


# Container Running example

Build


