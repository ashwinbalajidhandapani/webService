echo 'Validating Services'
pm2 restart all --update-env
pm2 save
pm2 status