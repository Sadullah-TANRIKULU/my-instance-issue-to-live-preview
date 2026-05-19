FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# If you are compiling files, run your build script here:
# RUN npx tsc
EXPOSE 3000
CMD ["node", "app.js"]