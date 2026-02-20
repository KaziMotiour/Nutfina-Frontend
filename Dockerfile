FROM node:alpine AS builder

WORKDIR /app

COPY package.json .

RUN npm install -f --production --ignore-scripts 

COPY . .

RUN npm run build

EXPOSE 3000 

CMD ["npm", "start"]