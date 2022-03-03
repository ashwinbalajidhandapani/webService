echo "script start"
sleep 30
# yum update
sudo yum update -y
sleep 5
# installing epel repo
sudo amazon-linux-extras install epel
sleep 5
#node installation
sudo yum install -y gcc-c++ make 
sleep 5
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sleep 5
sudo yum install -y nodejs
# Postgres installation
sleep 10
sudo tee /etc/yum.repos.d/pgdg.repo<<EOF
[pgdg14]
name=PostgreSQL 14 for RHEL/CentOS 7 - x86_64
baseurl=http://download.postgresql.org/pub/repos/yum/14/redhat/rhel-7-x86_64
enabled=1
gpgcheck=0
EOF
sleep 15
sudo yum makecache -y
sleep 5
sudo yum install postgresql14 -y
sudo yum install postgresql14-server -y
    # Initializing DB
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb
    # Staring PSQL service
sudo systemctl enable --now postgresql-14
    # making PSQL listen to port 5432
echo "#############################"
echo "## setting the port to 5432##"
echo "#############################"
sudo ss -tunelp | grep 5432
sudo systemctl restart postgresql-14
sleep 30
echo "#############################"
echo "########starting psql########"
echo "#############################"
sudo systemctl enable --now postgresql-14
 
createDatabase(){
    echo "creating database"
    sudo su - postgres
    psql -c "create database demo"
}
createDatabase
echo "End of Script"

echo "########################"
echo "#### Installing Git ####"
echo "########################"

sudo yum install git -y
sleep 30

mkdir webService
cd webService
git clone git@github.com:ashwinBalajiDhadapani-org/webService.git
files=$(shopt -s nullglob dotglob; echo your/dir/*)
if (( ${#files} ))
then
  echo "contains files"
else 
  echo "empty (or does not exist or is a file)"
fi


