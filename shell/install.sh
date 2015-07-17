#!/bin/sh
##############################################################
#
#
##############################################################
echo '---------------------------------------------'
echo 'Remove Default VNC Server'
sudo apt-get -y remove vino
sudo apt-get -y autoremove

echo '---------------------------------------------'
echo 'Preform A System Update'
sudo apt-get -y update

echo '---------------------------------------------'
echo 'Install Additional Software'
sudo apt-get -y install python-software-properties software-properties-common openssh-server curl git vsftpd x11vnc xdotool libavahi-compat-libdnssd-dev sysstat atsar screen

echo '---------------------------------------------'
echo 'Add Chris-Lea Node.js Repository'
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install --force-y -y nodejs

##############################################################
echo '---------------------------------------------'
echo 'Go to Home Directory and create GIT folder'
cd ~/.

##############################################################
echo '---------------------------------------------'
echo 'Clone Project Files Into ao Folder'
git clone https://github.com/Zenitram-Oriaj/ao-webkit.git
cd ao-webkit

echo '---------------------------------------------'
echo 'Get Node Webkit'
wget http://dl.nwjs.io/v0.12.2/nwjs-v0.12.2-linux-ia32.tar.gz
tar -zxvf nwjs-v0.12.2-linux-ia32.tar.gz

echo '---------------------------------------------'
echo 'Install Modules'
npm install

echo '---------------------------------------------'
echo 'Link Missing Older File To New Version'
sudo ln -sf /lib/$(arch)-linux-gnu/libudev.so.1 /lib/$(arch)-linux-gnu/libudev.so.0

echo '---------------------------------------------'
echo 'Reset Font Cache'
fc-cache -f -v

echo '---------------------------------------------'
echo 'Disable Screen Lock'
gsettings set org.gnome.desktop.lockdown disable-lock-screen 'true'

echo '---------------------------------------------'
echo 'Prevent Screen From Going To Sleep'
gsettings set org.gnome.desktop.session idle-delay 0

##############################################################
echo '---------------------------------------------'
echo 'Agile Office Webkit Process Completed!'
