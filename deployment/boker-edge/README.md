# Boker custom-domain edge

The existing `boker-adventure` Railway service runs this small public proxy.
It serves the combined Next.js website from the Tanzania Tourism service at the
Boker domain. Itinerary operations retain the existing Pin backend; normal
traveller and trade submissions retain the Tanzania Tourism backend and volume.

Only explicit website and group-booking routes are exposed. The dedicated group
API receives only its own signed `boker_group_team` cookie and matching private
capability bearer header. Other cookies, Pin credentials and untrusted forwarding
headers are never passed to either application. Group-origin checks run at the
edge before the upstream origin is rewritten for its independent check. Only
the group session cookie is returned to the browser. Next.js RSC navigation,
image optimization, licensed group photographs, sitemap and robots remain supported.

Deploy the Next.js site and verify it before deploying this directory with
`railway up deployment/boker-edge --path-as-root` using the existing Boker service.
No database or domain changes are needed. `GET /health` identifies version 3.

The Pin API's existing rate limits still apply. They count proxy egress addresses,
including the pre-existing shared limit of five itinerary enquiries per hour.
Changing that safely requires authenticated visitor identity between the gateway
and Pin; arbitrary forwarded client-IP headers are deliberately not trusted here.
