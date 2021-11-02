FROM node:14-alpine
WORKDIR /app
RUN apk add --no-cache bash
RUN apk --no-cache add --virtual builds-deps build-base python

COPY package.json yarn.lock .env* ./
RUN yarn global add pm2
RUN yarn install
RUN yarn build
ADD ./dist /app
EXPOSE 8080 8081
CMD [ "pm2-runtime", "main.js"]