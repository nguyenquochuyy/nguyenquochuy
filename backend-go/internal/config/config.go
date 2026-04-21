package config

import "os"

type Config struct {
	MongoURI  string
	DBName    string
	JWTSecret string
	Port      string
	Env       string
	EmailUser string
	EmailPass string
	RedisURL  string
}

func Load() *Config {
	return &Config{
		MongoURI:  getEnv("MONGO_URI", "mongodb://localhost:27017"),
		DBName:    getEnv("DB_NAME", "unishop"),
		JWTSecret: getEnv("JWT_SECRET", "change-me-in-production"),
		Port:      getEnv("PORT", "8080"),
		Env:       getEnv("APP_ENV", "development"),
		EmailUser: getEnv("EMAIL_USER", ""),
		EmailPass: getEnv("EMAIL_PASS", ""),
		RedisURL:  getEnv("REDIS_URL", ""),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
