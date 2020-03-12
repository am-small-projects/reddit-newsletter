FROM node:12
EXPOSE 5000

WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .