package mailer

import (
	"bytes"
	"context"
	"crypto/tls"
	"embed"
	"fmt"
	"html/template"
	"net/smtp"
	"strings"
	"time"
)

//go:embed templates/*.html
var templatesFS embed.FS

type Config struct {
	Host        string
	Port        int
	Username    string
	Password    string
	From        string
	UseTLS      bool
	UseStartTLS bool
	AppBaseURL  string
	SupportURL  string
}

type Mailer struct {
	cfg       Config
	templates map[string]*template.Template
}

type ResetTemplateData struct {
	DisplayName   string
	ResetURL      string
	ExpiryMinutes int
	LoginURL      string
	SupportURL    string
}

func New(cfg Config) (*Mailer, error) {
	tmpls := make(map[string]*template.Template)
	for _, name := range []string{"reset_password_en.html", "reset_password_th.html"} {
		raw, err := templatesFS.ReadFile("templates/" + name)
		if err != nil {
			return nil, err
		}
		tmpl, err := template.New(name).Parse(string(raw))
		if err != nil {
			return nil, err
		}
		tmpls[name] = tmpl
	}
	return &Mailer{cfg: cfg, templates: tmpls}, nil
}

func (m *Mailer) SendPasswordReset(ctx context.Context, to string, displayName string, resetURL string, expiryMinutes int, lang string) error {
	if strings.TrimSpace(to) == "" {
		return fmt.Errorf("missing recipient")
	}
	if displayName == "" {
		displayName = to
	}
	loginURL := strings.TrimRight(m.cfg.AppBaseURL, "/") + "/login"
	supportURL := m.cfg.SupportURL
	if supportURL == "" {
		supportURL = strings.TrimRight(m.cfg.AppBaseURL, "/") + "/docs"
	}
	data := ResetTemplateData{
		DisplayName:   displayName,
		ResetURL:      resetURL,
		ExpiryMinutes: expiryMinutes,
		LoginURL:      loginURL,
		SupportURL:    supportURL,
	}

	htmlBody, err := m.renderResetHTML(lang, data)
	if err != nil {
		return err
	}
	textBody := buildResetText(data, lang)
	subject := "[FlowCraft] Password Reset Request"
	msg := buildMIMEMessage(m.cfg.From, to, subject, textBody, htmlBody)
	return m.send(ctx, []string{to}, msg)
}

func (m *Mailer) renderResetHTML(lang string, data ResetTemplateData) (string, error) {
	key := "reset_password_en.html"
	if strings.EqualFold(lang, "th") {
		key = "reset_password_th.html"
	}
	tmpl := m.templates[key]
	if tmpl == nil {
		tmpl = m.templates["reset_password_en.html"]
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func buildResetText(data ResetTemplateData, lang string) string {
	if strings.EqualFold(lang, "th") {
		return fmt.Sprintf(
			"สวัสดีคุณ %s,\n\nคุณได้รับอีเมลนี้เนื่องจากมีการร้องขอรีเซ็ตรหัสผ่านสำหรับบัญชี FlowCraft ของคุณ\n\nหากต้องการรีเซ็ตรหัสผ่านของคุณ โปรดคลิกที่ลิงก์ด้านล่างนี้:\n\n%s\n\nลิงก์นี้จะหมดอายุใน %d นาที เพื่อความปลอดภัย\n\nหากคุณไม่ได้เป็นผู้ร้องขอการรีเซ็ตรหัสผ่านนี้ โปรดเพิกเฉยต่ออีเมลนี้และตรวจสอบให้แน่ใจว่าไม่มีใครเข้าถึงบัญชีของคุณโดยไม่ได้รับอนุญาต\n\nด้วยความเคารพ,\nทีมงาน FlowCraft",
			data.DisplayName,
			data.ResetURL,
			data.ExpiryMinutes,
		)
	}
	return fmt.Sprintf(
		"Hello %s,\n\nYou received this email because a password reset was requested for your FlowCraft account.\n\nIf you want to reset your password, click the link below:\n\n%s\n\nThis link will expire in %d minutes for your security.\n\nIf you did not request this reset, please ignore this email.\n\nBest regards,\nThe FlowCraft Team",
		data.DisplayName,
		data.ResetURL,
		data.ExpiryMinutes,
	)
}

func buildMIMEMessage(from string, to string, subject string, textBody string, htmlBody string) []byte {
	var buf bytes.Buffer
	boundary := fmt.Sprintf("flowcraft-%d", time.Now().UnixNano())
	buf.WriteString(fmt.Sprintf("From: %s\r\n", from))
	buf.WriteString(fmt.Sprintf("To: %s\r\n", to))
	buf.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	buf.WriteString("MIME-Version: 1.0\r\n")
	buf.WriteString(fmt.Sprintf("Content-Type: multipart/alternative; boundary=%q\r\n", boundary))
	buf.WriteString("\r\n")
	buf.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	buf.WriteString("Content-Type: text/plain; charset=UTF-8\r\n\r\n")
	buf.WriteString(textBody)
	buf.WriteString("\r\n")
	buf.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	buf.WriteString("Content-Type: text/html; charset=UTF-8\r\n\r\n")
	buf.WriteString(htmlBody)
	buf.WriteString("\r\n")
	buf.WriteString(fmt.Sprintf("--%s--\r\n", boundary))
	return buf.Bytes()
}

func (m *Mailer) send(_ context.Context, to []string, msg []byte) error {
	addr := fmt.Sprintf("%s:%d", m.cfg.Host, m.cfg.Port)
	auth := smtp.PlainAuth("", m.cfg.Username, m.cfg.Password, m.cfg.Host)
	if m.cfg.UseTLS {
		tlsCfg := &tls.Config{ServerName: m.cfg.Host}
		conn, err := tls.Dial("tcp", addr, tlsCfg)
		if err != nil {
			return err
		}
		c, err := smtp.NewClient(conn, m.cfg.Host)
		if err != nil {
			return err
		}
		defer c.Quit()
		if ok, _ := c.Extension("AUTH"); ok {
			if err := c.Auth(auth); err != nil {
				return err
			}
		}
		if err := c.Mail(m.cfg.From); err != nil {
			return err
		}
		for _, rcpt := range to {
			if err := c.Rcpt(rcpt); err != nil {
				return err
			}
		}
		w, err := c.Data()
		if err != nil {
			return err
		}
		if _, err := w.Write(msg); err != nil {
			_ = w.Close()
			return err
		}
		return w.Close()
	}
	if m.cfg.UseStartTLS {
		c, err := smtp.Dial(addr)
		if err != nil {
			return err
		}
		defer c.Quit()
		if ok, _ := c.Extension("STARTTLS"); ok {
			if err := c.StartTLS(&tls.Config{ServerName: m.cfg.Host}); err != nil {
				return err
			}
		}
		if ok, _ := c.Extension("AUTH"); ok {
			if err := c.Auth(auth); err != nil {
				return err
			}
		}
		if err := c.Mail(m.cfg.From); err != nil {
			return err
		}
		for _, rcpt := range to {
			if err := c.Rcpt(rcpt); err != nil {
				return err
			}
		}
		w, err := c.Data()
		if err != nil {
			return err
		}
		if _, err := w.Write(msg); err != nil {
			_ = w.Close()
			return err
		}
		return w.Close()
	}
	return smtp.SendMail(addr, auth, m.cfg.From, to, msg)
}
