package email

import (
	"alemongo/src/pkgs/email/driver"
	"alemongo/src/settings"
	"errors"
)

type MailSender interface {
	Send(to, subject, body string) error
}

func newMailSender(cfg settings.SMTPConfig) (MailSender, error) {
	switch cfg.Provider {
	case "qq":
		return &driver.QQMailer{QQEmailConfig: cfg}, nil
	default:
		return nil, errors.New("unsupported provider" + cfg.Provider)
	}
}
