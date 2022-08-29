FROM 247981707334.dkr.ecr.eu-central-1.amazonaws.com/node:14.15.0-alpine3.12

# Timezone
RUN apk add tzdata curl\
    && cp /usr/share/zoneinfo/Europe/Rome /etc/localtime \
    && echo "Europe/Rome" >  /etc/timezone

WORKDIR /usr/share/crawer

COPY ./src/ /usr/share/crawer/

RUN npm --prefix /usr/share/crawer install --production \
    && chmod +x /usr/share/crawer/init.js

CMD [ "node", "/usr/share/crawer/init.js"]