# React + TypeScript + Vite

## React Compiler

## Expanding the ESLint configuration

# Commands

## 1. npm create vite@latest

## Настрока Prettier

### 2.1 npm install --save-dev prettier eslint-config-prettier

### 2.2 настройка Prettier в VS Code и в файле eslint.config.ts - eslintConfigPrettier, // 2. Добавляем в конец, чтобы отключить конфликты стиля

## 3. npm install @reduxjs/toolkit react-redux axios

## 4. npm install react-router-dom

## 5. npm install jwt-decode

# docker

## docker-compose up --build

## docker-compose images

## save

### docker save -o ./docker/images/ea-back.tar ea-back:0.0.1

### docker save -o ./docker/images/ea-db.tar 650b442ec4f7

### docker save -o ./docker/images/ea-front.tar ea-front:0.0.1

## load

### docker load -i ea-back.tar

### docker load -i ea-db.tar

### docker load -i ea-front.tar

## up

### docker-compose up -d
