# Synology NAS HomeKit Bridge

This project aims to provide an Apple HomeKit interface to operate synology 
NAS products.

The idea here is to turn main web functions into Accessories for Apple HomeKit
that allows you to change the device states using the Home app on your Apple device.

Once all sensors are finished, everything will be neatly packed as a Docker container.

| Feature         | Accessory Type     | Description                                   | Status      |
|      ---        |        ---         |              ---                              |     ---     |
| System Temp     | Temperature sensor | Display NAS Temperature                       | Done        |
| Shared Folders     |  On/Off switch |  allows you to mount/unmount encrypted folders                      | Done        |
| Disk Temp       | Temperature sensor | Individual sensor for HD temp                 | In progress |
| Free space      | Temperature sensor | Return nas free disk space                    | Planned     |
| Used space      | Temperature sensor | Return nas used disk space                    | Planned     |
| Memory          | Temperature sensor | Return nas  memory usage                      | Planned     |
| CPU             | Temperature sensor | Return CPU usage                              | Planned     |
| VPN Connector   | On/Off switch      | Individual switchs to connect VPN             | Planned     |
| Disk Health status  | Temperature sensor | Individual disk health status             | Planned     |
| Upload total    | Temperature sensor | Total uploaded last day                       | Planned     |
| Reboot          | On/Off switch      | Toggle to reboot NAS                          | Planned     |
| UPS | Humidity sensor     | Shows NAS UPS status, battery level, duration/charging status and turns red on battery below 20% | Done        |
| Connected Users | On/Off switch      | Individual switchs to disconnect NAS sessions | Done        |
| Virtual Machines | On/Off switch      | Individual switchs to power on/off vms | Planned     |



##  Docker - HOWTO :D

###### Build Image 

First git clone this repo by running the command git clone https://github.com/ddmunhoz/SynoNasHKB.git

Enter the folder and run ```docker build --tag synonashkb:1.0 .```
Wait for docker to finish building your image.

###### Deploying the container

Create the following folder structure for your container:

**YOUR_CONTAINER_NAME(Folder)**                                                                                                           
**accessories(Subfolder)** <--> Holds your accesories so you wont have to redo the setup on container update                              
**config-SynoNasBridge.json(config file)** <--> Config file required by the application.

Copy the file **config-SynoNasBridge-example.json** from configs folder into **YOUR_CONTAINER_NAME** folder and rename it to **config-SynoNasBridge.json** and update it according to the example inside.

###### Container launch CMD line

```
docker run -dt --name YOUR_CONTAINER_NAME \
-v /path_on_your_server/YOUR_CONTAINER_NAME/config-SynoNasBridge.json:/tmp/SynoNasHKB/configs/config-SynoNasBridge.json \
-v /path_on_your_server/YOUR_CONTAINER_NAME/accessories:/persist \
--network host \
synonashkb:1.0
```