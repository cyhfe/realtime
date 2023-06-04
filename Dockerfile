FROM node:18-alpine as builder

WORKDIR /code

COPY package.json package-lock.json ./
RUN npm install 

COPY . .
RUN npm run build

FROM nginx:alpine
ADD nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder code/dist /usr/share/nginx/html