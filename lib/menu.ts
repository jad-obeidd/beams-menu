// Beams' menu, typed in from their printed PDF menu (4 pages, Oct 2026). Prices in USD.

export type Price = { label?: string; amount: number };

export type Item = {
  id: string;
  name: string;
  prices: Price[];
  note?: string;
  description?: string;
  available?: boolean;
};

export type Art = "cup" | "dripper" | "iced" | "blender" | "bottle" | "croissant" | "cookie" | "sandwich";

export type Section = {
  id: string;
  title: string;
  art: Art;
  items: Item[];
};

const item = (name: string, amount: number, note?: string): Item => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name,
  prices: [{ amount }],
  note,
});

// The printed menu. It seeds the database the first time and is used as-is when no database is set up.
export const defaultSections: Section[] = [
  {
    id: "espresso",
    title: "Espresso",
    art: "cup",
    items: [
      { id: "house-blend", name: "House blend", prices: [{ label: "Single", amount: 1.1 }, { label: "Double", amount: 2 }] },
      { id: "speciality-blend", name: "Speciality blend", prices: [{ label: "Single", amount: 1.9 }, { label: "Double", amount: 2.7 }] },
      item("Single origin", 3),
    ],
  },
  {
    id: "speciality",
    title: "Speciality coffee",
    art: "dripper",
    items: [
      { id: "v60", name: "V60", prices: [{ amount: 5 }, { amount: 6 }, { amount: 8 }], note: "Price depends on the bean" },
      item("Drip coffee", 6.5),
      item("Cold brew", 6),
      item("Moka pot", 5.5),
      item("Syphon", 6.5),
      item("French press", 5),
    ],
  },
  {
    id: "hot",
    title: "Hot drinks",
    art: "cup",
    items: [
      item("Americano", 3),
      item("Macchiato", 3),
      item("Piccolo", 4),
      item("Cortado", 4),
      item("Flat white", 4),
      item("Latte", 4.5),
      item("Spanish latte", 5),
      item("Cappuccino", 4.5),
      item("Mocha", 5),
      item("Matcha latte", 5),
      item("Caramel macchiato", 5),
      item("Hot chocolate", 5),
    ],
  },
  {
    id: "cold",
    title: "Cold drinks",
    art: "iced",
    items: [
      item("Iced Americano", 3.5),
      item("Iced latte", 4.5),
      item("Iced Spanish latte", 5),
      item("Iced caramel macchiato", 5),
      item("Iced mocha", 5),
      item("Iced matcha", 5.5),
    ],
  },
  {
    id: "frappe",
    title: "Frappé",
    art: "blender",
    items: [item("Vanilla frappé", 5), item("Caramel frappé", 5), item("Mocha frappé", 5), item("Toffee coffee frappé", 5)],
  },
  {
    id: "smoothies",
    title: "Smoothies",
    art: "blender",
    items: [item("Mango smoothie", 4.5), item("Strawberry smoothie", 4.5), item("Peach & passion smoothie", 4.5)],
  },
  {
    id: "milkshakes",
    title: "Milkshakes",
    art: "iced",
    items: [
      item("Vanilla milkshake", 4.5),
      item("Chocolate milkshake", 5),
      item("Strawberry milkshake", 4.5),
      item("Mango milkshake", 4.5),
      item("Cookies milkshake", 5),
      item("Tutti frutti milkshake", 4.5),
      item("Lotus milkshake", 5.5),
    ],
  },
  {
    id: "refreshers",
    title: "Refreshers",
    art: "iced",
    items: [item("Hyper kiwi", 4), item("Mango tik", 4), item("Strawberry zaatar", 4.5)],
  },
  {
    id: "iced-tea",
    title: "Iced tea",
    art: "iced",
    items: [item("Peach iced tea", 3.5), item("Passion iced tea", 3.5)],
  },
  {
    id: "juice",
    title: "Fresh juice",
    art: "bottle",
    items: [item("Lemonade", 2.5), item("Orange juice", 2.5), item("Minted lemonade", 3)],
  },
  {
    id: "water",
    title: "Water",
    art: "bottle",
    items: [item("Still water", 1), item("Sparkling water", 2)],
  },
  {
    id: "croissant",
    title: "Croissant",
    art: "croissant",
    items: [
      item("Cheese croissant", 3),
      item("Zaatar croissant", 2.2),
      item("Chocolate croissant", 2.7),
      item("Pain suisse", 3.3),
      item("Coffee filling croissant", 5),
      item("Strawberry jam croissant", 5),
    ],
  },
  {
    id: "sweets",
    title: "Sweets",
    art: "cookie",
    items: [
      item("New York cookie", 3.3),
      item("Double chocolate cookie", 3.3),
      item("Red velvet cookie", 3.3),
      item("Brownie", 4),
      item("Tiramisu", 5.5),
      item("San Sebastián cheesecake", 6.6),
      item("Lemon cake", 3.3),
      item("Homemade muffin", 1.1),
    ],
  },
  {
    id: "sandwiches",
    title: "Sandwiches",
    art: "sandwich",
    items: [item("Turkey & cheese", 5.5), item("Halloumi pesto", 4.1), item("Chicken Caesar", 5)],
  },
  {
    id: "salads",
    title: "Salads",
    art: "sandwich",
    items: [
      item("Chicken Caesar salad", 7),
      item("Halloumi pesto salad", 6.5),
      item("Tuna pasta salad", 7.5),
      item("Seasonal salad", 6),
    ],
  },
];

