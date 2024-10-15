#Build stage
FROM node:18 AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

#prod stage
FROM node:18

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist
# Copy the views directory
COPY --from=build /usr/src/app/src/views ./src/views  
# Copy the public directory (if you serve static assets)
COPY --from=build /usr/src/app/src/public ./src/public 
COPY package*.json ./

RUN npm install --only=production

RUN rm package*.json

EXPOSE 3000

CMD [ "node", "dist/main.js" ]
