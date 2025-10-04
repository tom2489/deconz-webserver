Next steps:
1. Try to understand the example: https://github.com/cjp256/electron-snap-examples/blob/master/electron-packager-hello-world/snapcraft.yaml
2. snapcraft two apps.


How to snapcraft:

1. Deactivate VPN (Somehow containers are not able to connect to the internet when vpn is active)
2. run `snapcraft pack`

You can unsquash the snap in order to analyze whats going on:

1. `unsquashfs <snap>`
