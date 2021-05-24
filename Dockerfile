FROM node:14.10-slim AS build

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]

