FROM node:14 as build

WORKDIR /app

COPY package.json package-lock.json ./

COPY . .
RUN npm install && npm run build