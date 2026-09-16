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
    tagline: "Short-grass light. Herds on the move. Predators that wait.",
    summary:
      "Africa’s most iconic savannah — home to the Great Migration and some of the finest predator viewing on Earth.",
    description: [
      "The Serengeti stretches across northern Tanzania in a tapestry of short-grass plains, riverine woodland, and rocky kopjes. It is best known for the Great Migration: more than a million wildebeest, hundreds of thousands of zebra, and accompanying predators moving in a roughly circular annual cycle.",
      "Game drives here feel cinematic. Lions rest on kopjes, cheetahs scan the open flats, and elephants move between waterholes as the light turns amber. Lodges range from classic tented camps to mobile fly-camps that follow the herds.",
      "Whether you visit for calving season on the southern plains or the dramatic river crossings further north, the Serengeti rewards patient travellers who linger for several nights.",
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
    tagline: "Dawn on the rim. One floor. Everything below you.",
    summary:
      "The world’s largest intact volcanic caldera — a dense wildlife haven with black rhinos, flamingos, and Big Five viewing.",
    description: [
      "Ngorongoro Crater sits inside a UNESCO World Heritage conservation area. The crater floor is a self-contained ecosystem of grasslands, forest, and soda lake — often described as a natural amphitheatre of wildlife.",
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
    tagline: "Rainforest to ice. Pole pole to Uhuru.",
    summary:
      "Climb Uhuru Peak through rainforest, moorland, alpine desert, and glacier-capped summit zones.",
    description: [
      "Kilimanjaro rises 5,895 metres above the surrounding plains — a freestanding volcano and Africa’s highest mountain. Routes such as Machame, Lemosho, and Rongai take climbers through distinct ecological zones over 6–8 days.",
      "Success depends more on acclimatisation and pacing than technical climbing skill. Responsible operators emphasise “pole pole” (slowly), experienced guides, and fair treatment of porters.",
      "Whether you summit or simply trek to high camp for the views, Kilimanjaro is a transformative East African adventure that pairs well with a short safari afterward.",
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
    tagline: "Stone Town alleys. Then bare feet in turquoise.",
    summary:
      "Historic Stone Town, spice farms, and powder-white beaches on Unguja and Pemba — the perfect safari add-on.",
    description: [
      "Zanzibar blends Swahili coastal culture with Indian Ocean calm. Stone Town’s carved doors, rooftop cafés, and UNESCO-listed alleys tell centuries of trade history. Outside town, beaches stretch from Nungwi and Kendwa in the north to quieter Paje and Jambiani on the east coast.",
      "Day trips include spice tours, Jozani Forest’s red colobus monkeys, snorkelling around Mnemba, and dhow sailing at sunset. Pemba Island offers a wilder, less-visited alternative for diving and quiet resorts.",
      "Most travellers fly from Arusha or Kilimanjaro after safari — a classic Tanzania combination of bush and beach.",
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
    tagline: "Baobabs. River light. Space enough to hear yourself.",
    summary:
      "Tanzania’s largest national park: baobabs, the Great Ruaha River, and outstanding elephant and predator densities.",
    description: [
      "Ruaha feels remote in the best way. Vast miombo woodland, baobab-dotted ridges, and the life-giving Great Ruaha River support large elephant herds, lions, wild dogs, and prolific birdlife — with far fewer vehicles than the northern parks.",
      "It is ideal for travellers who have done the classic circuit and want something quieter, or for first-timers who prefer space and exclusivity. Fly-in safaris from Dar es Salaam make logistics straightforward.",
      "Combine Ruaha with Nyerere (Selous) or a beach stay for a southern Tanzania itinerary that feels deeply wild.",
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
    tagline: "Tree-climbing lions, flamingos, and groundwater forest.",
    summary:
      "A compact, scenic park between the Rift Valley escarpment and a soda lake — perfect as a northern circuit opener.",
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
      "https://images.unsplash.com/photo-1534177616575-04216ba07832?w=1600&q=80",
    imageAlt:
      "Flamingos wading in shallow alkaline lake water beneath Rift Valley hills",
    featured: false,
  },
];

export function getDestination(slug: string) {
  return destinations.find((d) => d.slug === slug);
}

export function getFeaturedDestinations() {
  return destinations.filter((d) => d.featured);
}