// The "poster wall": items Beams features on Instagram, framed like the prints on their wall.
// Photos are Beams' own, from @beams_specialtycoffee.
export type Poster = {
  sectionId: string;
  itemId: string;
  title: string;
  notes: string;
  photo: string;
  alt: string;
  badge?: string;
  theme: "orange" | "blue" | "stripes";
};

export const posters: Poster[] = [
  {
    sectionId: "speciality",
    itemId: "cold-brew",
    title: "Cold brew",
    notes: "Colombia · tobacco, caramel, smoky, vanilla",
    photo: "/photos/cold-brew-poster.jpg",
    alt: "A bottle of Beams Colombia cold brew on an orange background",
    theme: "orange",
  },
  {
    sectionId: "cold",
    itemId: "iced-matcha",
    title: "Iced matcha",
    notes: "Or an iced latte, mango tik or coffee toffee",
    photo: "/photos/drinks-tray.jpg",
    alt: "A barista in a Beams apron holding a tray of iced drinks",
    theme: "blue",
  },
  {
    sectionId: "sandwiches",
    itemId: "chicken-caesar",
    title: "Chicken Caesar",
    notes: "Good with an Americano",
    photo: "/photos/sandwich-stripes.jpg",
    alt: "An Americano and a chicken Caesar sandwich on blue and orange stripes",
    theme: "stripes",
  },
];

export const findItem = (sections: Section[], sectionId: string, itemId: string) =>
  sections.find((s) => s.id === sectionId)?.items.find((i) => i.id === itemId);

export type SectionMeta = Omit<Section, "items">;

// Section titles and drawings stay in code; the items inside them live in the database.
export const sectionMetas: SectionMeta[] = defaultSections.map(({ id, title, art }) => ({ id, title, art }));

export const addOns = [
  { name: "Coconut, almond or oat milk", amount: "+$1.00" },
  { name: "Extra shot, speciality", amount: "+$1.70" },
  { name: "Extra shot, house blend", amount: "+$1.10" },
  { name: "Flavour syrup", amount: "+$0.55" },
];

export const shop = {
  name: "Beams Specialty Coffee",
  instagram: "https://www.instagram.com/beams_specialtycoffee/",
  maps: "https://maps.app.goo.gl/skYtmXZ9JMUV6T1M8",
  // The owner's direct "write a review" link from their Google Business Profile.
  review: "https://g.page/r/CXL9Afoku--aEBE/review",
  lat: 34.4261419,
  lng: 35.8291191,
  // OpenStreetMap embed centred on the shop (34.42614, 35.82912): no API key, no tracking.
  mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=35.8249%2C34.4238%2C35.8333%2C34.4285&layer=mapnik",
  address: "Dam w Farz, behind Sahseh, Tripoli",
  hours: "Every day, 7:00 am – 10:00 pm",
  phoneDisplay: "81 357 105",
  whatsapp: "96181357105",
  loyaltyCard: "https://card.beamsspecialtycoffee.com",
};

// Short, standard descriptions of what each drink is. Items without a sure description get none.
const descriptions: Record<string, string> = {
  "single-origin": "One origin, pulled as espresso",
  "drip-coffee": "Filter coffee, brewed in a batch",
  "cold-brew": "Steeped cold for hours, smooth and strong",
  "moka-pot": "Stovetop brewed, strong and rich",
  syphon: "Vacuum brewed, clean and bright",
  "french-press": "Full bodied, steeped in the press",
  americano: "Espresso topped with hot water",
  macchiato: "Espresso marked with a little foam",
  piccolo: "A short shot with warm milk in a small glass",
  cortado: "Espresso cut with the same amount of warm milk",
  "flat-white": "Double shot with thin, silky milk",
  latte: "Espresso with plenty of steamed milk",
  "spanish-latte": "Latte sweetened with condensed milk",
  cappuccino: "Espresso, steamed milk and thick foam",
  mocha: "Espresso, chocolate and steamed milk",
  "matcha-latte": "Matcha whisked into steamed milk",
  "caramel-macchiato": "Vanilla milk, espresso, caramel on top",
  "hot-chocolate": "Chocolate and steamed milk",
  "iced-americano": "Espresso and cold water over ice",
  "iced-latte": "Espresso and cold milk over ice",
  "iced-spanish-latte": "Condensed milk, espresso and ice",
  "iced-caramel-macchiato": "Vanilla milk, espresso, caramel and ice",
  "iced-mocha": "Chocolate, espresso and cold milk over ice",
  "iced-matcha": "Matcha and cold milk over ice",
  "vanilla-frapp": "Blended with ice",
  "caramel-frapp": "Blended with ice",
  "mocha-frapp": "Blended with ice",
  "toffee-coffee-frapp": "Blended with ice",
  "mango-smoothie": "Blended fruit",
  "strawberry-smoothie": "Blended fruit",
  "peach-passion-smoothie": "Blended fruit",
  "minted-lemonade": "Fresh lemon with mint",
  "san-sebasti-n-cheesecake": "Basque burnt cheesecake",
};

for (const section of defaultSections) {
  for (const entry of section.items) entry.description ??= descriptions[entry.id];
}

export const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;
