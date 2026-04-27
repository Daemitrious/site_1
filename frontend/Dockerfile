FROM node:22-alpine

WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_AUTHOR_FULL_NAME="Dimitry Elizabarovich Krushinskiy"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_AUTHOR_FULL_NAME=$NEXT_PUBLIC_AUTHOR_FULL_NAME

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
