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

snapcraft remote-build --build-for=armhf


# Creating an lxc container with armhf (armv7l)


IMPORTANT: For now internet connection inside armhf01 is not workin when ufw is enabled. So you can temporarily disable ufw.


sudo lxc-create -n armhf01 -t download -- -d ubuntu -r jammy -a armhf

lxc image list

sudo lxc-info -n armhf01
sudo lxc-ls

sudo lxc-start -n armhf01
sudo lxc-attach -n armhf01

sudo lxc-destroy -n armhf01

Hint: The container configuration lies under: /var/lib/lxc/armhf01/config

sudo apt-get -o Acquire::ForceIPv4=true -o Acquire::Retries=3 update
sudo apt-get -o Acquire::ForceIPv4=true -o Acquire::Retries=3 upgrade -y
