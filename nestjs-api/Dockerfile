FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
COPY . .
RUN npx prisma generate
RUN npm run build
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/main.js"]
