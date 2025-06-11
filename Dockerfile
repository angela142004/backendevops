# Usa Node.js como base
FROM node:22.14.0

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json para aprovechar el caché
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código del proyecto (incluyendo carpeta prisma y schema.prisma)
COPY . .

# Ejecuta prisma generate ahora que TODO el código ya está copiado
RUN npx prisma generate

# Expone el puerto del backend
EXPOSE 4001

# Comando para iniciar el servidor
CMD ["node", "src/index.js"]
