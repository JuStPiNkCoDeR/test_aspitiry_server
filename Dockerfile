FROM node:14.8-alpine

WORKDIR /app
COPY . .

RUN npm install