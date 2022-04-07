#!/bin/bash
echo '#### Running application start script ####'
cd /home/ec2-user/node_app
sudo su root
sudo pm2 start index.js
sudo pm2 startup systemd
sudo pm2 save
sudo ln -sf /home/ec2-user/node_app/node-service.service /etc/systemd/system/node-service.service
sudo systemctl daemon-reload
sudo systemctl restart node-service.service
