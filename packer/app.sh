echo "######script start######"
echo "######Installing MySQL######"
# Installing MYSQL
sudo yum -y install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
sudo yum -y install mysql-community-server
sudo systemctl enable --now mysqld
systemctl status mysqld
passwords=$(sudo grep 'temporary password' /var/log/mysqld.log | awk {'print $13'})
mysql --connect-expired-password -u root -p$passwords -e \"ALTER USER 'root'@'localhost' IDENTIFIED BY 'webservice';\"
mysql -u root -pwebservice -e \"create database webapp;\"
