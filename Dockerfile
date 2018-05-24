FROM node:9.11-alpine

MAINTAINER Santhosh Prabhu

ADD ./ /opt/app-root/src/

WORKDIR /opt/app-root/src

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
