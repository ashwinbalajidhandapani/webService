echo "#################################"
echo "#######Before Installatiin#######"
echo "#################################"

DIR = "home/ec2-user/express-app"
if [-d "$DIR"]; then
    echo "directory exists !!"
else
    echo "#### Creating Directory###"
    mkdir ${DIR}
fi
