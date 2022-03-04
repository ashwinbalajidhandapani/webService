echo "######script start######"
echo "######Installing MySQL######"
# Installing MYSQL
echo "###########################"
echo "#########step -1###########"
echo "###########################"
sudo yum -y install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
echo "###########################"
echo "#########step -2###########"
echo "###########################"
sudo yum -y install mysql-community-server
echo "###########################"
echo "#########step -3###########"
echo "###########################"
sudo systemctl enable --now mysqld
echo "###########################"
echo "#########step -4###########"
echo "###########################"
systemctl status mysqld
echo "###########################"
echo "#########step -5###########"
echo "###########################"
mkdir /home/ec2-user/node_app
chown ec2-user:ec2-user /home/ec2-user/node_app
echo "###########directory Created####################"
# passwords=$(sudo grep 'temporary password' /var/log/mysqld.log | awk {'print $13'})
# echo "###########################"
# echo "#########step -6###########"
# echo "###########################"

# mysql --connect-expired-password -u root -p$passwords -e \"ALTER USER 'root'@'localhost' IDENTIFIED BY 'webservice';\"
# echo "###########################"
# echo "#########step -7###########"
# echo "###########################"
# mysql -u root -pwebservice -e \"create database webapp;\"

