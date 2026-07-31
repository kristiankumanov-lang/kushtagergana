/**
 * Единствен източник на истина за оценките от Booking.com и Google.
 *
 * Как се обновява: при ново ревю просто смени числата по-долу (score,
 * reviewCount, стойностите в subcategories). Не се налага да пипаш никой
 * друг файл — секцията с оценки и badge-ът в Hero четат директно оттук.
 */
export const ratings = {
  booking: {
    score: 9.7,
    maxScore: 10,
    label: { bg: "Изключително", en: "Exceptional" },
    reviewCount: 17,
    // Ред на извеждане = ред на извеждане в интерфейса (най-силните първи).
    subcategories: {
      staff: 10.0,
      cleanliness: 9.9,
      facilities: 9.6,
      location: 9.6,
      valueForMoney: 9.6,
      comfort: 9.5,
    },
    // TODO: замени с реалния линк към обявата в Booking.com, когато го получим.
    url: "",
  },
  google: {
    score: 4.7,
    maxScore: 5,
    reviewCount: 65,
    // Директен линк към чист списък с отзивите (без карта/общ преглед).
    url: "https://search.google.com/local/reviews?placeid=ChIJvZF0Ur45qxQRHcH5kYYlOMg&q=Kashta+za+gosti+Gergana&hl=bg",
  },
} as const;

export type BookingSubcategoryKey = keyof typeof ratings.booking.subcategories;
