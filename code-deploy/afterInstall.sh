#!/bin/bash
echo '#### Running after Install script ####'
sudo chown ec2-user:ec2-user /home/ec2-user/node_app
cd /home/ec2-user/node_app
npm -f install
sudo systemctl start amazon-cloudwatch-agent.service