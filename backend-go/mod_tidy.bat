@echo off
go mod download github.com/redis/go-redis/v9
go mod tidy
go build ./...
echo Build result: %errorlevel%
