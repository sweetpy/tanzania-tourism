import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  FEATURE_NAMES,
  routeFeatures,
  eligibleExample,
} from "../src/lib/itineraryLearning.ts";

// Git checkouts on Windows may use CRLF; fingerprint the same LF source everywhere.
const raw = (await readFile("src/data/curatedPackages.json", "utf8")).replace(
  /\r\n/g,
  "\n",
);
const corpus = JSON.parse(raw);
// Labels come from each brochure's stated route, duration and journey style.
// They are document-derived examples, not customer behaviour or supplier rates.
const training = [];
for (const target of corpus) {
  for (const month of target.seasonMonths.length
    ? target.seasonMonths
    : [2, 6, 8, 11]) {
    const query = {
      arrivalDate: `2027-${String(month).padStart(2, "0")}-10`,
      days: target.days,
      placeIds: target.destinations,
      style: target.category,
      childAges: [],
    };
    for (const other of corpus) {
      if (other.slug === target.slug || !eligibleExample(other, query))
        continue;
      const positive = routeFeatures(target, query),
        negative = routeFeatures(other, query);
      if (positive.every((value, index) => value === negative[index])) continue;
      training.push({
        positive: target.code,
        negative: other.code,
        query,
        difference: positive.map((value, index) => value - negative[index]),
      });
    }
  }
}
function fit(pairs) {
  const weights = FEATURE_NAMES.map(() => 0);
  for (let epoch = 0; epoch < 2400; epoch++) {
    const gradient = weights.map((value) => 0.003 * value);
    for (const pair of pairs) {
      const score = pair.difference.reduce(
        (sum, value, index) => sum + value * weights[index],
        0,
      );
      const error = 1 / (1 + Math.exp(Math.max(-40, Math.min(40, score))));
      pair.difference.forEach((value, index) => {
        gradient[index] -= (value * error) / pairs.length;
      });
    }
    weights.forEach((value, index) => {
      weights[index] = value - 0.4 * gradient[index];
    });
  }
  return weights;
}
// Group split: no positive example from a held-out brochure participates in fitting.
const heldOutCodes = corpus
  .filter((_, index) => index % 4 === 0)
  .map((pkg) => pkg.code);
const validation = training.filter((pair) =>
  heldOutCodes.includes(pair.positive),
);
const development = training.filter(
  (pair) =>
    !heldOutCodes.includes(pair.positive) &&
    !heldOutCodes.includes(pair.negative),
);
const developmentWeights = fit(development);
const correct = validation.filter(
  (pair) =>
    pair.difference.reduce(
      (sum, value, index) => sum + value * developmentWeights[index],
      0,
    ) > 0,
).length;
const model = {
  version: "brochure-ranker-v1",
  featureNames: FEATURE_NAMES,
  weights: fit(training),
  corpusSha256: createHash("sha256").update(raw).digest("hex"),
  training: {
    documents: corpus.length,
    pairs: training.length,
    method:
      "Pairwise logistic learning from document-derived route preferences; L2 regularization",
  },
  evaluation: {
    heldOutBrochures: heldOutCodes,
    pairs: validation.length,
    correct,
    pairwiseAccuracy: validation.length ? correct / validation.length : null,
    limitation:
      "Document-derived validation, not a measure of real customer satisfaction. No LLM fine-tuning or pricing learning.",
  },
};
await mkdir("src/data/training", { recursive: true });
await writeFile(
  "src/data/training/itinerary-ranker.json",
  JSON.stringify(model, null, 2) + "\n",
);
await writeFile(
  "src/data/training/route-preferences.json",
  JSON.stringify(training, null, 2) + "\n",
);
console.log(JSON.stringify(model, null, 2));
