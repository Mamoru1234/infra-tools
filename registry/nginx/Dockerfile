FROM nginx:1.27-alpine

RUN apk add certbot-nginx certbot

COPY ./default.conf /etc/nginx/conf.d/default.conf
