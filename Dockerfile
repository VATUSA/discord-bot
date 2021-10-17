FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

RUN npm ci

RUN chmod +x /usr/src/app/build.sh
ENTRYPOINT /usr/src/app/build.sh

EXPOSE 3000
