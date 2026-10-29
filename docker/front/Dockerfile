# Используем официальный образ Node.js как базовый
ARG app_dir=/app_front

FROM node:25-alpine AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR ${app_dir}

# Копируем package.json и package-lock.json (или yarn.lock)
COPY ./package*.json ./

# Устанавливаем зависимости проекта
# RUN npm install
RUN npm ci && npm cache clean --force

# Копируем остальные файлы проекта
COPY ./public ./public
COPY ./src ./src
COPY ./*.ts ./
COPY ./*.js ./
COPY ./*.html ./
COPY ./*.json ./

# Объявляем ARG для сборки
ARG VITE_BACK_URL

RUN echo VITE_BACK_URL: ${VITE_BACK_URL}

ENV VITE_BACK_URL=${VITE_BACK_URL}

# Собираем приложение для продакшена
RUN npm run build

# Используем легковесный образ Nginx для продакшена
FROM nginx:alpine

# 1. КОПИРУЕМ ВАШ КОНФИГ НА МЕСТО ДЕФОЛТНОГО
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы из стадии builder
COPY --from=builder ${app_dir}/dist /usr/share/nginx/html

# Открываем порт 80, который использует Nginx
EXPOSE 80

# Команда для запуска Nginx при старте контейнера
CMD ["nginx", "-g", "daemon off;"]