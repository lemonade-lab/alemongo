package driver

import (
	"alemongo/src/settings"
	"gopkg.in/gomail.v2"
)

type QQMailer struct {
	QQEmailConfig *settings.SMTPConfig
}

func (q *QQMailer) Send(to, subject, body string) error {
	message := gomail.NewMessage()
	message.SetAddressHeader("From", q.QQEmailConfig.FromEmail, "系统通知")
	message.SetHeader("To", to)
	message.SetHeader("Subject", subject)
	message.SetBody("text/html", body)

	d := gomail.NewDialer(q.QQEmailConfig.Host, q.QQEmailConfig.Port, q.QQEmailConfig.Username, q.QQEmailConfig.Password)
	return d.DialAndSend(message)
}
