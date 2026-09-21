---
layout: ../../layouts/DocLayout.astro
title: How to test the Model Wallet
description: Copy-and-paste walkthrough to verify the Support Team Wallet matches, enforces its budgets, and appears in Cost Management.
---

# Support Team Wallet Test — Step-by-Step Guide

**How to use this guide:** keep two windows open side by side —

- **This window:** the instructions below.
- **The other window:** Agent Fabric at **omni.mulesoft.com** (and a Terminal or Postman window to send the requests).

Follow the steps in order. Each command is ready to copy and paste — you only change the proxy
web address where noted.

**What we're checking:** that a request to the **Omni OpenAI** proxy is (1) matched to the
*Support Team Wallet*, (2) limited by that wallet's budget, and (3) shows up in the
Cost Management report.

We run two versions of the same request:

| Test | Uses the token for | What should happen |
|------|--------------------|--------------------|
| **Positive** | a "support" user | Matched to the wallet, limited, appears in Cost Management |
| **Negative** | a non-"support" user | Not matched, not limited, does **not** appear |

> The two access tokens in this guide are already prepared for you and are valid until
> **September 2027**. Just copy them exactly. If you ever need to make your own (for example, to
> test a different group), see **[Appendix: Generate your own access token with jwt.io](#appendix-generate-your-own-access-token-jwt-with-jwtio)**.

---

## 1. What the proxy checks (for context)

In Agent Fabric, open **Model Proxies → Omni OpenAI → Policies**. Your request passes through these
checks in order:

![Omni OpenAI policy order](images/01-proxy-policies-order.png)

- **Client ID Enforcement** — needs your `client_id` and `client_secret`.
- **JWT Validation** — needs the access token (the long `Bearer ...` string).
- **Find Model Wallet** — matches the token's `group = support` to the wallet.
- **Model Based Routing** — picks the model from the `"model"` line in the request.
- **Model Wallet Token Rate Limit** — applies the budget.

## 2. The wallet we're testing

> **Don't have the Support Team Wallet yet?** Create it first by following
> **[How to create the Support Team Wallet](../how-to-create-the-support-team-wallet/)** — the step-by-step guide for creating the *Support Team
> Wallet* — then come back here to test it.

In Agent Fabric, open **Model Proxies → Model Wallets → Support Team Wallet**:

![Support Team Wallet detail](images/04-support-team-wallet-created.png)

The *Support Team Wallet* matches on **`group = support`** and has these budgets:

| Model | Limit | Resets |
|-------|-------|--------|
| `gpt-4o-mini` | **$5** | every month |
| `gpt-4o-mini` | **500 tokens** | every week |

`gpt-4o-mini` has **two** limits — the request is blocked when **either one** runs out first.

---

## 3. One thing you must change: the proxy web address

In Agent Fabric, open the **Omni OpenAI** proxy and go to the **Overview** tab to find its web
address. In every command below, replace this placeholder:

```
https://REPLACE-WITH-YOUR-PROXY-URL/openai/v1/chat/completions
```

with your real address. Everything else you can paste exactly as-is.

---

## 4. POSITIVE test — should be matched and limited

Copy and paste this whole block into your Terminal (after replacing the web address):

```bash
curl --location "https://REPLACE-WITH-YOUR-PROXY-URL/openai/v1/chat/completions" \
  --header "client_id: b879419E7F5F45B19a6b23f70Bfd62ce" \
  --header "client_secret: randome_secret" \
  --header "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBwb3J0LXRlYW0tdXNlciIsIm5hbWUiOiJTdXBwb3J0IFRlYW0gVXNlciIsImdyb3VwIjoic3VwcG9ydCIsImlhdCI6MTc5MDAxMTgxOCwibmJmIjoxNzkwMDExODE4LCJleHAiOjE4MjE1NDc4MTh9.148qHixuvcrNnj2rQVYmyKHHNBGBhrhdsoFwpUpNnGU" \
  --header "Content-Type: application/json" \
  --data '{
    "model": "gpt-4o-mini",
    "messages": [ { "role": "user", "content": "Write a one-line hello world in Rust." } ],
    "max_tokens": 64
  }' -i
```

**What you should see:**

1. The first response says **`HTTP/1.1 200`** near the top, and includes lines like:
   - `x-token-limit: 500`
   - `x-token-remaining: 440` (a number that goes down as you use it)
2. Run the command a few more times. Once the 500-token weekly limit is used up, you'll get
   **`HTTP/1.1 429`** with a `retry-after` line. That means the budget was enforced — success.

---

## 5. The two limits on GPT-4o Mini

This wallet puts **two** limits on the **same** model, `gpt-4o-mini`, and **both apply at the same time**:

| Limit | Measured in | Resets |
|-------|-------------|--------|
| **500 tokens** | tokens used | every week |
| **$5** | dollars spent | every month |

You don't switch models to test them — every `gpt-4o-mini` request counts against **both**. The
request is blocked as soon as **either** limit runs out first:

- The **500-token weekly** limit is small, so it will usually be reached **first** — that's the 429
  you'll see in the positive test.
- The **$5 monthly** limit is what makes the **$** figure grow in Cost Management (it needs the model
  to have pricing configured).

There is no separate model to switch to for this wallet — just keep using `gpt-4o-mini`.

---

## 6. NEGATIVE test — should NOT be matched

This is the same request, but with a token for a user who is **not** in the "support" group.
It should be allowed through but **not counted** against the wallet.

```bash
curl --location "https://REPLACE-WITH-YOUR-PROXY-URL/openai/v1/chat/completions" \
  --header "client_id: b879419E7F5F45B19a6b23f70Bfd62ce" \
  --header "client_secret: randome_secret" \
  --header "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvdGhlci11c2VyIiwibmFtZSI6Ik5vbi1TdXBwb3J0IFVzZXIiLCJncm91cCI6Im90aGVyIiwiaWF0IjoxNzkwMDExODE4LCJuYmYiOjE3OTAwMTE4MTgsImV4cCI6MTgyMTU0NzgxOH0.owqdUtpNpytQqeHbv6qq1fiEqRUx900gecqjgdveS7w" \
  --header "Content-Type: application/json" \
  --data '{
    "model": "gpt-4o-mini",
    "messages": [ { "role": "user", "content": "Write a one-line hello world in Rust." } ],
    "max_tokens": 64
  }' -i
```

**What you should see:**

- **`HTTP/1.1 200`**, but **no** `x-token-limit` or `x-token-remaining` lines (because no wallet matched).
- No matter how many times you run it, you will **never** get a 429 from the wallet.

---

## 7. Check the Cost Management report

In Agent Fabric, open **Cost Management** (left menu), or click **View usage** on the wallet page.
Filter to the Omni OpenAI proxy and the *Support Team Wallet*.

| What to check | Positive test | Negative test |
|---------------|---------------|---------------|
| Usage appears for this wallet | ✅ yes | ❌ no |
| Token count goes up | ✅ yes | ❌ no |
| **$** goes up | yes (and only if `gpt-4o-mini` has pricing set) | ❌ no |

**Two things to remember:**

- **Blocked (429) requests do not appear** in Cost Management — only successful (200) ones do.
- The **$** number only moves when the model has pricing configured. Token limits show up in the
  tokens view regardless.

---

## 8. If something goes wrong

| You see | What it usually means |
|---------|-----------------------|
| `401` (unauthorized) | The token or the `client_id`/`client_secret` is wrong — copy them again exactly |
| `503` "Invalid config" | The JWT Validation policy on the proxy is misconfigured (a proxy setting, not your request) |
| Positive test has no `x-token-...` lines | The wallet didn't match — make sure you used the **positive** token (the first one) |
| Never get a 429 on the positive test | The weekly/monthly limit isn't used up yet — run the command more times |
| The **$** never goes up | The model has no pricing set, or every request is being blocked (429) |

---

## Appendix: Generate your own access token (JWT) with jwt.io

You only need this if the pre-made tokens have expired, or if you want to test a **different group**.
The token must be signed with the same settings the proxy's **JWT Validation** policy expects:

| Setting | Value |
|---------|-------|
| Algorithm | **HS256** (this is "HMAC" with key length "256" in the policy) |
| Signing secret | **`openai-omni-model-jwt-validation`** |
| Claim used for matching | **`group`** — use `support` to match the wallet, or anything else (e.g. `other`) to *not* match |

### Steps

1. Open **[jwt.io](https://jwt.io)** in your browser and go to the **Encoder** (the side that builds a
   token, not the one that reads one).

2. Make sure the algorithm is set to **HS256** (top of the page).

3. In the **Payload** box, paste the following. This is the "support" (positive) token — to make the
   negative one, just change `"group": "support"` to `"group": "other"`:

   ```json
   {
     "sub": "support-team-user",
     "name": "Support Team User",
     "group": "support",
     "exp": 1821547818
   }
   ```

   > `exp` is the expiry date as a number. `1821547818` means **September 21, 2027**. You can leave
   > it as-is; the token will keep working until then.

4. In the signing / secret box (labeled **"your-256-bit-secret"** or **"Sign JWT: Secret"**), type
   exactly:

   ```
   openai-omni-model-jwt-validation
   ```

   **Important:** if there is a checkbox that says **"secret base64 encoded"**, leave it
   **unchecked**.

5. jwt.io builds the token automatically. Copy the long **encoded token** on the left/top — it's the
   `xxxxx.yyyyy.zzzzz` string.

6. In the curl commands above, replace everything **after** `Authorization: Bearer ` with the token
   you just copied. Keep the word `Bearer` and the space before your token.

That's it — your new token is ready to use in the tests above.

---

*The two access tokens in this guide are pre-made and expire September 2027. If you need fresh ones,
follow the appendix above or ask the person who set up this test to provide new ones.*
