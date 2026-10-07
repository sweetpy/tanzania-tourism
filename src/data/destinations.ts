export type Destination = {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  summary: string;
  description: string[];
  highlights: string[];
  bestTime: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
};

export const destinations: Destination[] = [
  {
    slug: "serengeti",
    name: "Serengeti National Park",
    region: "Northern Circuit",
    tagline:
      "Visit the southern calving areas or northern migration routes in season.",
    summary:
      "See the Great Migration and look for lions, cheetahs and leopards across the Serengeti plains.",
    description: [
      "The Serengeti stretches across northern Tanzania, with open plains, riverine woodland and rocky kopjes. Its annual migration includes more than a million wildebeest and hundreds of thousands of zebra, followed by predators.",
      "Game drives explore the plains and kopjes, looking for lions, cheetahs, elephants and other wildlife. Accommodation includes permanent lodges, tented camps and seasonal camps near the migration areas.",
      "Allow several nights to explore. The southern plains suit calving-season visits, while the northern areas are known for river crossings in season. Wildlife movements and sightings vary.",
    ],
    highlights: [
      "Great Migration wildebeest and zebra herds",
      "Exceptional lion, cheetah, and leopard sightings",
      "Hot-air balloon safaris at sunrise",
      "Kopjes and endless short-grass plains",
    ],
    bestTime: "Year-round; Dec–Mar for calving, Jul–Oct for river crossings",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80",
    imageAlt:
      "Herd of wildebeest crossing open golden savannah plains in the Serengeti",
    featured: true,
  },
  {
    slug: "ngorongoro",
    name: "Ngorongoro Crater",
    region: "Northern Circuit",
    tagline: "Explore the crater floor on a guided game drive.",
    summary:
      "A volcanic crater with grasslands, forest and a soda lake, home to black rhinos, flamingos and other wildlife.",
    description: [
      "Ngorongoro Crater lies within a UNESCO World Heritage conservation area. Game drives explore its grasslands, forest and soda lake.",
      "A single day on the crater floor can deliver elephants, lions, buffalo, hippos, and the rare chance of spotting black rhino. Maasai communities live in the surrounding highlands, and cultural visits add depth to a classic safari itinerary.",
      "Most travellers combine Ngorongoro with the Serengeti or Lake Manyara, staying on the crater rim for sweeping views at dawn and dusk.",
    ],
    highlights: [
      "Big Five viewing in a compact crater floor",
      "Black rhino and flamingo sightings",
      "Crater-rim lodges with dramatic views",
      "Maasai cultural encounters nearby",
    ],
    bestTime: "Jun–Oct dry season; year-round wildlife",
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80",
    imageAlt:
      "Misty green rim and floor of Ngorongoro Crater under soft morning light",
    featured: true,
  },
  {
    slug: "kilimanjaro",
    name: "Mount Kilimanjaro",
    region: "Northern Tanzania",
    tagline:
      "Walk through rainforest, moorland and alpine desert towards Uhuru Peak.",
    summary:
      "Climb Uhuru Peak through rainforest, moorland, alpine desert, and glacier-capped summit zones.",
    description: [
      "Uhuru Peak reaches 5,895 metres above sea level on Kilimanjaro, Africa’s highest mountain. Routes such as Machame, Lemosho and Rongai cross rainforest, moorland and alpine desert over 6–8 days.",
      "Success depends more on acclimatisation and pacing than technical climbing skill. Responsible operators emphasise “pole pole” (slowly), experienced guides, and fair treatment of porters.",
      "Choose a full climb or a separately arranged day hike that suits your fitness and experience. A short safari can follow the climb, with time to rest first.",
    ],
    highlights: [
      "Uhuru Peak at 5,895 m",
      "Multiple scenic routes (Machame, Lemosho, Rongai)",
      "Rainforest to alpine desert landscapes",
      "Guided climbs with acclimatisation focus",
    ],
    bestTime: "Jan–Mar and Jun–Oct (drier windows)",
    image:
      "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1600&q=80",
    imageAlt:
      "Snow-capped summit of Mount Kilimanjaro rising above clouds at sunrise",
    featured: true,
  },
  {
    slug: "zanzibar",
    name: "Zanzibar Archipelago",
    region: "Indian Ocean Coast",
    tagline: "Explore Stone Town and spend time on Zanzibar’s beaches.",
    summary:
      "Visit Stone Town, spice farms and beaches on Unguja or Pemba, on their own or after a safari.",
    description: [
      "Stone Town’s carved doors, cafés and narrow streets reflect Zanzibar’s Swahili and trading history. Beach stays range from Nungwi and Kendwa in the north to Paje and Jambiani on the east coast.",
      "Day trips include spice tours, Jozani Forest’s red colobus monkeys, snorkelling around Mnemba, and dhow sailing at sunset. Pemba Island offers a wilder, less-visited alternative for diving and quiet resorts.",
      "Travellers often fly to Zanzibar from Arusha or Kilimanjaro after safari. Confirm flight connections when planning your itinerary.",
    ],
    highlights: [
      "Stone Town heritage walks",
      "White-sand beaches and turquoise water",
      "Spice farms and Swahili cuisine",
      "Snorkelling, diving, and dhow sails",
    ],
    bestTime: "Jun–Oct and Dec–Feb; warmer seas year-round",
    image:
      "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1600&q=80",
    imageAlt:
      "Turquoise Indian Ocean water and white sand beach on Zanzibar island",
    featured: true,
  },
  {
    slug: "ruaha",
    name: "Ruaha National Park",
    region: "Southern Circuit",
    tagline:
      "Explore baobab woodland and wildlife along the Great Ruaha River.",
    summary:
      "A southern Tanzania park known for baobabs, the Great Ruaha River, elephants and predators.",
    description: [
      "Ruaha’s miombo woodland, baobab ridges and river habitats support elephants, lions, wild dogs and many bird species. It generally has fewer safari vehicles than the popular northern parks.",
      "It is ideal for travellers who have done the classic circuit and want something quieter, or for first-timers who prefer space and exclusivity. Fly-in safaris from Dar es Salaam make logistics straightforward.",
      "Combine Ruaha with Nyerere or a beach stay, allowing time for the flight or road connections.",
    ],
    highlights: [
      "Large elephant herds and predators",
      "Baobab landscapes and riverine game drives",
      "Low visitor density and intimate camps",
      "Excellent birding and walking safari options",
    ],
    bestTime: "Jun–Oct dry season for concentrated wildlife",
    image:
      "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1600&q=80",
    imageAlt:
      "African elephants walking near baobab trees in a dry southern Tanzania landscape",
    featured: false,
  },
  {
    slug: "lake-manyara",
    name: "Lake Manyara National Park",
    region: "Northern Circuit",
    tagline:
      "Forest, lake shores and Rift Valley views on a northern safari route.",
    summary:
      "A compact park with groundwater forest and lake shores below the Rift Valley escarpment. It can be combined with Ngorongoro or Serengeti.",
    description: [
      "Lake Manyara packs variety into a small area: groundwater forest alive with baboons and blue monkeys, open floodplains, and alkaline lake shores that attract flamingos when water levels are right.",
      "Famous for its tree-climbing lions and large elephant herds, Manyara is often visited on the way to Ngorongoro or the Serengeti. A night at a lodge on the escarpment offers sweeping Rift Valley views.",
      "It is also a strong choice for travellers short on time who still want a classic Tanzania savannah experience.",
    ],
    highlights: [
      "Tree-climbing lions (when present)",
      "Flamingos and prolific birdlife",
      "Groundwater forest and escarpment views",
      "Easy gateway to Ngorongoro and Serengeti",
    ],
    bestTime: "Jun–Oct; flamingos depend on water levels",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Lake_Manyara.jpg/1280px-Lake_Manyara.jpg",
    imageAlt:
      "Lake Manyara and its forest seen from the Great Rift Valley escarpment",
    featured: false,
  },
];

export function getDestination(slug: string) {
  return destinations.find((d) => d.slug === slug);
}

export function getFeaturedDestinations() {
  return destinations.filter((d) => d.featured);
}
