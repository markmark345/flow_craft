# SMTP Setup

FlowCraft sends password reset emails via SMTP. Configure these API env vars:

- `SMTP_HOST`
- `SMTP_PORT` (default `587`)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (e.g. `FlowCraft <no-reply@yourdomain.com>`)
- `SMTP_USE_TLS` (`true`/`false`)
- `SMTP_USE_STARTTLS` (`true`/`false`)
- `SMTP_SUPPORT_URL` (optional; fallback to `${APP_BASE_URL}/docs`)

## Gmail SMTP (example)

1. Enable 2FA on your Google account.
2. Create an App Password (Google Account → Security → App Passwords).
3. Use:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your@gmail.com`
   - `SMTP_PASS=your-app-password`
   - `SMTP_USE_STARTTLS=true`

## Notes

- Use `SMTP_USE_TLS=true` for direct TLS (port 465).
- Use `SMTP_USE_STARTTLS=true` for STARTTLS (port 587).
- Set `SMTP_FROM` to a verified sender.
