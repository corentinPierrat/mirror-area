FROM node:20

RUN npm install -g @expo/cli

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 19000 19001 19002

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

CMD ["sh", "-c", "echo 'Starting Expo with DevTools...' && npx expo start --lan --dev-client --clear --port 19000"]
