FROM node:14-slim AS build

RUN mkdir /app

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

EXPOSE 5000

CMD ["yarn", "start"]

