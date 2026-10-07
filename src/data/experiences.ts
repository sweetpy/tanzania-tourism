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
    tagline:
      "Choose the northern parks or a quieter southern safari, with dates suited to the season.",
    summary:
      "Explore Tanzania’s northern and southern parks on a prepared or custom safari itinerary.",
    description: [
      "A Tanzania safari can mean dawn game drives in the Serengeti, crater floor exploration at Ngorongoro, or walking safaris in the south. We design private and small-group journeys around your pace, interests, and travel season.",
      "Compare lodges and tented camps, with transport and guiding arranged for your route. Optional activities include balloon safaris, permitted night drives and community-led cultural visits.",
    ],
    highlights: [
      "Northern Circuit classics or wild southern parks",
      "Private or small-group vehicles",
      "Lodge, tented camp, and mobile options",
      "Balloon safaris and specialist guides available",
    ],
    idealFor:
      "First-time visitors, families, photographers, and return safari travellers",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80",
    imageAlt: "Safari vehicle on dusty track watching wildlife on the savannah",
  },
  {
    slug: "beach-islands",
    name: "Beach & Islands",
    tagline: "Stone Town, beach stays, snorkelling and dhow trips.",
    summary:
      "Unwind on Zanzibar’s beaches, explore Stone Town, snorkel reefs, and sail traditional dhows after your safari.",
    description: [
      "Add Zanzibar before or after your safari. Choose north-coast beaches or east-coast villages, with accommodation from small beach bungalows to resorts.",
      "Beyond the sand, dive or snorkel around Mnemba and Pemba, tour spice plantations, and wander Stone Town’s historic lanes. We match beach stays to your safari dates and flight connections.",
    ],
    highlights: [
      "Unguja and Pemba beach stays",
      "Stone Town and spice tours",
      "Snorkelling, diving, and dhow sailing",
      "Flight and transfer planning",
    ],
    idealFor: "Couples, honeymooners, families, and post-safari relaxation",
    image:
      "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1600&q=80",
    imageAlt:
      "Palm-lined white sand beach meeting clear turquoise Indian Ocean water",
  },
  {
    slug: "mountain-climbing",
    name: "Mountain Climbing",
    tagline: "Lemosho and Machame routes to Uhuru Peak at 5,895 m.",
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
    idealFor: "Fit travellers planning a guided high-altitude climb",
    image:
      "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1600&q=80",
    imageAlt: "Trekkers approaching high alpine slopes of Mount Kilimanjaro",
  },
  {
    slug: "cultural",
    name: "Cultural Experiences",
    tagline:
      "Community-led visits in the Maasai highlands and on the Swahili coast.",
    summary:
      "Arrange Maasai or Hadzabe visits, explore Swahili coastal history, or join local market and food experiences.",
    description: [
      "Community-led visits introduce Maasai pastoral life, Hadzabe traditions around Lake Eyasi and Swahili history in Stone Town and Bagamoyo.",
      "Visits are arranged with the hosts, with their consent and fair payment. Hosts decide what to share; ask before taking photographs.",
    ],
    highlights: [
      "Maasai and Hadzabe community visits",
      "Stone Town heritage walks",
      "Local markets and Swahili cuisine",
      "Community-led, respectfully guided encounters",
    ],
    idealFor:
      "Travellers interested in local history, food and community-led visits",
    image:
      "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&q=80",
    imageAlt:
      "Colourful market scene with textiles and local vendors in East Africa",
  },
];

export function getExperience(slug: string) {
  return experiences.find((e) => e.slug === slug);
}
