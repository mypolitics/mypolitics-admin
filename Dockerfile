FROM node:14-slim AS build

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm install

RUN npm build

EXPOSE 5000

CMD ["npm", "start"]
