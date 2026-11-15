FROM node:22-alpine
WORKDIR /workspace/backend
COPY backend/package*.json ./
COPY package.json ../package.json
RUN npm install
COPY backend/ ./
COPY database/ ../database/
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate && npm run build
EXPOSE 4000
CMD ["sh", "-c", "npm run db:deploy && npm start"]
