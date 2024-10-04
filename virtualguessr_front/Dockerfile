FROM node:14 as build

WORKDIR /app

COPY package.json package-lock.json ./
# RUN npm ci

COPY . .
RUN npm run build