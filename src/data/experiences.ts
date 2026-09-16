export type Experience = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string[];
  highlights: string[];
  idealFor: string;
  image: string;
  imageAlt: string;
};

export const experiences: Experience[] = [
  {
    slug: "safari",
    name: "Safari Adventures",
    tagline: "Migration plains, crater floors, quiet Ruaha mornings — timed to season.",
    summary:
      "Classic and custom safari itineraries across Tanzania’s northern and southern circuits — from Great Migration drama to quiet Ruaha mornings.",
    description: [
      "A Tanzania safari can mean dawn game drives in the Serengeti, crater floor exploration at Ngorongoro, or walking safaris in the south. We design private and small-group journeys around your pace, interests, and travel season.",
      "Expect professional guides, carefully chosen lodges and tented camps, and logistics that let you focus on wildlife — not schedules. Options include balloon safaris, night drives where permitted, and cultural visits with Maasai communities.",
    ],
    highlights: [
      "Northern Circuit classics or wild southern parks",
      "Private or small-group vehicles",
      "Lodge, tented camp, and mobile options",
      "Balloon safaris and specialist guides available",
    ],
    idealFor: "First-time visitors, families, photographers, and return safari travellers",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80",
    imageAlt: "Safari vehicle on dusty track watching wildlife on the savannah",
  },
  {
    slug: "beach-islands",
    name: "Beach & Islands",
    tagline: "Stone Town alleys, Nungwi light, reef days after the bush.",
    summary:
      "Unwind on Zanzibar’s beaches, explore Stone Town, snorkel reefs, and sail traditional dhows after your safari.",
    description: [
      "Pairing safari with Zanzibar is Tanzania’s signature rhythm: bush days followed by ocean rest. Choose lively north-coast beaches or quieter east-coast villages, boutique resorts or simple beach bungalows.",
      "Beyond the sand, dive or snorkel around Mnemba and Pemba, tour spice plantations, and wander Stone Town’s historic lanes. We match beach stays to your safari dates and flight connections.",
    ],
    highlights: [
      "Unguja and Pemba beach stays",
      "Stone Town and spice tours",
      "Snorkelling, diving, and dhow sailing",
      "Seamless safari-to-beach connections",
    ],
    idealFor: "Couples, honeymooners, families, and post-safari relaxation",
    image:
      "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1600&q=80",
    imageAlt: "Palm-lined white sand beach meeting clear turquoise Indian Ocean water",
  },
  {
    slug: "mountain-climbing",
    name: "Mountain Climbing",
    tagline: "Uhuru Peak at 5,895 m — rainforest to alpine desert on Lemosho or Machame.",
    summary:
      "Guided Kilimanjaro climbs with strong acclimatisation profiles, ethical porter treatment, and post-summit safari options.",
    description: [
      "Climbing Kilimanjaro is a non-technical but demanding high-altitude trek. We recommend 7–8 day routes for better summit success and safer acclimatisation, with experienced mountain crews and quality gear.",
      "Routes include Machame, Lemosho, Rongai, and others depending on season and group size. After the climb, many travellers add a short northern safari or fly to Zanzibar to recover by the sea.",
    ],
    highlights: [
      "7–8 day acclimatisation-focused itineraries",
      "Machame, Lemosho, Rongai and more",
      "Ethical guiding and porter standards",
      "Optional safari or beach add-ons",
    ],
    idealFor: "Fit travellers seeking a bucket-list summit challenge",
    image:
      "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1600&q=80",
    imageAlt: "Trekkers approaching high alpine slopes of Mount Kilimanjaro",
  },
  {
    slug: "cultural",
    name: "Cultural Experiences",
    tagline: "Maasai highlands and Swahili coast — woven in with fair, consented visits.",
    summary:
      "Maasai and Hadzabe encounters, Swahili coastal culture, village visits, and market days — woven thoughtfully into your itinerary.",
    description: [
      "Tanzania’s wildlife is only half the story. Thoughtfully arranged cultural experiences introduce Maasai pastoral life, Hadzabe hunter-gatherer traditions around Lake Eyasi, and Swahili coastal heritage in Stone Town and Bagamoyo.",
      "We prioritise community-led visits that respect dignity and compensate hosts fairly — never staged spectacle. These moments often become travellers’ most memorable days.",
    ],
    highlights: [
      "Maasai and Hadzabe community visits",
      "Stone Town heritage walks",
      "Local markets and Swahili cuisine",
      "Community-led, respectfully guided encounters",
    ],
    idealFor: "Curious travellers wanting deeper connection beyond wildlife",
    image:
      "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&q=80",
    imageAlt: "Colourful market scene with textiles and local vendors in East Africa",
  },
];

export function getExperience(slug: string) {
  return experiences.find((e) => e.slug === slug);
}
