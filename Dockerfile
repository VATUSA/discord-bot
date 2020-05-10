FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

ENTRYPOINT /usr/src/app/build.sh