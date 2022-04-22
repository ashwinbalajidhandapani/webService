sleep 30
sudo yum update -y
sudo yum install git -y
sudo amazon-linux-extras install epel
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash - 
sudo yum install -y nodejs 
sudo npm install -g pm2

# sudo yum -y install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
# sudo yum -y install mysql-community-server
# sudo systemctl enable --now mysqld
# systemctl status mysqld
# pass=$(sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $13}')
# mysql -u root --password=$pass-e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'hello123'; flush privileges;" --connect-expired-password
# sudo yum -y install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
# # sudo amazon-linux-extras install epel
# sudo yum -y install mysql-community-server
# sudo systemctl enable --now mysqld
# systemctl status mysqld
# passwords=$(sudo grep 'temporary password' /var/log/mysqld.log | awk {'print $13'})
# mysql --connect-expired-password -u root -p$passwords -e \"ALTER USER 'root'@'localhost' IDENTIFIED BY 'Elgsid@1234';\"
# mysql -u root -pAshwin@Kumar123 -e \"create database userdetails;\"
mkdir /home/ec2-user/node_app
chown ec2-user:ec2-user /home/ec2-user/node_app
