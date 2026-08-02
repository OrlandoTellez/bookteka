# Usamos node para construir la app
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y lockfile
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# El valor de VITE_* se sustituye durante el build de Vite.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Copiar código fuente
COPY . .

# Build de la app (esto genera los archivos estáticos en /dist)
RUN pnpm build

# Stage 2: Servir con Nginx
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos estáticos del stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 8080 (el compose lo publica como 8081)
EXPOSE 8080

# Nginx corre en foreground
CMD ["nginx", "-g", "daemon off;"]
