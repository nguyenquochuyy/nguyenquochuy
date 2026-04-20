package logger

import (
	"log"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Log *zap.Logger

func Init(env string) {
	var err error
	var config zap.Config

	if env == "production" {
		config = zap.NewProductionConfig()
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	} else {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	}

	// Output to stdout instead of default stderr for non-errors
	config.OutputPaths = []string{"stdout"}
	config.ErrorOutputPaths = []string{"stderr"}

	Log, err = config.Build()
	if err != nil {
		log.Fatalf("Failed to initialize zap logger: %v", err)
	}

	zap.ReplaceGlobals(Log)
}

func Sync() {
	if Log != nil {
		_ = Log.Sync()
	}
}
