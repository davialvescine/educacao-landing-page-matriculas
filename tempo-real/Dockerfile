FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY src ./src
ENV PORTA=3801
EXPOSE 3801
# Healthcheck bate na única rota HTTP do serviço; o resto é WebSocket.
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://127.0.0.1:3801/saude || exit 1
CMD ["node", "src/index.mjs"]
