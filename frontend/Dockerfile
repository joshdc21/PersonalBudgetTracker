FROM node:18-alpine

WORKDIR /app

#. itu /app * artinya semua yang ad package(buat inclue package and package-lock)
COPY package*.json .
#install package2 nya didalam app
RUN npm i
#semuanya masuk kedalam container kita
COPY . .

#run after smw ny sdh ada
CMD ["npm", "run", "dev", "--host"]