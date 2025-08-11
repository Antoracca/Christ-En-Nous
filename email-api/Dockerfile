FROM node:20-alpine

RUN npm install -g pnpm@latest

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./

RUN pnpm install --frozen-lockfile --prod=false

COPY src ./src

COPY firebase-admin-key.json ./
COPY service-account.json ./

RUN pnpm run build

RUN pnpm prune --prod

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
