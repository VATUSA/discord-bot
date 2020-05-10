FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .
RUN npm ci --only=production

CMD ["node", "app.js"]