FROM node:12
EXPOSE 5000

WORKDIR /usr/app
COPY . .
# wont copy the node_moduels because they are in the .dockerignore
RUN npm install --quiet
RUN npm test
