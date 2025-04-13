FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

#start:dev로 hmr
CMD ["npm", "run", "start:dev"] 

# production
# RUN npm run build
# CMD ["node", "dist/main.js"]