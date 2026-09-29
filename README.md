# Finmeyo — loans landing page

The page at **loan.finmeyo.com**: a single lead-capture page for loans in
Gurgaon and Delhi NCR.

It is a separate application from the main site on purpose, and the reason
shapes everything else in here.

## This repository holds nothing worth stealing

There is **no database connection, no session secret and no API key** in this
app, and there should never be one. The main site holds the console, the lender
rules and the customer records — names, mobile numbers, PAN-verified names,
income, uploaded bank statements. That is data the DPDP Act makes us
responsible for, and the point of splitting this page out is that somebody can
work on it, run it locally and deploy it without ever being near any of that.

What this app needs from the business, it asks for over HTTPS:

| | |
|---|---|
| `GET /api/rates` | what each loan costs at each credit band, and the lender panel |
| `GET /api/site-config` | the phone number, address and analytics id |
| `POST /api/capture` | a lead — into the same queue as every other lead |

All three are public endpoints on the main site: nothing they return is
confidential, and the first two are the same figures already printed on
finmeyo.com/lenders. See `src/lib/api.ts`.

**If you find yourself adding a credential here, stop.** It means something
this page needs is not available through a public endpoint, and the answer is a
new endpoint on the main site, not a secret in this repository.

## Running it

```bash
npm install
cp .env.example .env.local     # then edit it
npm run dev                    # http://localhost:3100
```

`.env.local`:

```
NEXT_PUBLIC_API_BASE=https://finmeyo.com
NEXT_PUBLIC_SITE_URL=http://localhost:3100
NEXT_PUBLIC_COOKIE_DOMAIN=
```

Leave the cookie domain empty locally — a `localhost` page cannot write a
cookie for `.finmeyo.com`, and the form still works without it (the lead is
simply recorded as "direct").

Pointing `NEXT_PUBLIC_API_BASE` at production from a laptop is fine for
reading rates. **Submitting the form will create a real lead** and ring the
desk, so use an obvious test name if you do.

Before pushing:

```bash
npm run check      # typecheck, lint, and the content test
```

## How the page is put together

One route, `src/app/page.tsx`. It reads the rates and the contact details on
the server, then hands them to `src/components/LoansPage.tsx`, which renders
the whole page as a single client component — almost everything on it talks to
something else, so splitting it into islands would buy nothing.

| | |
|---|---|
| `src/lib/content.ts` | every word on the page, as one typed object |
| `src/lib/api.ts` | the three calls to the main site, and what to do when they fail |
| `src/lib/rates.ts` | picking the right row out of the rate table |
| `src/app/loans.css` | the whole design, scoped under `.lp-root` |

### Rates are never typed into this repository

Every interest rate on the page is read from `/api/rates`, which the main site
computes from its live lender catalogue. Editing a lender in the console is
what changes the number here.

This is not tidiness. A DSA advertising a rate no lender will honour is a
complaint, and "the landing page was written last March" is not a defence. If
you are about to write a percentage into `content.ts`, don't — add it to the
main site's catalogue instead.

Where no rate can be derived the page says so rather than inventing one: at a
score no lender will write, for a loan against property (quoted on the
property, so the catalogue has no rule for it), and when the main site cannot
be reached.

### The copy

`src/lib/content.ts` is the whole page in one object — headings, FAQ answers,
the area lists, the documents each product needs. Changing wording is a change
to that file and nothing else.

`*asterisks*` in a heading mark the words the design sets in gold.

### Leads

The form posts to the main site's `/api/capture` with `credentials: 'include'`,
so the attribution cookie goes with it and a lead from a paid click is recorded
against that campaign rather than as "direct". That cookie is written for
`.finmeyo.com` — both hosts share it, which is what `NEXT_PUBLIC_COOKIE_DOMAIN`
is for.

A loan against property is filed as a home loan, because the main system prices
three products and LAP is not one of them. The sub-product the visitor actually
chose rides along on the lead (`loanType`), so the desk sees "Loan against
commercial property" and not just "home loan".

## Deploying

A container beside the main site, behind the same reverse proxy.

1. Point an **A record** for `loan.finmeyo.com` at the server.
2. On the **main site**, allow this origin and share the cookie — in its
   `.env.production`:
   ```
   LANDING_ORIGINS=https://loan.finmeyo.com
   NEXT_PUBLIC_COOKIE_DOMAIN=.finmeyo.com
   LOANS_SITE_URL=https://loan.finmeyo.com
   ```
   then redeploy it. Until this is done the form here cannot submit.
3. Clone this repository on the server, copy `.env.production.example` to
   `.env` and set `PROXY_NETWORK` to the Docker network the proxy is on.
4. Add `Caddyfile.snippet` to the proxy's Caddyfile.
5. `./deploy.sh`

`deploy.sh` checks step 2 before it builds, so a missed origin fails the deploy
instead of producing a page whose form silently does nothing.

`finmeyo.com/loans` permanently redirects here.

## Giving somebody access

Add them as a collaborator on this repository. They get the page, the copy and
the design — and no route to the customer database, the console or the server.
If they need to see leads, that is an account on the main site's console with
whatever role fits, which is a separate decision from this repository.
