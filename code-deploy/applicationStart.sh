#!/bin/bash
echo '#### Running application start script ####'
sudo su root
cd /home/ec2-user/node-app
sudo pm2 start app.js
sudo pm2 startup systemd
sudo pm2 save
sudo ln -s /home/ec2-user/node-app/node-service.service /etc/systemd/system/node-service.service
sudo systemctl daemon-reload
sudo systemctl start node-service.service
sudo systemctl start amazon-cloudwatch-agent.service
