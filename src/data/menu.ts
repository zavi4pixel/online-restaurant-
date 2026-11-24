import type { MenuCategory, MenuItem } from '../types/restaurant.ts';

export const MENU_CATEGORIES: MenuCategory[] = [
  'Starters',
  'Handmade Pasta',
  'Wood-Fired Mains',
  'Desserts & Cellar',
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'wagyu-tartare',
    name: 'Dry-Aged Wagyu Tartare',
    category: 'Starters',
    description:
      'Hand-cut Snake River Farms ribeye, cured farm egg yolk, pickled mustard seed, caperberry emulsion, charred sourdough crisps.',
    price: 26,
    prepMinutes: 12,
    dietary: ['Dairy-Free'],
    featured: true,
    imageUrl: '/src/assets/images/dish_wagyu_tartare_1795497160107.jpg',
    ingredients: [
      '28-day dry-aged Snake River Farms Wagyu ribeye',
      'Salt-cured Sonoma pasture egg yolk',
      'House-pickled yellow & black mustard seed',
      'Wild caperberry & cold-pressed shallot emulsion',
      'Hearth-charred country levain crisps',
      'Fresh chives & Maldon sea salt',
    ],
    allergens: ['Egg', 'Wheat (optional GF crackers)', 'Mustard'],
    pairingNote: 'Champagne Laherte Frères Ultradition Brut or Yuzu Botanical Tonic',
    chefNotes:
      'Finely diced to order by hand so the marbling stays crisp rather than compressed, then finished with warm ember-charred sourdough.',
    options: [
      {
        id: 'bread-choice',
        label: 'Accompaniment',
        required: false,
        choices: [
          { id: 'sourdough', label: 'Charred Country Sourdough', priceDelta: 0 },
          { id: 'gf-seed', label: 'Seeded Buckwheat Crackers (GF)', priceDelta: 2 },
        ],
      },
    ],
  },
  {
    id: 'hearth-sea-bass',
    name: 'Wood-Roasted Black Sea Bass',
    category: 'Wood-Fired Mains',
    description:
      'Line-caught local black sea bass roasted over white oak embers, charred baby fennel, saffron beurre blanc, sea beans.',
    price: 44,
    prepMinutes: 22,
    dietary: ['Gluten-Free'],
    featured: true,
    imageUrl: '/src/assets/images/dish_sea_bass_1795497159088.jpg',
    ingredients: [
      'Half Moon Bay line-caught wild black sea bass',
      'White-oak roasted heirloom baby fennel',
      'Spanish saffron thread & dry vermouth beurre blanc',
      'Foraged coastal sea beans & fennel pollen',
      'Meyer lemon zest & flaky sea salt',
    ],
    allergens: ['Fish', 'Dairy (optional Olive Oil prep)'],
    pairingNote: '2022 Domaine Bernard Moreau Chassagne-Montrachet',
    chefNotes:
      'Crisped skin-side down in cast iron directly on white oak coals for luminous skin and delicate, flaky flesh.',
    options: [
      {
        id: 'sauce-side',
        label: 'Preparation',
        required: false,
        choices: [
          { id: 'classic', label: 'Saffron Beurre Blanc', priceDelta: 0 },
          { id: 'olive-oil', label: 'Meyer Lemon & Herb Olive Oil (DF)', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'truffle-agnolotti',
    name: 'Chanterelle & Black Truffle Agnolotti',
    category: 'Handmade Pasta',
    description:
      'Hand-folded saffron egg pasta filled with roasted coastal chanterelles, cultured butter jus, shaved Périgord truffle, 36-month Parmigiano.',
    price: 36,
    prepMinutes: 18,
    dietary: ['Vegetarian'],
    featured: true,
    imageUrl: '/src/assets/images/dish_truffle_agnolotti_1795497160305.jpg',
    ingredients: [
      'Heritage-wheat & saffron pasture egg pasta dough',
      'Foraged Mendocino golden chanterelle mushrooms',
      'Whipped mascarpone & roasted garlic confit filling',
      'Cultured Normandy butter & mushroom roasting jus',
      'Freshly shaved Périgord black truffle & 36-month Parmigiano-Reggiano',
    ],
    allergens: ['Wheat', 'Egg', 'Dairy'],
    pairingNote: '2021 Hirsch Vineyards Bohan-Dillon Pinot Noir',
    chefNotes:
      'Rolled to translucent thickness each afternoon and glazed gently in emulsion so every fold catches the aromatic truffle jus.',
    options: [
      {
        id: 'truffle-extra',
        label: 'Truffle Finish',
        required: false,
        choices: [
          { id: 'standard', label: 'Standard Shaved Black Truffle', priceDelta: 0 },
          { id: 'generous', label: 'Double Shaved Périgord Truffle', priceDelta: 14 },
        ],
      },
    ],
  },
  {
    id: 'meyer-lemon-tart',
    name: 'Caramelized Meyer Lemon Tart',
    category: 'Desserts & Cellar',
    description:
      'Brûléed Sonoma Meyer lemon curd in brown-butter pâte sucrée, toasted bergamot meringue, fresh lemon thyme.',
    price: 17,
    prepMinutes: 10,
    dietary: ['Vegetarian'],
    featured: true,
    imageUrl: '/src/assets/images/dish_citrus_tart_1795497161069.jpg',
    ingredients: [
      'Organic Sonoma Valley Meyer lemon juice & zest',
      'Brown-butter almond pâte sucrée crust',
      'Pasture egg custard brûléed with demerara sugar',
      'Italian meringue infused with Calabrian bergamot',
      'Garden lemon thyme blossoms',
    ],
    allergens: ['Wheat', 'Egg', 'Dairy', 'Tree Nuts (Almond)'],
    pairingNote: 'Château Rieussec Carmes de Rieussec Sauternes',
    chefNotes:
      'Balanced between bright coastal citrus acidity and caramelized sugar crust, torched to order right before service.',
  },
  {
    id: 'oysters-mignonette',
    name: 'Hog Island Sweetwater Oysters',
    category: 'Starters',
    description:
      'Half-dozen chilled Pacific oysters with green strawberry mignonette, grated horseradish, charred Meyer lemon.',
    price: 24,
    prepMinutes: 8,
    dietary: ['Gluten-Free', 'Dairy-Free', 'Shellfish'],
    featured: false,
    imageUrl: '/src/assets/images/dish_oysters_mignonette_1795499403413.jpg',
    ingredients: [
      'Six Tomales Bay Hog Island Sweetwater oysters',
      'Unripe green strawberry & Champagne vinegar mignonette',
      'Freshly grated Humboldt horseradish root',
      'Hearth-charred Meyer lemon',
      'Borage blossoms & coastal sea succulents',
    ],
    allergens: ['Shellfish'],
    pairingNote: '2023 Domaine Gueguen Chablis',
    chefNotes:
      'Harvested each morning in Tomales Bay and shucked exclusively to order over crushed ice.',
  },
  {
    id: 'burrata-fig',
    name: 'Smoked Pugliese Burrata & Black Mission Fig',
    category: 'Starters',
    description:
      'Hearth-kissed figs, aged balsamic saba, crushed pistachio, wild arugula, grilled levain.',
    price: 21,
    prepMinutes: 10,
    dietary: ['Vegetarian'],
    featured: false,
    imageUrl: '/src/assets/images/dish_burrata_fig_1795499403711.jpg',
    ingredients: [
      'Artisanal Pugliese burrata lightly cold-smoked over applewood',
      'Wood-roasted California Black Mission figs',
      '12-year Modena balsamic saba & cold-pressed olive oil',
      'Toasted Bronte pistachios & wild baby arugula',
      'Charred country levain',
    ],
    allergens: ['Dairy', 'Tree Nuts (Pistachio)', 'Wheat'],
    pairingNote: '2022 Terlano Pinot Bianco',
    chefNotes:
      'The gentle warmth of the hearth-blistered figs contrasts cleanly against cool, creamy burrata.',
  },
  {
    id: 'dungeness-tagliolini',
    name: 'Dungeness Crab & Sea Urchin Tagliolini',
    category: 'Handmade Pasta',
    description:
      'Bronze-die squid-ink and egg tagliolini tossed with sweet Dungeness crab, Santa Barbara uni butter, Calabrian chili, lemon zest.',
    price: 39,
    prepMinutes: 18,
    dietary: ['Shellfish'],
    featured: false,
    imageUrl: '/src/assets/images/dish_crab_tagliolini_1795499404287.jpg',
    ingredients: [
      'House-extruded squid-ink & semolina tagliolini',
      'Hand-picked local Dungeness crab lump meat',
      'Santa Barbara red sea urchin (uni) emulsion',
      'Calabrian chili threads & garlic confit oil',
      'Meyer lemon zest & flat-leaf parsley',
    ],
    allergens: ['Shellfish', 'Wheat', 'Egg', 'Dairy'],
    pairingNote: '2022 Arnot-Roberts Trousseau or Vermentino',
    chefNotes:
      'Rich coastal umami balanced with crisp lemon zest and gentle Calabrian warmth.',
  },
  {
    id: 'chestnut-tajarin',
    name: 'Wild Nettle & Ricotta Tajarin',
    category: 'Handmade Pasta',
    description:
      'Fine hand-cut Piedmontese ribbons, sheep-milk ricotta, roasted hazelnuts, crispy sage, brown butter.',
    price: 31,
    prepMinutes: 15,
    dietary: ['Vegetarian'],
    featured: false,
    imageUrl: '/src/assets/images/dish_nettle_tajarin_1795499404362.jpg',
    ingredients: [
      'Hand-cut wild stinging nettle egg tajarin ribbons',
      'Bellwether Farms whipped sheep-milk ricotta',
      'Toasted Oregon hazelnuts & crispy garden sage',
      'Nutty browned pasture butter & cracked black pepper',
      'Aged Pecorino Fiore Sardo',
    ],
    allergens: ['Wheat', 'Egg', 'Dairy', 'Tree Nuts (Hazelnut)'],
    pairingNote: '2021 Produttori del Barbaresco Langhe Nebbiolo',
    chefNotes:
      'Cut in the classic Piedmontese forty-yolk tradition folded with blanched spring nettles.',
  },
  {
    id: 'liberty-duck',
    name: 'Hearth-Roasted Liberty Duck Breast',
    category: 'Wood-Fired Mains',
    description:
      '14-day crown-aged duck roasted over almond wood, blackberry juniper jus, charred radicchio, celery root purée.',
    price: 46,
    prepMinutes: 24,
    dietary: ['Gluten-Free'],
    featured: false,
    imageUrl: '/src/assets/images/dish_duck_breast_1795499405006.jpg',
    ingredients: [
      'Sonoma Liberty Valley duck crown dry-aged 14 days in house',
      'Blackberry & crushed juniper berry hearth reduction',
      'Almond-wood grilled Castelfranco radicchio',
      'Silky roasted celeriac & cultured butter purée',
      'Nasturtium leaves & flaky sea salt',
    ],
    allergens: ['Dairy'],
    pairingNote: '2020 Littorai Savoy Vineyard Pinot Noir',
    chefNotes:
      'Two weeks of dry-aging renders the skin glass-crisp over almond-wood embers while keeping the breast ruby-tender.',
    options: [
      {
        id: 'duck-temp',
        label: 'Doneness',
        required: true,
        choices: [
          { id: 'med-rare', label: 'Medium-Rare (Chef Recommended)', priceDelta: 0 },
          { id: 'medium', label: 'Medium', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'prime-bavette',
    name: 'Oak-Grilled Prime Bavette & Bone Marrow',
    category: 'Wood-Fired Mains',
    description:
      '10 oz dry-aged prime bavette, roasted marrow herb butter, blistered heirloom carrots, rosemary jus.',
    price: 49,
    prepMinutes: 22,
    dietary: ['Gluten-Free'],
    featured: false,
    imageUrl: '/src/assets/images/dish_prime_bavette_1795499404792.jpg',
    ingredients: [
      '10 oz 35-day dry-aged Marin Sun Farms prime bavette',
      'Whipped roasted beef bone marrow & parsley compound butter',
      'Blistered multicolored heirloom carrots',
      'Slow-simmered veal & fresh rosemary jus',
      'Flaky Maldon sea salt',
    ],
    allergens: ['Dairy'],
    pairingNote: '2019 Ridge Vineyards Estate Cabernet Sauvignon',
    chefNotes:
      'Seared directly over live white oak flames and rested on warm cedar planks before slicing against the grain.',
    options: [
      {
        id: 'steak-temp',
        label: 'Temperature',
        required: true,
        choices: [
          { id: 'rare', label: 'Rare', priceDelta: 0 },
          { id: 'med-rare', label: 'Medium-Rare', priceDelta: 0 },
          { id: 'medium', label: 'Medium', priceDelta: 0 },
          { id: 'med-well', label: 'Medium-Well', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'chocolate-olive-oil-cake',
    name: 'Single-Origin Valrhona Olive Oil Torte',
    category: 'Desserts & Cellar',
    description:
      'Warm dark chocolate torte infused with cold-pressed Arbequina olive oil, flaky sea salt, crème fraîche.',
    price: 18,
    prepMinutes: 12,
    dietary: ['Gluten-Free', 'Vegetarian'],
    featured: false,
    imageUrl: '/src/assets/images/dish_chocolate_torte_1795499405379.jpg',
    ingredients: [
      '70% Valrhona Guanaja single-origin dark chocolate',
      'First-press California Arbequina extra virgin olive oil',
      'Almond flour & pasture-raised whipped egg whites',
      'Bellwether Farms cultured crème fraîche',
      'Pacific flaky sea salt & fresh thyme',
    ],
    allergens: ['Egg', 'Dairy', 'Tree Nuts (Almond)'],
    pairingNote: 'Niepoort 10-Year Tawny Port or Single-Origin Espresso',
    chefNotes:
      'Baked without wheat flour for a dense, mousse-like crumb lifted by peppery Arbequina olive oil.',
  },
  {
    id: 'yuzu-botanical-tonic',
    name: 'Zero-Proof Yuzu & Coastal Verbena Fizz',
    category: 'Desserts & Cellar',
    description:
      'Fresh Japanese yuzu, garden lemon verbena distillate, gentian root bitters, sparkling mineral water.',
    price: 14,
    prepMinutes: 5,
    dietary: ['Gluten-Free', 'Vegetarian', 'Dairy-Free'],
    featured: false,
    imageUrl: '/src/assets/images/dish_yuzu_tonic_1795499405009.jpg',
    ingredients: [
      'Cold-pressed Kochi prefecture yuzu juice',
      'House-steamed lemon verbena hydrosol',
      'Botanical gentian root & cinchona bark tincture',
      'Sparkling Sonoma mineral water over hand-cut crystal ice',
      'Fresh garden verbena leaf',
    ],
    allergens: [],
    pairingNote: 'Zero-proof aperitif or refreshing accompaniment to starters',
    chefNotes:
      'Crafted in-house with zero alcohol and minimal cane sugar for crisp herbal brightness.',
  },
];

export const HERO_IMAGE_URL = '/src/assets/images/hero_bistro_dining_1795497159024.jpg';
