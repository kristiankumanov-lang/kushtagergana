export const locales = ["bg", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bg";

export interface Dictionary {
  meta: {
    siteName: string;
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
  };
  nav: {
    logoAlt: string;
    about: string;
    kitchen: string;
    gallery: string;
    surroundings: string;
    pricing: string;
    location: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    cta: string;
    directBadge: string;
  };
  ratings: {
    bookingLabel: string;
    bookingReviewsSuffix: string;
    googleLabel: string;
    googleReviewsSuffix: string;
    googleContext: string;
    viewAllReviews: string;
    disclaimer: string;
    subcategoryLabels: {
      staff: string;
      cleanliness: string;
      facilities: string;
      location: string;
      valueForMoney: string;
      comfort: string;
    };
    testimonials: { quote: string; author: string; source: string }[];
  };
  about: {
    kicker: string;
    heading: string;
    paragraphs: string[];
    amenities: {
      fireplace: string;
      wifi: string;
      parking: string;
      bbq: string;
      bedrooms: string;
      pets: string;
      pool: string;
      restaurant: string;
      mehana: string;
    };
  };
  kitchen: {
    kicker: string;
    heading: string;
    paragraphs: string[];
    breakfastTitle: string;
    breakfastText: string;
    dinnerTitle: string;
    dinnerText: string;
    freshNote: string;
  };
  gallery: {
    kicker: string;
    heading: string;
    subheading: string;
    categories: {
      house: string;
      kitchen: string;
      yard: string;
      mountain: string;
      pool: string;
    };
    close: string;
    prev: string;
    next: string;
    /** Per-image alt text, keyed by GalleryImage.id (lib/gallery.ts). */
    altTexts: Record<string, string>;
  };
  surroundings: {
    kicker: string;
    heading: string;
    subheading: string;
    winter: { title: string; items: string[] };
    summer: { title: string; items: string[] };
    borovets: { title: string; text: string };
    trails: { title: string; text: string };
    village: { title: string; text: string };
  };
  pricing: {
    kicker: string;
    heading: string;
    subheading: string;
    directBadge: string;
    directBadgeSub: string;
    table: {
      period: string;
      price: string;
    };
    rows: { period: string; price: string; note?: string }[];
    capacity: string;
    ctaNote: string;
  };
  location: {
    kicker: string;
    heading: string;
    subheading: string;
    distances: { label: string; value: string }[];
    directionsTitle: string;
    directionsText: string;
    mapCta: string;
    mapPlaceholderTitle: string;
    mapPlaceholderText: string;
    mapShowButton: string;
  };
  booking: {
    kicker: string;
    heading: string;
    subheading: string;
    calendarLegend: { free: string; busy: string; selected: string };
    calendarFallback: string;
    calendarLoading: string;
    form: {
      name: string;
      phone: string;
      email: string;
      checkIn: string;
      checkOut: string;
      adults: string;
      children: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successText: string;
      successTextEmailFailed: string;
      errorTitle: string;
      errorText: string;
      rateLimited: string;
      required: string;
      invalidEmail: string;
      invalidPhone: string;
      invalidDates: string;
      dateConflict: string;
      nameTooLong: string;
      messageTooLong: string;
      invalidGuests: string;
    };
  };
  footer: {
    tagline: string;
    contactsTitle: string;
    address: string;
    followUs: string;
    rights: string;
    bookingBadge: string;
  };
  common: {
    langSwitch: string;
  };
}

const bg: Dictionary = {
  meta: {
    siteName: "Къща за гости Гергана",
    title: "Къща за гости Гергана – Радуил, Рила планина | Нощувка близо до Боровец",
    description:
      "Къща за гости в село Радуил, на 10 минути от ски курорта Боровец. Планински уют, камина, басейн и домашна кухня с пресни продукти. Проверете свободни дати и резервирайте директно.",
    keywords: [
      "къща за гости Радуил",
      "нощувка близо до Боровец",
      "домашна кухня Рила",
      "къща за гости Рила планина",
      "къща за гости с басейн Рила",
      "ски почивка Боровец",
      "guest house Raduil",
    ],
    ogTitle: "Къща за гости Гергана – Радуил, Рила планина",
    ogDescription: "Планински уют и домашна кухня на 10 минути от Боровец. Вашият дом в полите на Рила.",
  },
  nav: {
    logoAlt: "Къща за гости Гергана - лого",
    about: "За къщата",
    kitchen: "Кухнята и механата",
    gallery: "Галерия",
    surroundings: "Наоколо",
    pricing: "Цени",
    location: "Локация",
  },
  hero: {
    kicker: "Радуил · Рила планина",
    title: "Вашият дом в полите на Рила",
    subtitle:
      "Къща за гости с камина, домашна храна, басейн и планински въздух – на 10 минути от ски курорта Боровец.",
    cta: "Провери свободни дати",
    directBadge: "Най-добра цена при директна резервация",
  },
  ratings: {
    bookingLabel: "Booking.com",
    bookingReviewsSuffix: "ревюта",
    googleLabel: "Google",
    googleReviewsSuffix: "отзива",
    googleContext: "Отзиви от гости в Google ",
    viewAllReviews: "Виж всички отзиви",
    disclaimer:
      "* Оценките се обновяват периодично и може да се различават от актуалните в Google и Booking.com.",
    subcategoryLabels: {
      staff: "Персонал",
      cleanliness: "Чистота",
      facilities: "Съоръжения",
      location: "Локация",
      valueForMoney: "Цена/качество",
      comfort: "Комфорт",
    },
    testimonials: [
      {
        quote:
          "Много хубава и поддържана къща за гости с домашна и вкусно приготвена храна. Чист и хубав басейн. Стопанисва се от любезни и отзивчиви стопани.",
        author: "Ирена Д.",
        source: "Google",
      },
      {
        quote:
          "Красиво място с чист въздух, идеално за почивка. Стаите са чисти и светли, с хубава гледка към Рила, има и басейн.",
        author: "Тодор К.",
        source: "Google",
      },
      {
        quote: "Много любезни домакини. Перфектно място за почивка.",
        author: "Първан С.",
        source: "Google",
      },
    ],
  },
  about: {
    kicker: "Добре дошли",
    heading: "За къщата",
    paragraphs: [
      "Посрещаме ви като у дома – с прегърнати от дърво стаи, пращяща камина и изглед към върховете на Рила. Къщата е малка нарочно: толкова, колкото да се погрижим лично за всеки гост.",
      "Тук идвате да забавите темпото. Сутрин – с кафе на терасата и мирис на прясно изпечен хляб, вечер – с топла завивка и тишина, каквато градът отдавна не помни.",
    ],
    amenities: {
      fireplace: "Камина с дърва",
      wifi: "Безплатен WiFi",
      parking: "Собствен паркинг",
      bbq: "Барбекю на двора",
      // TODO: потвърди точния брой спални по Booking обявата.
      bedrooms: "6 уютни спални",
      pets: "Приемаме домашни любимци",
      pool: "Сезонен външен басейн",
      restaurant: "Ресторант на място",
      mehana: "Механа",
    },
  },
  kitchen: {
    kicker: "Диша на домашно",
    heading: "Кухнята и механата",
    paragraphs: [
      "Домашната храна се приготвя на място и се сервира в уютната механа на къщата – с дървени греди, камина и топла атмосфера през зимата, а лятото можете да похапвате направо край басейна. Не се налага да излизате никъде за вечеря.",
      "Работим с винаги пресни и по възможност домашни продукти. Няма менюта с петдесет ястия, има вкус, който помните.",
    ],
    // TODO: попълни реални специалитети от менюто на механата (от собственичката).
    breakfastTitle: "Закуска",
    breakfastText: "Богата закуска в механата всяка сутрин, преди да тръгнете на пистата или по пътеките.",
    dinnerTitle: "Обяд и вечеря по желание",
    dinnerText:
      "При заявка сервираме традиционна българска кухня в механата – за обяд или вечеря, без да напускате къщата.",
    freshNote: "Винаги пресни и по възможност домашни продукти.",
  },
  gallery: {
    kicker: "Погледнете отблизо",
    heading: "Галерия",
    subheading: "Къщата, кухнята, дворът и планината – такива, каквито ще ги заварите.",
    categories: {
      house: "Къщата",
      kitchen: "Кухнята и механата",
      yard: "Дворът",
      mountain: "Планината",
      pool: "Басейнът",
    },
    close: "Затвори",
    prev: "Предишна",
    next: "Следваща",
    altTexts: {
      "house-1": "Басейнът и градината пред къщата",
      "house-2": "Каменната фасада с дървен балкон и лозница",
      "house-3": "Изглед от балкона към селото и хълмовете",
      "house-4": "Двойна стая в топли теракотени тонове",
      "house-5": "Спалня с горчично жълта стена",
      "house-6": "Баня с плочки в бежов мрамор и душ кабина",
      "house-7": "Спалня с жълт акцент и цветна картина",
      "house-8": "Спалня с бюро, телевизор и климатик",
      "house-9": "Баня с тоалетна и душ кабина",
      "house-10": "Стая с две легла и бели стени",
      "kitchen-1": "Плато със скара, царевица и лютеница до басейна вечер",
      "kitchen-2": "Дърва, горящи в традиционната фурна",
      "kitchen-3": "Жарава отблизо в дървената фурна",
      "kitchen-4": "Механата, подредена за тържество, с балонена арка",
      "kitchen-5": "Дълга маса, подредена за семейно събиране",
      "kitchen-6": "Дълга маса със сини салфетки и цветя за тържество",
      "kitchen-7": "Механата със зелени покривки и изглед към басейна",
      "kitchen-8": "Плато с прясно нарязани плодове до басейна",
      "kitchen-9": "Прясно изпечена баница до басейна",
      "kitchen-10": "Сирене, препечена филия и сладко до басейна",
      "kitchen-11": "Препечена филия с разтопено сирене и краставица до басейна",
      "pizza-1": "Две домашни пици направо от фурната",
      "homemade-bread-1": "Питка домашен хляб със сусам",
      "burger-1": "Бургер на скара с пържени картофи",
      "cured-ham-winter-1": "Сушен бут на стойка с чаша вино, сняг през прозореца",
      "dining-hall-1": "Механата, подредена за тържество, с балонена гирлянда",
      "terrace-table-1": "Маса, подредена на терасата до басейна",
      "grill-embers-1": "Шишчета на скарата над жарава",
      "oven-embers-1": "Жарава в традиционната фурна на дърва",
      "oven-roast-1": "Печено месо във фурната на дърва",
      "roast-lamb-1": "Цяло агнешко, изпечено във фурната на дърва",
      "roast-pork-1": "Цяло свинско, изпечено във фурната на дърва",
      "yard-1": "Маси с чадъри до басейна",
      "yard-2": "Каменна фасада с цъфнали хортензии",
      "yard-winter-1": "Заснежената градина с изглед към планината",
      "yard-winter-3": "Заснеженият двор отблизо",
      "pool-barbecue-1": "Плато от скарата до басейна",
      "mountain-1": "Изглед отгоре към басейна, двора и селото под планината",
      "mountain-2": "Покривите на селото между дърветата, хълмове отзад",
      "rila-valley-1": "Туристи на скалист хребет над зелена долина в Рила",
      "viewpoint-1": "Изглед от видна точка в планината към върховете на Рила",
      "rila-trail-1": "Планинска пътека сред полски цветя под скалист връх",
      "mountain-river-1": "Водопади над гранитни камъни",
      "forest-stream-1": "Планински поток през скалист горски пролом",
      "forest-river-2": "Бърз планински поток през гората",
      "forest-river-3": "Слънчев планински поток между мъхести камъни",
      "mountain-river-2": "Мъхести камъни и топящ се сняг край горски поток",
      "river-spring-1": "Спокоен каменист поток през гола ранопролетна гора",
      "rila-meadow-1": "Двойка, вървяща през алпийска ливада под върховете",
      "meadow-sunrise-1": "Изгрев над заскрежена планинска ливада",
      "meadow-sun-1": "Слънчева пролетна ливада с цъфнали дървета",
      "meadow-trees-1": "Цъфнала овощна градина под синьо небе",
      "meadow-village-1": "Изглед към селото от ливада на хълма",
      "forest-river-1": "Букова гора край планински поток, огряна от слънце",
      "mushrooms-crate-1": "Каса, пълна с прясно набрани манатарки",
      "mushroom-1": "Прясно набрана манатарка, държана в гората",
      "pool-1": "Изглед отгоре към басейна и шезлонгите",
      "pool-2": "Шезлонги до басейна с изглед към планината и селото",
    },
  },
  surroundings: {
    kicker: "Радуил и Рила",
    heading: "Наоколо",
    subheading:
      "На 10 минути от ски курорта Боровец и на крачка от най-хубавите пътеки на Рила.",
    winter: {
      title: "Зима",
      items: [
        "Ски и сноуборд в Боровец – 10 мин с кола",
        "Лифт към Мусала и зимни маршрути",
        "Топла вечеря и камина след деня на пистата",
      ],
    },
    summer: {
      title: "Лято",
      items: [
        "Басейн в двора с изглед към планината",
        "Еко пътеки и хижи в Рила планина",
        "Изкачване на връх Мусала",
        "Пикник и барбекю на двора привечер",
      ],
    },
    borovets: {
      title: "Боровец",
      text: "Най-старият и голям ски курорт в България е само на 10 минути с кола – карате ски през деня, а нощувате в тишина и уют.",
    },
    trails: {
      title: "Еко пътеки",
      text: "Рила предлага десетки маркирани маршрути – от леки разходки сред борови гори до изкачване до връх Мусала.",
    },
    village: {
      title: "Село Радуил",
      text: "Автентично рилско село в подножието на планината – каменни чешми, стари къщи и спокойствие, което липсва в градовете.",
    },
  },
  pricing: {
    kicker: "Цени",
    heading: "Цени и капацитет",
    subheading: "Прозрачни цени за всеки тип настаняване, без скрити такси. Общ капацитет – до 16 души.",
    directBadge: "Най-добра цена",
    directBadgeSub: "при директна резервация – без комисионна за Booking.com",
    table: { period: "Настаняване", price: "Цена на вечер" },
    rows: [
      { period: "Апартамент", price: "60 €", note: "2 бр. · с тераса · до 4 души" },
      { period: "Стая с тераса", price: "30 €", note: "2 бр. · спалня или две единични легла" },
      { period: "Стая без тераса", price: "25 €", note: "2 бр. · спалня или две единични легла" },
    ],
    capacity: "6 помещения · до 16 души",
    ctaNote: "Пишете ни за точна оферта според датите и броя гости.",
  },
  location: {
    kicker: "Как да стигнете",
    heading: "Локация",
    subheading: "ул. 11-та 2, с. Радуил, община Самоков – в сърцето на Рила планина.",
    distances: [
      { label: "От София", value: "~55 мин с кола" },
      { label: "До Боровец", value: "~10 мин с кола" },
      { label: "До Мусала (лифт)", value: "~20 мин с кола" },
    ],
    directionsTitle: "Как да ни намерите",
    directionsText:
      "По магистрала „Тракия“ до Костенец, след което следвате пътните знаци за Самоков и Боровец. Изпращаме точни насоки при потвърждение на резервацията.",
    mapCta: "Отвори в Google Maps",
    mapPlaceholderTitle: "Картата се зарежда от Google Maps",
    mapPlaceholderText: "Google задава бисквитки едва след като заредите картата.",
    mapShowButton: "Покажи картата",
  },
  booking: {
    kicker: "Резервация",
    heading: "Проверете свободни дати",
    subheading:
      "Изберете дати от календара и изпратете заявка – отговаряме лично до няколко часа.",
    calendarLegend: { free: "Свободно", busy: "Заето", selected: "Избрано" },
    calendarFallback: "Наличността се потвърждава от домакина.",
    calendarLoading: "Зареждане на наличността…",
    form: {
      name: "Име и фамилия",
      phone: "Телефон",
      email: "Имейл",
      checkIn: "Настаняване",
      checkOut: "Напускане",
      adults: "Възрастни",
      children: "Деца",
      message: "Съобщение (по желание)",
      messagePlaceholder: "Разкажете ни за пътуването си – брой гости, повод, специални желания…",
      submit: "Изпрати заявка",
      submitting: "Изпращане…",
      successTitle: "Получихме заявката ви!",
      successText: "Ще се свържем с вас до няколко часа, за да потвърдим резервацията.",
      successTextEmailFailed:
        "Получихме заявката ви, но известието не успя да се изпрати автоматично. За по-сигурно, обадете се на {phone}.",
      errorTitle: "Нещо се обърка",
      errorText: "Моля, опитайте отново или ни пишете директно на имейл.",
      rateLimited: "Изпратихте твърде много заявки. Моля, опитайте отново след час или ни се обадете директно.",
      required: "Това поле е задължително.",
      invalidEmail: "Моля, въведете валиден имейл адрес.",
      invalidPhone: "Моля, въведете валиден телефонен номер.",
      invalidDates: "Датата на напускане трябва да е след датата на настаняване.",
      dateConflict: "Избраните дати вече са заети. Моля, изберете друг период.",
      nameTooLong: "Името е твърде дълго (макс. 100 символа).",
      messageTooLong: "Съобщението е твърде дълго (макс. 1000 символа).",
      invalidGuests: "Моля, въведете допустим брой гости.",
    },
  },
  footer: {
    tagline: "Вашият дом в полите на Рила",
    contactsTitle: "Контакти",
    address: "ул. 11-та 2, 2043 с. Радуил, община Самоков",
    followUs: "Последвайте ни",
    rights: "Всички права запазени.",
    bookingBadge: "Намерете ни и в Booking.com",
  },
  common: {
    langSwitch: "EN",
  },
};

const en: Dictionary = {
  meta: {
    siteName: "Guest House Gergana",
    title: "Guest House Gergana – Raduil, Rila Mountain | Stay Near Borovets",
    description:
      "Guest house in the village of Raduil, 10 minutes from the Borovets ski resort. Mountain comfort, fireplace, pool and home cooking with fresh ingredients. Check availability and book directly.",
    keywords: [
      "guest house Raduil",
      "accommodation near Borovets",
      "home cooking Rila",
      "guest house Rila mountain",
      "guest house with pool Rila",
      "ski holiday Borovets",
    ],
    ogTitle: "Guest House Gergana – Raduil, Rila Mountain",
    ogDescription: "Mountain comfort and home cooking 10 minutes from Borovets. Your home in the foothills of Rila.",
  },
  nav: {
    logoAlt: "Guest House Gergana - logo",
    about: "The House",
    kitchen: "Kitchen & Tavern",
    gallery: "Gallery",
    surroundings: "Around Us",
    pricing: "Rates",
    location: "Location",
  },
  hero: {
    kicker: "Raduil · Rila Mountain",
    title: "Your home in the foothills of Rila",
    subtitle:
      "A guest house with a wood fire, home-cooked food, a pool and mountain air – 10 minutes from Borovets ski resort.",
    cta: "Check Availability",
    directBadge: "Best price for direct bookings",
  },
  ratings: {
    bookingLabel: "Booking.com",
    bookingReviewsSuffix: "reviews",
    googleLabel: "Google",
    googleReviewsSuffix: "reviews",
    googleContext: "Guest reviews on Google Maps",
    viewAllReviews: "See all reviews",
    disclaimer:
      "* Ratings are updated periodically and may differ from the current ones on Google and Booking.com.",
    subcategoryLabels: {
      staff: "Staff",
      cleanliness: "Cleanliness",
      facilities: "Facilities",
      location: "Location",
      valueForMoney: "Value for money",
      comfort: "Comfort",
    },
    testimonials: [
      {
        quote:
          "A lovely, well-kept guest house with delicious home-cooked food. Clean, beautiful pool. Run by kind and attentive hosts.",
        author: "Irena D.",
        source: "Google",
      },
      {
        quote:
          "A beautiful place with fresh air, perfect for a getaway. The rooms are clean and bright, with a lovely view of Rila, and there's a pool.",
        author: "Todor K.",
        source: "Google",
      },
      {
        quote: "Very kind hosts. A perfect place to unwind.",
        author: "Parvan S.",
        source: "Google",
      },
    ],
  },
  about: {
    kicker: "Welcome",
    heading: "The House",
    paragraphs: [
      "We welcome you like family – wood-lined rooms, a crackling fireplace and views over the Rila peaks. The house is small on purpose: just the right size for us to look after every guest personally.",
      "This is a place to slow down. Mornings with coffee on the terrace and the smell of fresh bread, evenings with a warm blanket and a quiet you rarely find in the city.",
    ],
    amenities: {
      fireplace: "Wood fireplace",
      wifi: "Free WiFi",
      parking: "Private parking",
      bbq: "Garden barbecue",
      bedrooms: "6 cozy bedrooms",
      pets: "Pets welcome",
      pool: "Seasonal outdoor pool",
      restaurant: "On-site restaurant",
      mehana: "Tavern",
    },
  },
  kitchen: {
    kicker: "Tastes like home",
    heading: "Kitchen & Tavern",
    paragraphs: [
      "The home-cooked food is prepared on site and served in the house's cosy tavern – with wooden beams, a fireplace and a warm atmosphere in winter, and in summer you can dine right by the pool. No need to go anywhere for dinner.",
      "We work with always-fresh and, where possible, homemade produce. No fifty-dish menus, just flavour you'll remember.",
    ],
    // TODO: fill in real tavern menu specialties (from the owner).
    breakfastTitle: "Breakfast",
    breakfastText: "A generous breakfast in the tavern every morning, before you head out to the slopes or trails.",
    dinnerTitle: "Lunch & dinner on request",
    dinnerText:
      "With advance notice we serve traditional Bulgarian cuisine in the tavern – for lunch or dinner, without leaving the house.",
    freshNote: "Always fresh and, where possible, homemade produce.",
  },
  gallery: {
    kicker: "Take a closer look",
    heading: "Gallery",
    subheading: "The house, the kitchen, the yard and the mountain – just as you'll find them.",
    categories: {
      house: "The House",
      kitchen: "Kitchen & Tavern",
      yard: "The Yard",
      mountain: "The Mountain",
      pool: "The Pool",
    },
    close: "Close",
    prev: "Previous",
    next: "Next",
    altTexts: {
      "house-1": "The pool and garden in front of the house",
      "house-2": "Stone facade with a wooden balcony and grapevine trellis",
      "house-3": "View from the balcony over the village and hills",
      "house-4": "Twin room in warm terracotta tones",
      "house-5": "Bedroom with a mustard-yellow wall",
      "house-6": "Bathroom with beige marble-look tiles and walk-in shower",
      "house-7": "Bedroom with a yellow accent wall and floral artwork",
      "house-8": "Bedroom with a desk, TV and air conditioning",
      "house-9": "Bathroom with toilet and walk-in shower",
      "house-10": "Twin room with white walls",
      "kitchen-1": "Grilled meat platter with corn and lyutenitsa by the pool at night",
      "kitchen-2": "Firewood burning in the traditional wood oven",
      "kitchen-3": "Close-up of glowing embers in the wood oven",
      "kitchen-4": "The tavern hall decorated for a celebration with a balloon arch",
      "kitchen-5": "Long table set for a family gathering",
      "kitchen-6": "Long table set with blue napkins and flowers for a celebration",
      "kitchen-7": "Tavern seating with green tablecloths and a pool view",
      "kitchen-8": "Freshly cut fruit platter by the pool",
      "kitchen-9": "Freshly baked banitsa by the pool",
      "kitchen-10": "White cheese, toast and jam by the pool",
      "kitchen-11": "Melted cheese toast with cucumber by the pool",
      "pizza-1": "Two homemade pizzas fresh from the oven",
      "homemade-bread-1": "Round homemade bread loaf with sesame seeds",
      "burger-1": "Grilled burger with fries",
      "cured-ham-winter-1": "Cured ham on a stand with a glass of wine, snow outside the window",
      "dining-hall-1": "The tavern hall decorated for a celebration with a balloon garland",
      "terrace-table-1": "Table set on the terrace by the pool",
      "grill-embers-1": "Skewers grilling over glowing charcoal",
      "oven-embers-1": "Glowing embers in the traditional wood oven",
      "oven-roast-1": "Roasted meat inside the wood oven",
      "roast-lamb-1": "Whole roast lamb fresh out of the wood oven",
      "roast-pork-1": "Whole roast pork fresh out of the wood oven",
      "yard-1": "Dining tables with umbrellas by the pool",
      "yard-2": "Stone facade with blooming hydrangeas",
      "yard-winter-1": "The snow-covered garden with a mountain view",
      "yard-winter-3": "Close-up of the snow-covered yard",
      "pool-barbecue-1": "A barbecue platter by the pool",
      "mountain-1": "Aerial view of the pool, garden and village below the mountains",
      "mountain-2": "Village rooftops among the trees, hills beyond",
      "rila-valley-1": "Hikers on a rocky ridge above a green Rila valley",
      "viewpoint-1": "View from a mountain viewpoint over the Rila peaks",
      "rila-trail-1": "Mountain trail through wildflowers below a rocky peak",
      "mountain-river-1": "Waterfalls cascading over granite boulders",
      "forest-stream-1": "Mountain stream through a rocky forest gorge",
      "forest-river-2": "Fast mountain stream rushing through the forest",
      "forest-river-3": "Sunlit mountain stream rushing between mossy rocks",
      "mountain-river-2": "Mossy boulders and melting snow along a forest stream",
      "river-spring-1": "Calm rocky stream through a bare early-spring forest",
      "rila-meadow-1": "A couple walking through an alpine meadow below the peaks",
      "meadow-sunrise-1": "Sunrise over a frosty mountain meadow",
      "meadow-sun-1": "Sunlit spring meadow with blossoming trees",
      "meadow-trees-1": "Blossoming orchard trees under a blue sky",
      "meadow-village-1": "View over the village from a hillside meadow",
      "forest-river-1": "Sunlit beech forest along a mountain stream",
      "mushrooms-crate-1": "A crate full of freshly foraged porcini mushrooms",
      "mushroom-1": "Freshly picked porcini mushroom held up in the forest",
      "pool-1": "Aerial view of the pool and sun loungers",
      "pool-2": "Pool loungers with a mountain and village view",
    },
  },
  surroundings: {
    kicker: "Raduil & Rila",
    heading: "Around Us",
    subheading: "10 minutes from Borovets ski resort and a step away from Rila's best trails.",
    winter: {
      title: "Winter",
      items: [
        "Skiing and snowboarding in Borovets – 10 min by car",
        "Cable car to Musala and winter routes",
        "A warm dinner and fireplace after a day on the slopes",
      ],
    },
    summer: {
      title: "Summer",
      items: [
        "Outdoor pool with mountain views",
        "Eco trails and mountain huts across Rila",
        "Hiking to Musala peak",
        "Picnics and barbecue in the yard at dusk",
      ],
    },
    borovets: {
      title: "Borovets",
      text: "Bulgaria's oldest and largest ski resort is just 10 minutes by car – ski all day, then come home to quiet and comfort.",
    },
    trails: {
      title: "Eco Trails",
      text: "Rila offers dozens of marked routes – from easy walks through pine forests to the climb up Musala peak.",
    },
    village: {
      title: "Raduil Village",
      text: "An authentic Rila village at the foot of the mountain – stone fountains, old houses and a calm you won't find in cities.",
    },
  },
  pricing: {
    kicker: "Rates",
    heading: "Rates & Capacity",
    subheading: "Transparent pricing for every room type, no hidden fees. Total capacity – up to 16 guests.",
    directBadge: "Best price",
    directBadgeSub: "for direct bookings – no Booking.com commission",
    table: { period: "Accommodation", price: "Price per night" },
    rows: [
      { period: "Apartment", price: "€60", note: "2 units · with terrace · up to 4 guests" },
      { period: "Room with terrace", price: "€30", note: "2 units · double bed or twin beds" },
      { period: "Room without terrace", price: "€25", note: "2 units · double bed or twin beds" },
    ],
    capacity: "6 units · up to 16 guests",
    ctaNote: "Message us for an exact quote based on your dates and party size.",
  },
  location: {
    kicker: "Getting Here",
    heading: "Location",
    subheading: "11-ta St 2, Raduil village, Samokov municipality – in the heart of Rila Mountain.",
    distances: [
      { label: "From Sofia", value: "~55 min by car" },
      { label: "To Borovets", value: "~10 min by car" },
      { label: "To Musala (cable car)", value: "~20 min by car" },
    ],
    directionsTitle: "How to arrive",
    directionsText:
      "Via the \"Trakia\" (A1) motorway to Kostenets, then follow the signs to Samokov and Borovets. We send exact directions once your booking is confirmed.",
    mapCta: "Open in Google Maps",
    mapPlaceholderTitle: "The map loads from Google Maps",
    mapPlaceholderText: "Google only sets cookies once you load the map.",
    mapShowButton: "Show the map",
  },
  booking: {
    kicker: "Booking",
    heading: "Check Availability",
    subheading: "Pick your dates on the calendar and send a request – we reply personally within hours.",
    calendarLegend: { free: "Free", busy: "Booked", selected: "Selected" },
    calendarFallback: "Availability is confirmed by the host.",
    calendarLoading: "Loading availability…",
    form: {
      name: "Full name",
      phone: "Phone",
      email: "Email",
      checkIn: "Check-in",
      checkOut: "Check-out",
      adults: "Adults",
      children: "Children",
      message: "Message (optional)",
      messagePlaceholder: "Tell us about your trip – number of guests, occasion, special requests…",
      submit: "Send Request",
      submitting: "Sending…",
      successTitle: "We got your request!",
      successText: "We'll contact you within a few hours to confirm your booking.",
      successTextEmailFailed:
        "We received your request, but the automatic notification failed to send. To be safe, please call us at {phone}.",
      errorTitle: "Something went wrong",
      errorText: "Please try again or email us directly.",
      rateLimited: "You've sent too many requests. Please try again in an hour, or call us directly.",
      required: "This field is required.",
      invalidEmail: "Please enter a valid email address.",
      invalidPhone: "Please enter a valid phone number.",
      invalidDates: "Check-out date must be after check-in date.",
      dateConflict: "The selected dates are already booked. Please choose another period.",
      nameTooLong: "Name is too long (max 100 characters).",
      messageTooLong: "Message is too long (max 1000 characters).",
      invalidGuests: "Please enter a valid guest count.",
    },
  },
  footer: {
    tagline: "Your home in the foothills of Rila",
    contactsTitle: "Contact",
    address: "11-ta St 2, 2043 Raduil, Samokov municipality",
    followUs: "Follow us",
    rights: "All rights reserved.",
    bookingBadge: "Find us on Booking.com too",
  },
  common: {
    langSwitch: "BG",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { bg, en };
