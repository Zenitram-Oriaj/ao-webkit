#!/bin/sh
##############################################################
#
#
##############################################################
echo '---------------------------------------------'
echo 'Preform A System Update'
apt-get -y update
echo '---------------------------------------------'
echo 'Update completed'
echo 'Install Additional Software'
apt-get -y install python-software-properties openssh-server curl git vsftpd chromium-browser msttcorefonts ttf-mscorefonts-installer

echo '---------------------------------------------'
echo 'Add Chris-Lea Node.js Repository'
add-apt-repository -y ppa:chris-lea/node.js
apt-get update
apt-get install -y nodejs

##############################################################
echo '---------------------------------------------'
echo 'Go to Home Directory and create GIT folder'
cd ~/.
mkdir ao
cd ao

##############################################################
echo '---------------------------------------------'
echo 'Clone Project Files Into ao Folder'
git clone https://github.com/Zenitram-Oriaj/ao-webkit.git
cd ao-webkit

echo 'Link Missing Older File To New Version'
ln -sf /lib/$(arch)-linux-gnu/libudev.so.1 /lib/$(arch)-linux-gnu/libudev.so.0

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
echo 'Run Application'
./nw

##############################################################
echo '---------------------------------------------'
echo 'Agile Office Webkit Process Completed!'
