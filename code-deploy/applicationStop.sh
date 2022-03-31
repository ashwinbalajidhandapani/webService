#!/bin/bash
echo '##### Application Stop Script ####'
sudo su root
sudo pm2 stop all
sudo pm2 save
cd /home/ec2-user/node_app
sudo systemctl stop node-service.service