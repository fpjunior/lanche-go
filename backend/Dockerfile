FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install && npm cache clean --force

# Copiar código fonte
COPY . .

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Mudar ownership dos arquivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 3001

# Comando para desenvolvimento
CMD ["npm", "run", "dev"]