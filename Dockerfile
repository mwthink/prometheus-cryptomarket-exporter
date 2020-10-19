FROM docker.io/library/node:lts-alpine
WORKDIR /app

COPY package.json tsconfig.json yarn.lock ./

RUN yarn install
COPY src ./src/
RUN yarn run build && yarn install --prod && rm -rf ./tsconfig.json ./src/

ENTRYPOINT ["/usr/local/bin/node","/app/dist"]
