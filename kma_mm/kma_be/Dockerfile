# Debug commit issue
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# EXPOSE 5000
EXPOSE 8000

CMD ["npm", "start"]
