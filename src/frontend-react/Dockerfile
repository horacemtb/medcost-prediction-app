FROM node:20-alpine

WORKDIR /app

COPY src/frontend-react/package*.json ./
RUN npm install

COPY src/frontend-react .

EXPOSE 8501

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8501"]
