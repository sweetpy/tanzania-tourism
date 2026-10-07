# Boker group departure calendar

The public calendar is `/groups`. The private team desk is `/groups/desk`.

## Prepared calendar

The database receives a rolling twelve-month calendar of proposed dates. It includes day hikes and nature walks, safari weekends, a monthly northern safari, community outings, seasonal Boker outings, and Meru, Machame and Lemosho climbs. Kilimanjaro routes have separate arrival and departure days; Meru has arrival and return hotel nights. Brochure programmes supply the relevant safari and day-trip content. Mountain programmes are prepared outlines for operator review.

New dates are inserted without overwriting team edits. Proposed dates collect early interest. They are not confirmed operational departures. Private-party brochure estimates never become group joining prices.

## Publish and sell a departure

1. Sign in with the server-configured team access code. Access is a twelve-hour, signed, HttpOnly cookie. Keep the code private and rotate `BOKER_GROUP_ADMIN_SECRET` if access changes.
2. Review the prepared programme, dates, meeting arrangements, suitability, suppliers and services. Confirm park/route permissions, guide availability, transport, rooms or camping arrangements before opening.
3. Enter the approved adult price and its native currency, capacity, minimum group target, request deadline, services, supplements and booking terms. TZS values remain whole shillings; USD values use cents internally. Resident permits, children, room sharing and additions need the party's exact quote.
4. Choose Open for requests or Departure confirmed after the operational checks. A confirmed departure still requires a separate confirmed booking for each party. Share its public trip link and calendar download for marketing.
5. Review registrations in the desk. Contact the traveller using their submitted details. Create an exact total party offer with services, verified invoice instructions, deadline and cancellation terms. An offer holds the party's places for up to 48 hours, or until departure begins.
6. The traveller accepts on their private trip page. Verify payment or the agreed booking authorisation independently, record the reference, then confirm in the desk. This feature does not charge a card, post accounting entries or issue refunds.

Interest and requests do not hold inventory. Concurrent offers lock the departure row, preventing overselling. Expired offers release their holds and appear waitlisted. Confirmed bookings and pending cancellation requests retain inventory until the team resolves cancellation. Refund decisions follow the written terms.

## Traveller experience

The calendar supports month and upcoming views, trip and town filters, weekend trips, search, and a local shortlist containing departure IDs only. A trip page has the programme, preparation, meeting arrangements, status, price qualification and registration form. Registration returns a reference and private link. The secret stays in the URL fragment and session storage, is sent as a bearer header, and is stored only as a hash in PostgreSQL.

The private page shows current status, written offers, acceptance, preparation and cancellation controls. Customers can withdraw optional marketing consent. Lost links can be replaced by the team after verifying the contact; replacement revokes the old secret. Do not put private links in public marketing posts.

Registration is persisted before a best-effort team notification through the existing notification provider. The desk is the authoritative inbox. Offer and confirmation actions do not send customer email; the team follows up through the submitted contact details. Exported CSV includes explicit marketing consent and escapes formula-like input. The desk and export show the latest 5,000 requests.

## Storage and deployment

`BOKER_GROUP_DATABASE_URL` can designate a dedicated PostgreSQL service; otherwise the existing `DATABASE_URL` is used. All new records use `boker_group_` tables, with no changes to legacy traveller records. Tables cover departures, registrations, action audits and rate limits. Preserve these tables in normal database backups. The app seeds new proposed dates on daily access without modifying existing departures.

`BOKER_GROUP_ADMIN_SECRET` must be a random server-only value of at least 32 characters. Never place it in a public variable or commit it. Production private pages and team routes are excluded from indexing. No contact information appears in the public API or sitemap.

Individual and whole-calendar ICS files use stable event IDs and mark proposed dates tentative. Customers should revisit the trip page for current arrangements; importing a downloaded file does not automatically subscribe them to updates. Public sharing uses a departure's image, dates and programme.

Real regional photographs are hosted with attribution and licence links at `/groups/credits`. They do not guarantee particular wildlife sightings or identify booked accommodation.

## Verification

Run `npm test` for the catalogue, planner, calendar policy and security tests. The database integration suite runs only when `BOKER_GROUP_TEST_DATABASE_URL` is supplied and refuses any target except its isolated loopback test cluster. `scripts/verify-groups.mjs` covers mobile layout, filters, saved trips, calendar files and enrolment. Locally it also verifies the full team offer, customer acceptance, manual confirmation and cancellation flow. Public verification mocks registration submission and creates no public leads or payments.
