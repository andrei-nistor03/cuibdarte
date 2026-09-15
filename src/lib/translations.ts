export type Language = "ro" | "en";

type PhotoText = { alt: string; caption: string };

export type TranslationDict = {
  nav: {
    home: string;
    events: string;
    reservations: string;
    memories: string;
  };
  header: {
    openMenu: string;
    closeMenu: string;
    selectLanguage: string;
  };
  hero: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
  };
  events: {
    title: string;
    subtitle: string;
    instagramPost: string;
    seeOnInstagram: string;
  };
  reservation: {
    headline: string;
  };
  memories: {
    srHeading: string;
    archiveLabel: string;
    viewPhotoPrefix: string;
    enlargedPhoto: string;
    close: string;
    previousPhoto: string;
    nextPhoto: string;
    photos: Record<
      | "venue"
      | "people"
      | "drinks"
      | "band"
      | "shots"
      | "books"
      | "insta6"
      | "inside"
      | "insta9"
      | "insta10",
      PhotoText
    >;
  };
  footer: {
    credit: string;
  };
};

export const translations: Record<Language, TranslationDict> = {
  ro: {
    nav: {
      home: "Acasă",
      events: "Evenimente",
      reservations: "Rezervări",
      memories: "Amintiri",
    },
    header: {
      openMenu: "Deschide meniul",
      closeMenu: "Închide meniul",
      selectLanguage: "Selectează limba",
    },
    hero: {
      titleLine1: "Artă, băuturi",
      titleLine2: "& povești",
      subtitle:
        "Locul unde arta se intalneste cu oamenii si paharele nu sunt niciodata goale.",
    },
    events: {
      title: "postări & evenimente",
      subtitle: "Vezi ce se intampla in cuib",
      instagramPost: "Postare Instagram",
      seeOnInstagram: "Vezi pe Instagram",
    },
    reservation: {
      headline:
        "De obicei e greu să găsești o masă liberă, așa că asigură-te că faci o rezervare.",
    },
    memories: {
      srHeading: "Fotografii din Cuib d'Arte",
      archiveLabel: "Unde prietenii, bauturile si muzica devin amintiri.",
      viewPhotoPrefix: "Vezi fotografia",
      enlargedPhoto: "Fotografie mărită",
      close: "Închide",
      previousPhoto: "Fotografia anterioară",
      nextPhoto: "Fotografia următoare",
      photos: {
        venue: {
          alt: "Interiorul barului, seara",
          caption: "Unde începe noaptea",
        },
        people: {
          alt: "Prieteni la o seară în Cuib",
          caption: "Prieteni vechi, povești noi",
        },
        drinks: {
          alt: "Cocktailuri de casă",
          caption: "Încă unul, de drum",
        },
        band: {
          alt: "Trupă live pe scenă",
          caption: "Curent electric, inimi zgomotoase",
        },
        shots: {
          alt: "Un rând de shot-uri",
          caption: "Noroc pentru aproape orice",
        },
        books: {
          alt: "Colț de lectură",
          caption: "Colțuri liniștite, pagini îndrăgite",
        },
        insta6: {
          alt: "Seară de vară la Cuib",
          caption: "Pierduți în muzică",
        },
        inside: {
          alt: "Atmosfera din interior",
          caption: "Fiecare cameră are atmosfera ei",
        },
        insta9: {
          alt: "Moment surprins la Cuib d'Arte",
          caption: "Prinși în plin râs",
        },
        insta10: {
          alt: "Noapte de poveste la Cuib",
          caption: "Povești care merită repetate",
        },
      },
    },
    footer: {
      credit: "Proiectat și creat de",
    },
  },
  en: {
    nav: {
      home: "Home",
      events: "Events",
      reservations: "Reservations",
      memories: "Memories",
    },
    header: {
      openMenu: "Open menu",
      closeMenu: "Close menu",
      selectLanguage: "Select language",
    },
    hero: {
      titleLine1: "Art, drinks",
      titleLine2: "& stories",
      subtitle:
        "The place where art meets people, and the glasses are never empty.",
    },
    events: {
      title: "posts & events",
      subtitle: "See what's happening in the cuib",
      instagramPost: "Instagram post",
      seeOnInstagram: "See on Instagram",
    },
    reservation: {
      headline:
        "An empty table is usually hard to find so make sure to make a reservation",
    },
    memories: {
      srHeading: "Photos from Cuib d'Arte",
      archiveLabel: "Where friends, drinks and music become memories.",
      viewPhotoPrefix: "View photo",
      enlargedPhoto: "Enlarged photo",
      close: "Close",
      previousPhoto: "Previous photo",
      nextPhoto: "Next photo",
      photos: {
        venue: {
          alt: "Inside the bar, evening",
          caption: "Where the night begins",
        },
        people: {
          alt: "Friends on a night out at Cuib",
          caption: "Old friends, new stories",
        },
        drinks: {
          alt: "House cocktails",
          caption: "One more, for the road",
        },
        band: {
          alt: "Live band on stage",
          caption: "Live wires, loud hearts",
        },
        shots: {
          alt: "A round of shots",
          caption: "Cheers to almost anything",
        },
        books: {
          alt: "Reading corner",
          caption: "Quiet corners, favorite pages",
        },
        insta6: {
          alt: "Summer evening at Cuib",
          caption: "Lost in the music",
        },
        inside: {
          alt: "The atmosphere inside",
          caption: "Every room has a mood",
        },
        insta9: {
          alt: "A candid moment at Cuib d'Arte",
          caption: "Caught mid-laugh",
        },
        insta10: {
          alt: "A night to remember at Cuib",
          caption: "Stories worth repeating",
        },
      },
    },
    footer: {
      credit: "Designed and created by",
    },
  },
};
