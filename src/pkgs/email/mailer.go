package email

import (
	"alemongo/src/pkgs/email/driver"
	"alemongo/src/settings"
	"errors"
	"go.uber.org/zap"
)

var Sender MailSender

type MailSender interface {
	Send(to, subject, body string) error
}

func newMailSender(cfg *settings.SMTPConfig) (MailSender, error) {
	switch cfg.Provider {
	case "qq":
		return &driver.QQMailer{QQEmailConfig: cfg}, nil
	default:
		return nil, errors.New("unsupported provider" + cfg.Provider)
	}
}

func InitEmailSender(cfg *settings.SMTPConfig) {
	sender, err := newMailSender(cfg)
	if err != nil {
		zap.L().Error("InitEmailSender failed", zap.Error(err))
		return
	}
	Sender = sender
}
