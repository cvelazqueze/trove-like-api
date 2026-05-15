FROM node:22-alpine

RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN chmod +x scripts/docker-entrypoint.sh scripts/validate-env.sh

EXPOSE 3000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
