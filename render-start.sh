#!/bin/bash

# Проверяем, существует ли директория .next/standalone
if [ -d ".next/standalone" ]; then
  echo "Запускаем приложение из standalone директории..."
  cd .next/standalone
  node server.js
else
  echo "Standalone директория не найдена, запускаем через server.js..."
  node server.js
fi 