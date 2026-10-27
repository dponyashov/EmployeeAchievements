# React + TypeScript + Vite

## React Compiler

## Expanding the ESLint configuration

# Commands

## 1. npm create vite@latest

## 2. Настрока Prettier

### 2.1 npm install --save-dev prettier eslint-config-prettier

### 2.2 настройка Prettier в VS Code и в файле eslint.config.ts - eslintConfigPrettier, // 2. Добавляем в конец, чтобы отключить конфликты стиля

## 3. npm install @reduxjs/toolkit react-redux axios

## 4. npm install react-router-dom

## 5. npm install jwt-decode

# 6. docker

## 6.1 build

### 6.1.1. docker-compose up --build

### 6.1.2. docker-compose images

## 6.2. save

### 6.2.1. docker save -o ./docker/images/ea-back.tar ea-back:0.0.1

### 6.2.2. docker save -o ./docker/images/ea-db.tar postgres:17-alpine

### 6.2.3. docker save -o ./docker/images/ea-front.tar ea-front:0.0.1

## 6.3. load

### 6.3.1. docker load -i ./docker/images/ea-back.tar

### 6.3.2. docker load -i ./docker/images/ea-db.tar

### 6.3.3. docker load -i ./docker/images/ea-front.tar

## 6.4. up

### 6.4.1. docker-compose up -d

## 6.5 dev/prod

### 6.5.1. docker compose -f docker-compose.dev.yaml up --build

### 6.5.2. docker compose -f docker-compose.prod.yaml up -d
