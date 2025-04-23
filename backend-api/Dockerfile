FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 프로덕션 환경 설정
FROM node:18-slim

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/tsconfig*.json ./

EXPOSE 3000
CMD ["npm", "run", "start"]

