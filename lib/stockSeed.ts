// Beams' stock list, generated from their "beams depot checklist.xlsx" (Nov 2026).
// It fills the stock_items table the first time; after that the list is edited on /stock.
import type { SeedItem } from "./stock";

export const stockSeed: SeedItem[] = [
  {
    "id": "beans-speciality-blend",
    "section": "beans",
    "grp": null,
    "name": "Speciality blend",
    "unit": "kg",
    "target": 10,
    "position": 10
  },
  {
    "id": "beans-uganda",
    "section": "beans",
    "grp": null,
    "name": "Uganda",
    "unit": "kg",
    "target": 5,
    "position": 20
  },
  {
    "id": "beans-colombian-fermented-passion",
    "section": "beans",
    "grp": null,
    "name": "Colombian fermented passion",
    "unit": "kg",
    "target": 1,
    "position": 30
  },
  {
    "id": "beans-colombian-fermented-mango",
    "section": "beans",
    "grp": null,
    "name": "Colombian fermented mango",
    "unit": "kg",
    "target": 1,
    "position": 40
  },
  {
    "id": "beans-colombian-fermented-kumquat",
    "section": "beans",
    "grp": null,
    "name": "Colombian fermented kumquat",
    "unit": "kg",
    "target": 1,
    "position": 50
  },
  {
    "id": "beans-ethiopian",
    "section": "beans",
    "grp": null,
    "name": "Ethiopian",
    "unit": "kg",
    "target": 1,
    "position": 60
  },
  {
    "id": "beans-indonesia",
    "section": "beans",
    "grp": null,
    "name": "Indonesia",
    "unit": "kg",
    "target": 1,
    "position": 70
  },
  {
    "id": "beans-peru",
    "section": "beans",
    "grp": null,
    "name": "Peru",
    "unit": "kg",
    "target": 1,
    "position": 80
  },
  {
    "id": "beans-png",
    "section": "beans",
    "grp": null,
    "name": "PNG",
    "unit": "kg",
    "target": 1,
    "position": 90
  },
  {
    "id": "fresh-ice",
    "section": "fresh",
    "grp": null,
    "name": "Ice",
    "unit": "kg",
    "target": 60,
    "position": 10
  },
  {
    "id": "fresh-fresh-orange-juice",
    "section": "fresh",
    "grp": null,
    "name": "Fresh orange juice",
    "unit": "bottles",
    "target": 4,
    "position": 20
  },
  {
    "id": "fresh-fresh-lemonade",
    "section": "fresh",
    "grp": null,
    "name": "Fresh lemonade",
    "unit": "bottles",
    "target": 2,
    "position": 30
  },
  {
    "id": "fresh-double-chocolate-cookie",
    "section": "fresh",
    "grp": null,
    "name": "Double chocolate cookie",
    "unit": "pcs",
    "target": 3,
    "position": 40
  },
  {
    "id": "fresh-new-york-cookie",
    "section": "fresh",
    "grp": null,
    "name": "New York cookie",
    "unit": "pcs",
    "target": 3,
    "position": 50
  },
  {
    "id": "fresh-red-velvet-cookie",
    "section": "fresh",
    "grp": null,
    "name": "Red velvet cookie",
    "unit": "pcs",
    "target": 3,
    "position": 60
  },
  {
    "id": "fresh-brownies",
    "section": "fresh",
    "grp": null,
    "name": "Brownies",
    "unit": "pcs",
    "target": 3,
    "position": 70
  },
  {
    "id": "fresh-lamington",
    "section": "fresh",
    "grp": null,
    "name": "Lamington",
    "unit": "pcs",
    "target": 3,
    "position": 80
  },
  {
    "id": "fresh-carrot-cake",
    "section": "fresh",
    "grp": null,
    "name": "Carrot cake",
    "unit": "pcs",
    "target": 3,
    "position": 90
  },
  {
    "id": "fresh-candia-fresh-milk",
    "section": "fresh",
    "grp": null,
    "name": "Candia fresh milk",
    "unit": null,
    "target": 6,
    "position": 100
  },
  {
    "id": "fresh-candia-lactose-free",
    "section": "fresh",
    "grp": null,
    "name": "Candia lactose free",
    "unit": null,
    "target": 6,
    "position": 110
  },
  {
    "id": "fresh-nadek-full-fat",
    "section": "fresh",
    "grp": null,
    "name": "Nadek full fat",
    "unit": null,
    "target": 6,
    "position": 120
  },
  {
    "id": "fresh-nadek-skimmed",
    "section": "fresh",
    "grp": null,
    "name": "Nadek skimmed",
    "unit": null,
    "target": 6,
    "position": 130
  },
  {
    "id": "fresh-almond-alpro",
    "section": "fresh",
    "grp": null,
    "name": "Almond Alpro",
    "unit": null,
    "target": 6,
    "position": 140
  },
  {
    "id": "fresh-coconut-alpro",
    "section": "fresh",
    "grp": null,
    "name": "Coconut Alpro",
    "unit": null,
    "target": 6,
    "position": 150
  },
  {
    "id": "fresh-oat-alpro",
    "section": "fresh",
    "grp": null,
    "name": "Oat Alpro",
    "unit": null,
    "target": 6,
    "position": 160
  },
  {
    "id": "syrups-syrups-vanilla-syrup-caprice",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Vanilla syrup (Caprice)",
    "unit": "packs",
    "target": 6,
    "position": 10
  },
  {
    "id": "syrups-syrups-vanilla-syrup-0-caprice",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Vanilla syrup 0% (Caprice)",
    "unit": "packs",
    "target": 6,
    "position": 20
  },
  {
    "id": "syrups-syrups-caramel-syrup-monin",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Caramel syrup (Monin)",
    "unit": "packs",
    "target": 6,
    "position": 30
  },
  {
    "id": "syrups-syrups-caramel-syrup-0-monin",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Caramel syrup 0% (Monin)",
    "unit": "packs",
    "target": 6,
    "position": 40
  },
  {
    "id": "syrups-syrups-salted-caramel-syrup",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Salted caramel syrup",
    "unit": "packs",
    "target": 6,
    "position": 50
  },
  {
    "id": "syrups-syrups-chocolate-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Chocolate syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 60
  },
  {
    "id": "syrups-syrups-toffee-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Toffee syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 70
  },
  {
    "id": "syrups-syrups-biscuit-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Biscuit syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 80
  },
  {
    "id": "syrups-syrups-passion-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Passion syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 90
  },
  {
    "id": "syrups-syrups-strawberry-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Strawberry syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 100
  },
  {
    "id": "syrups-syrups-kiwi-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Kiwi syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 110
  },
  {
    "id": "syrups-syrups-blue-curacao-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Blue curaçao syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 120
  },
  {
    "id": "syrups-syrups-mango-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Mango syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 130
  },
  {
    "id": "syrups-syrups-lime-syrup-flair",
    "section": "syrups",
    "grp": "Syrups",
    "name": "Lime syrup (Flair)",
    "unit": "packs",
    "target": 6,
    "position": 140
  },
  {
    "id": "syrups-sauces-chocolate-flair",
    "section": "syrups",
    "grp": "Sauces",
    "name": "Chocolate (Flair)",
    "unit": "packs",
    "target": 4,
    "position": 150
  },
  {
    "id": "syrups-sauces-white-chocolate-flair",
    "section": "syrups",
    "grp": "Sauces",
    "name": "White chocolate (Flair)",
    "unit": "kg",
    "target": 1,
    "position": 160
  },
  {
    "id": "syrups-sauces-caramel-monin",
    "section": "syrups",
    "grp": "Sauces",
    "name": "Caramel (Monin)",
    "unit": "bags",
    "target": 10,
    "position": 170
  },
  {
    "id": "syrups-sauces-salted-caramel-monin",
    "section": "syrups",
    "grp": "Sauces",
    "name": "Salted caramel (Monin)",
    "unit": "packs",
    "target": 6,
    "position": 180
  },
  {
    "id": "syrups-sauces-condensed-milk",
    "section": "syrups",
    "grp": "Sauces",
    "name": "Condensed milk",
    "unit": "packs",
    "target": 6,
    "position": 190
  },
  {
    "id": "syrups-sauces-puck-cream",
    "section": "syrups",
    "grp": "Sauces",
    "name": "Puck cream",
    "unit": "packs",
    "target": 0.5,
    "position": 200
  },
  {
    "id": "syrups-sauces-lotus-spread",
    "section": "syrups",
    "grp": "Sauces",
    "name": "Lotus spread",
    "unit": "gallon",
    "target": 0.5,
    "position": 210
  },
  {
    "id": "syrups-pur-e-strawberry",
    "section": "syrups",
    "grp": "Purée",
    "name": "Strawberry",
    "unit": "pcs",
    "target": 5,
    "position": 220
  },
  {
    "id": "syrups-pur-e-mango",
    "section": "syrups",
    "grp": "Purée",
    "name": "Mango",
    "unit": "pcs",
    "target": 5,
    "position": 230
  },
  {
    "id": "syrups-pur-e-peach",
    "section": "syrups",
    "grp": "Purée",
    "name": "Peach",
    "unit": "pcs",
    "target": 5,
    "position": 240
  },
  {
    "id": "syrups-pur-e-passion",
    "section": "syrups",
    "grp": "Purée",
    "name": "Passion",
    "unit": "pcs",
    "target": 5,
    "position": 250
  },
  {
    "id": "syrups-pur-e-green-apple",
    "section": "syrups",
    "grp": "Purée",
    "name": "Green apple",
    "unit": "pcs",
    "target": 5,
    "position": 260
  },
  {
    "id": "syrups-iced-tea-lemon",
    "section": "syrups",
    "grp": "Iced tea",
    "name": "Lemon",
    "unit": null,
    "target": 1,
    "position": 270
  },
  {
    "id": "syrups-iced-tea-lemon-0",
    "section": "syrups",
    "grp": "Iced tea",
    "name": "Lemon 0%",
    "unit": null,
    "target": 1,
    "position": 280
  },
  {
    "id": "syrups-iced-tea-peach",
    "section": "syrups",
    "grp": "Iced tea",
    "name": "Peach",
    "unit": null,
    "target": 1,
    "position": 290
  },
  {
    "id": "syrups-iced-tea-peach-0",
    "section": "syrups",
    "grp": "Iced tea",
    "name": "Peach 0%",
    "unit": null,
    "target": 1,
    "position": 300
  },
  {
    "id": "paper-cups-hot-9-oz",
    "section": "paper",
    "grp": null,
    "name": "Cups hot 9 oz",
    "unit": "packs",
    "target": 6,
    "position": 10
  },
  {
    "id": "paper-cover-9-oz",
    "section": "paper",
    "grp": null,
    "name": "Cover 9 oz",
    "unit": "packs",
    "target": 6,
    "position": 20
  },
  {
    "id": "paper-cups-hot-4-oz",
    "section": "paper",
    "grp": null,
    "name": "Cups hot 4 oz",
    "unit": "packs",
    "target": 6,
    "position": 30
  },
  {
    "id": "paper-cover-4-oz",
    "section": "paper",
    "grp": null,
    "name": "Cover 4 oz",
    "unit": "packs",
    "target": 6,
    "position": 40
  },
  {
    "id": "paper-plastic-cups-400cc",
    "section": "paper",
    "grp": null,
    "name": "Plastic cups 400cc",
    "unit": "packs",
    "target": 10,
    "position": 50
  },
  {
    "id": "paper-cover-400-cc",
    "section": "paper",
    "grp": null,
    "name": "Cover 400 cc",
    "unit": "packs",
    "target": 10,
    "position": 60
  },
  {
    "id": "paper-cans-350cc",
    "section": "paper",
    "grp": null,
    "name": "Cans 350cc",
    "unit": "packs",
    "target": 1,
    "position": 70
  },
  {
    "id": "paper-croissant-bags",
    "section": "paper",
    "grp": null,
    "name": "Croissant bags",
    "unit": "bags",
    "target": 30,
    "position": 80
  },
  {
    "id": "paper-cup-holder",
    "section": "paper",
    "grp": null,
    "name": "Cup holder",
    "unit": "packs",
    "target": 0.5,
    "position": 90
  },
  {
    "id": "paper-craft-box-15x15",
    "section": "paper",
    "grp": null,
    "name": "Craft box 15x15",
    "unit": "packs",
    "target": 0.5,
    "position": 100
  },
  {
    "id": "paper-straw-cold",
    "section": "paper",
    "grp": null,
    "name": "Straw cold",
    "unit": "packs",
    "target": 4,
    "position": 110
  },
  {
    "id": "paper-straw-hot",
    "section": "paper",
    "grp": null,
    "name": "Straw hot",
    "unit": "packs",
    "target": 2,
    "position": 120
  },
  {
    "id": "paper-wooden-sticks",
    "section": "paper",
    "grp": null,
    "name": "Wooden sticks",
    "unit": "packs",
    "target": 2,
    "position": 130
  },
  {
    "id": "paper-plastic-spoon-small",
    "section": "paper",
    "grp": null,
    "name": "Plastic spoon small",
    "unit": "packs",
    "target": 2,
    "position": 140
  },
  {
    "id": "paper-gloves",
    "section": "paper",
    "grp": null,
    "name": "Gloves",
    "unit": "packs",
    "target": 4,
    "position": 150
  },
  {
    "id": "paper-bags-for-delivery",
    "section": "paper",
    "grp": null,
    "name": "Bags for delivery",
    "unit": "kg",
    "target": 1,
    "position": 160
  },
  {
    "id": "paper-rubbish-bags",
    "section": "paper",
    "grp": null,
    "name": "Rubbish bags",
    "unit": "bags",
    "target": 10,
    "position": 170
  },
  {
    "id": "paper-tissue-for-toilet",
    "section": "paper",
    "grp": null,
    "name": "Tissue for toilet",
    "unit": "packs",
    "target": 6,
    "position": 180
  },
  {
    "id": "paper-napkins-small",
    "section": "paper",
    "grp": null,
    "name": "Napkins small",
    "unit": "packs",
    "target": 6,
    "position": 190
  },
  {
    "id": "paper-wet-wipes",
    "section": "paper",
    "grp": null,
    "name": "Wet wipes",
    "unit": "packs",
    "target": 0.5,
    "position": 200
  },
  {
    "id": "paper-hand-soap",
    "section": "paper",
    "grp": null,
    "name": "Hand soap",
    "unit": "gallon",
    "target": 0.5,
    "position": 210
  },
  {
    "id": "paper-dish-washing-soap",
    "section": "paper",
    "grp": null,
    "name": "Dish washing soap",
    "unit": "gallon",
    "target": 0.5,
    "position": 220
  },
  {
    "id": "paper-hand-towel",
    "section": "paper",
    "grp": null,
    "name": "Hand towel",
    "unit": "pcs",
    "target": 5,
    "position": 230
  },
  {
    "id": "paper-drip-tray-towel",
    "section": "paper",
    "grp": null,
    "name": "Drip tray towel",
    "unit": "pcs",
    "target": 5,
    "position": 240
  },
  {
    "id": "paper-knock-box-towel",
    "section": "paper",
    "grp": null,
    "name": "Knock box towel",
    "unit": "pcs",
    "target": 5,
    "position": 250
  },
  {
    "id": "paper-milk-towel",
    "section": "paper",
    "grp": null,
    "name": "Milk towel",
    "unit": "pcs",
    "target": 5,
    "position": 260
  },
  {
    "id": "paper-table-towel",
    "section": "paper",
    "grp": null,
    "name": "Table towel",
    "unit": "pcs",
    "target": 5,
    "position": 270
  },
  {
    "id": "paper-bar-towel",
    "section": "paper",
    "grp": null,
    "name": "Bar towel",
    "unit": "pcs",
    "target": 5,
    "position": 280
  },
  {
    "id": "paper-floor-towel",
    "section": "paper",
    "grp": null,
    "name": "Floor towel",
    "unit": "pcs",
    "target": 5,
    "position": 290
  }
];
