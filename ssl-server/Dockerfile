FROM nginx:1.27-alpine

RUN apk add certbot-nginx certbot

COPY ./default.conf.template /etc/nginx/templates/default.conf.template
