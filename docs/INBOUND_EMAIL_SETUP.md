# Inbound email setup — Notes capture-by-email

Operator runbook for activating the N-1 webhook so users can email
notes to their personal `capture-<slug>@notes.signalstudio.ie` address.

Until these steps are done the endpoint at
`POST notes.signalstudio.ie/api/capture/email` returns `401` on every
call — the data path is live but mail isn't yet flowing.

## 1 · Provider (recommended: Resend Inbound)

Signal Analytics already uses Resend for outbound; staying on one
provider keeps env management thin.

1. Sign in at <https://resend.com>.
2. Create an **inbound domain** for `notes.signalstudio.ie`.
3. Add a **route** with these settings:
   - **Pattern**: `capture-*@notes.signalstudio.ie`
   - **Action**: forward via webhook
   - **URL**: `https://notes.signalstudio.ie/api/capture/email`
   - **Method**: POST
   - **Auth**: `Authorization: Bearer <NOTES_CAPTURE_INBOUND_SECRET>`
   - **Body**: JSON with at minimum `{ to, from, subject, text }`

Resend's normalised webhook payload already includes these keys, so
no custom transform is needed.

## 2 · DNS

Add these MX records on the subdomain. Values are Resend's — verify
against the Resend dashboard before copying.

```
notes.signalstudio.ie.   MX   10  feedback-smtp.eu-west-1.amazonses.com.
```

TXT records for SPF / DKIM / DMARC are issued by Resend on inbound
domain verification — paste them straight from the dashboard.

## 3 · Env vars

Set on the **notes** Vercel project, Production + Preview:

```
NOTES_CAPTURE_INBOUND_SECRET=<long random string, ≥32 chars>
NEXT_PUBLIC_NOTES_CAPTURE_DOMAIN=notes.signalstudio.ie
```

Use the same `NOTES_CAPTURE_INBOUND_SECRET` value on Resend's
webhook config (step 1, "Auth"). The webhook handler uses a
constant-time compare so timing attacks aren't a concern, but the
value should still be unguessable.

Generate one:

```bash
openssl rand -hex 32
```

## 4 · Smoke test

After DNS propagates (5–30 min) and Vercel redeploys:

1. Sign in to <https://notes.signalstudio.ie>. Confirm tier is
   `workspace` or higher (free tier sees an upgrade pitch instead).
2. The `CaptureEmailRow` beneath the stream shows your address;
   click to copy.
3. Send a plain email to that address from any client. Body becomes
   a new note within ~30 seconds.

If the note doesn't arrive:

- Check Resend's inbound logs for delivery status.
- Tail Vercel function logs for `/api/capture/email` —
  `401 unauthorized` means the bearer didn't match;
  `400 no-slug-in-to` means the `to` field didn't parse;
  `202 accepted=false` means the slug didn't map to a user.

## 5 · Rotate

Either side of the secret can be rotated independently:

- New Resend bearer → set the same value on Vercel before saving on
  Resend (avoid a brief 401 window).
- New user slug → `regenerateCaptureSlug()` server action (UI surface
  forthcoming). Old address stops resolving immediately.
