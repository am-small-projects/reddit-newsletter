FROM node:10.15.0-alpine
EXPOSE 5000

WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .