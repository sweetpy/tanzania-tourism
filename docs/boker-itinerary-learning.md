# Boker itinerary studio and brochure learning

The live /plan journey combines complete prepared programmes with a custom-route fallback. The public corpus contains 20 reviewed brochures, 120 dated programme entries and 40 explicitly labelled planning-budget ranges. The planner never treats those ranges as approved supplier rates or multiplies them into a customer total.

## Learning implementation

`npm run train:itinerary` deterministically builds a pairwise logistic route ranker from document-derived preferences. It learns duration fit, route focus, style match and seasonal relevance from 301 preference pairs. The model and training examples are checked in under `src/data/training/`. A SHA-256 binds the model to the exact curated brochure corpus. The runtime ranks feasible routes, then uses the original daily programme; it does not generate invented day content.

Five brochures are held out from development fitting, including their appearances as negative examples. The 73 held-out preference comparisons all pass. This is a small, document-derived check, not proof of customer satisfaction, general safari expertise or performance on new brochures. No LLM has been fine-tuned. No customer enquiry or private chat enters training. Prices are excluded from features and labels. New reviewed brochures require rerunning training and the behavioural tests before release. A future feedback model requires reviewed customer outcomes and appropriate consent; it is not claimed here.

Geography, the complete seasonal travel window, exact prepared-trip duration and restrictions on strenuous trips with children are hard constraints outside the learned scores. A prepared programme is never compressed or extended to manufacture an exact fit. Unsupported combinations of Eyasi, Natron or Lengai offer relevant prepared journey lengths; supported northern and southern park combinations can use the existing managed Boker preview service.

## Customer experience

The customer chooses dates, party, fee category, circuit, places, comfort and style. Up to three suitable routes become a dated day-by-day workspace. Each overnight stop offers horizontally scrollable accommodation cards with supplier photographs, official credits, a preview dialog, room preferences and a choice to keep a lodge across consecutive nights at the same stop. Returning to a stop later is a separate stay. Properties are regional: central, western, northern Serengeti and Ndutu do not share an indiscriminate lodge list.

The public property catalogue records official page URLs, authentic photo URLs, brief facts and review date. Images remain on supplier infrastructure with a gallery fallback if a supplier removes or blocks them. Known age/operation restrictions exclude unsuitable options; conservative month-level exclusions for Oliver's Camp avoid offering March-May without a dated operation check. Published choices are requests, never inventory or guaranteed room allocations. Every customised plan receives a dated quote, including alternatives or upgrades outside the original brochure assumptions. Budget travellers are offered a request for simpler alternatives rather than silently assigned midrange rates.

Day-specific services include pace, dietary and photography preferences, a balloon enquiry only on a suitable full Serengeti day after an overnight in the same region, and permitted Tarangire night-drive requests when not already included. Balloon options are currently withheld for parties with children until operator eligibility can be reviewed. Flight/transfer days are not advertised as spare full activity days. Included source activities cannot be removed or accidentally repurchased. Customers can add notes for accessibility, occasions or other needs.

Versioned drafts save on the current browser/device, excluding the enquiry contact form. Restoration checks current dates, routes, eligible accommodation, service choices and all day IDs. A tampered or outdated draft must be rebuilt. Printing includes every day, chosen stay, room, services and notes, even when only one day editor is expanded on screen.

## Enquiry integrity

The existing `/api/enquire` endpoint accepts compact trip preferences, route ID and selections. It reconstructs the daily plan from trusted brochure records or refetches the current managed custom-route preview; it does not trust client-written descriptions, hotel URLs or prices. Invalid day/property/service/room combinations are rejected before persistence. Canonical dates, party size, package code, source SHA, model version and complete selections are saved as `craftedItinerary` inside the existing durable lead payload. No new database schema or volume migration is required. Existing provider notification and saved-only receipt behaviour remains honest.

The custom fallback uses `/api/boker/config` and `/api/boker/preview`; submission uses `/api/enquire`, which is already allowed by the production edge. Pin operations code, data and infrastructure remain unchanged. The legacy Boker enquiry endpoint continues to work for prior clients.

## Verification

`npm test` includes learned ranking, training reproducibility, original budgets, all 20 programmes, calendars, complete travel windows, geography, families, property regions, departure nights, service eligibility and canonical server reconstruction. `scripts/verify-itinerary-studio.mjs` verifies desktop/mobile interaction, supplier image loading, lodge previews, consecutive nights, independent-night changes, service choices, notes, draft restoration, print output, package prefill, exact-duration source coverage, rejected tampered submissions and the live custom preview. Enquiry submission is mocked in public UI checks; no real customer lead or notification is sent as QA.
