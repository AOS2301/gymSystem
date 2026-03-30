FROM node:20-slim

WORKDIR /app

# Instala dependência de sistema necessária para Prisma (OpenSSL)
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Copia dependências primeiro (melhor cache)
COPY package*.json ./
RUN npm install

# Copia apenas o schema do Prisma e gera o client
COPY prisma ./prisma
RUN npx prisma generate

# Agora copia o resto da aplicação
COPY . .

EXPOSE 3000

CMD ["npm", "start"]