Next steps:
1. Try to create frontend-mechanism which detects wheter there is a backend mistake or deconz server is not running ..


# How-To's
How to snapcraft:

1. Deactivate VPN (Somehow containers are not able to connect to the internet when vpn is active)
2. run `snapcraft pack`

You can unsquash the snap in order to analyze whats going on:

1. `unsquashfs <snap>`


# Keep in mind
- Raspberry Pi Zero does not support 
  - armv7l
  - snaps
  - node 14+
  - therefore we should not focus on buidling software for this architecture



sudo snappy-debug security scanlog

YOU CAN ONLY LOCALLY SNAPCRAFT WHEN UFW IS DISABLED .. DO NOT FORGET TO ENABLE IT AFTERWARDS !

snapcraft remote-build --build-for=armhf
