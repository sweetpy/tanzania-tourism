# Boker custom-domain edge

The existing `boker-adventure` Railway service runs this small public proxy.
It serves the combined Next.js website from the Tanzania Tourism service at the
Boker domain. Itinerary operations retain the existing Pin backend; normal
traveller and trade submissions retain the Tanzania Tourism backend and volume.

Only explicit public routes are exposed. Browser cookies, authorization and
untrusted forwarding headers are not passed to either application. Next.js RSC
navigation headers, static assets and image optimization remain supported.

Deploy the Next.js site and verify it before deploying this directory with
`railway up deployment/boker-edge --path-as-root` using the existing Boker service.
No database or domain changes are needed. `GET /health` identifies version 2.

The Pin API's existing rate limits still apply. They count proxy egress addresses,
including the pre-existing shared limit of five itinerary enquiries per hour.
Changing that safely requires authenticated visitor identity between the gateway
and Pin; arbitrary forwarded client-IP headers are deliberately not trusted here.
