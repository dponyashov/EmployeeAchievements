# Используем официальный образ Node.js как базовый
ARG app_dir=/app_front

FROM node:25-alpine AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR ${app_dir}

# Копируем package.json и package-lock.json (или yarn.lock)
COPY ./front-react/package*.json ./

# Устанавливаем зависимости проекта
RUN npm install

# Копируем остальные файлы проекта
COPY ./front-react/public ./public
COPY ./front-react/src ./src
COPY ./front-react/*.js ./
COPY ./front-react/*.html ./
COPY ./front-react/*.json ./

# Объявляем ARG для сборки
ARG VITE_BACK_URL

RUN echo VITE_BACK_URL: ${VITE_BACK_URL}

ENV VITE_BACK_URL=${VITE_BACK_URL}

# ENV VITE_REST_URL=${REST_URL}
# ENV VITE_REST_USER=${REST_USER}
# ENV VITE_REST_PASS=${REST_PASSWORD}

# Собираем приложение для продакшена
RUN npm run build

# Используем легковесный образ Nginx для продакшена
FROM nginx:alpine

# Копируем собранные файлы из стадии builder
COPY --from=builder ${app_dir}/dist /usr/share/nginx/html

# Открываем порт 80, который использует Nginx
EXPOSE 80

# Команда для запуска Nginx при старте контейнера
CMD ["nginx", "-g", "daemon off;"]