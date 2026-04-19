@echo off
set MONGO_URI=mongodb://localhost:27017
set DB_NAME=unishop
set JWT_SECRET=unishop-dev-secret-2026
set PORT=8080
set APP_ENV=development
echo Starting UniShop Go backend...
go run cmd\server\main.go
