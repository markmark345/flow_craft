package utils

import (
    "os"

    "github.com/rs/zerolog"
)

func NewLogger() zerolog.Logger {
    logger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout}).With().Timestamp().Logger()
    return logger
}
