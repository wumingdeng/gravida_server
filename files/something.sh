#!/bin/sh

# sync struct
cd ..
node_modules/.bin/sequelize db:migrate
cd -

# create data struct

cd ..
node_modules/.bin/sequelize model:create --name abc --attributes name:string
cd -

# modify data struct

cd ..
node_modules/.bin/sequelize migration:create --name addsome
# do your handle on up/down function
cd -