FROM node:12.16.3

# Create app directory
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./

RUN npm install

RUN npm install react-scripts@3.4.1 -g

COPY . ./

EXPOSE 5000

CMD [ "npm", "start" ]
