# Stage 1: Build với Node
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve static với Nginx
FROM nginx:alpine

# Copy build output từ stage trước
COPY --from=build /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx tùy chỉnh (cho SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
