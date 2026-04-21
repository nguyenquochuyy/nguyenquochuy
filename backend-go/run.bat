@echo off
set MONGO_URI=mongodb://localhost:27017
set DB_NAME=unishop
set JWT_SECRET=dev-secret-key-12345
set PORT=8080
set APP_ENV=development
go run cmd\server\main.go
