export interface TourPlanDay {
  id: number;
  tourPackageId: string;
  dayNumber: number;
  title: string | null;
  description: string | null;
  items: string[];
  boldtext: string | null;
}

export interface TourPackage {
  id: string;
  slugUrl: string;
  imageUrl: string | null;
  tourTitle: string;
  tourDescription: string | null;
  tourDuration: number | null;
  tourDestination: string;
  tourPrice: Record<string, unknown> | null;
  tourRating: number | null;
  included: string[];
  excluded: string[];
  tourDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  tourPlanDays: TourPlanDay[];
}

export const mockTours: TourPackage[] = [
  {
    id: "1",
    slugUrl: "historical-tour-ethiopia",
    imageUrl:
      "https://images.unsplash.com/photo-1523805009345-7448845a9e53?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tourTitle: "Historical Tour of Ethiopia",
    tourDescription:
      "Explore the ancient wonders of Ethiopia including the rock-hewn churches of Lalibela and the obelisks of Axum.",
    tourDuration: 7,
    tourDestination: "Lalibela, Axum",
    tourPrice: { price: 1200 },
    tourRating: 4.8,
    included: ["Hotel Accommodation", "Transport", "Tour Guide", "Meals"],
    excluded: ["Flights", "Travel Insurance", "Personal Expenses"],
    tourDocumentUrl: null,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    tourPlanDays: [
      {
        id: 101,
        tourPackageId: "1",
        dayNumber: 1,
        title: "Arrival in Addis Ababa",
        description:
          "Welcome to Ethiopia! Transfer to hotel and evening briefing.",
        items: ["Airport pickup", "Hotel check-in", "Welcome dinner"],
        boldtext: "Start of journey",
      },
      {
        id: 102,
        tourPackageId: "1",
        dayNumber: 2,
        title: "Fly to Lalibela",
        description:
          "Morning flight to Lalibela. Afternoon visit to the first group of churches.",
        items: ["Domestic flight", "Church visits", "Local lunch"],
        boldtext: null,
      },
      {
        id: 103,
        tourPackageId: "1",
        dayNumber: 3,
        title: "Lalibela Churches",
        description: "Full day exploring the remaining rock-hewn churches.",
        items: ["Second group churches", "Bet Giyorgis", "Photography time"],
        boldtext: null,
      },
    ],
  },
  {
    id: "2",
    slugUrl: "omo-valley-adventure",
    imageUrl:
      "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tourTitle: "Omo Valley Cultural Adventure",
    tourDescription:
      "Immerse yourself in the diverse tribal cultures of the Omo Valley in southern Ethiopia.",
    tourDuration: 5,
    tourDestination: "Omo Valley",
    tourPrice: { price: 950, earlyBird: 850 },
    tourRating: 4.5,
    included: ["Camping Gear", "Transport", "Local Guide"],
    excluded: ["Flights", "Meals", "Tips"],
    tourDocumentUrl: "https://example.com/itinerary/omo-valley.pdf",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
    tourPlanDays: [
      {
        id: 201,
        tourPackageId: "2",
        dayNumber: 1,
        title: "Drive to Arba Minch",
        description: "Scenic drive south, stopping at Lake Langano for lunch.",
        items: [
          "Depart Addis Ababa",
          "Lunch at Lake Langano",
          "Arrive Arba Minch",
        ],
        boldtext: "Gateway to the South",
      },
      {
        id: 202,
        tourPackageId: "2",
        dayNumber: 2,
        title: "Dorze Village & Weaving",
        description:
          "Visit the famous Dorze people and their beehive-shaped huts.",
        items: [
          "Dorze village tour",
          "Cotton weaving demonstration",
          "Cultural coffee ceremony",
        ],
        boldtext: null,
      },
      {
        id: 203,
        tourPackageId: "2",
        dayNumber: 3,
        title: "Jinka & Aari Market",
        description:
          "Continue to Jinka, visit a local market, and prepare for Omo Valley tribes.",
        items: [
          "Scenic drive to Jinka",
          "Explore Aari market",
          "Overnight at Jinka lodge",
        ],
        boldtext: "Tribal encounters ahead",
      },
      {
        id: 204,
        tourPackageId: "2",
        dayNumber: 4,
        title: "Mursi Village Visit",
        description: "Meet the Mursi people, famous for their lip plates.",
        items: ["Mursi village", "Interaction with tribe", "Back to Jinka"],
        boldtext: "Unique cultural experience",
      },
      {
        id: 205,
        tourPackageId: "2",
        dayNumber: 5,
        title: "Return to Addis Ababa",
        description: "Fly back from Jinka via Arba Minch.",
        items: [
          "Morning flight to Addis",
          "Transfer to hotel",
          "Farewell dinner",
        ],
        boldtext: null,
      },
    ],
  },
  {
    id: "3",
    slugUrl: "simien-mountains-trek",
    imageUrl:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tourTitle: "Simien Mountains Trek",
    tourDescription:
      "Trek through the stunning Simien Mountains, a UNESCO World Heritage Site.",
    tourDuration: 10,
    tourDestination: "Simien Mountains",
    tourPrice: { price: 1800, group: 1600 },
    tourRating: 4.9,
    included: ["Camping", "Cook", "Guide", "Pack Animals"],
    excluded: ["Flights", "Sleeping Bag Rental"],
    tourDocumentUrl: null,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
    tourPlanDays: [
      {
        id: 301,
        tourPackageId: "3",
        dayNumber: 1,
        title: "Gondar to Sankaber",
        description: "Drive to park entrance, start trek to Sankaber camp.",
        items: [
          "Drive from Gondar",
          "Register at park office",
          "Trek to Sankaber (3–4 hrs)",
        ],
        boldtext: "Enter the mountains",
      },
      {
        id: 302,
        tourPackageId: "3",
        dayNumber: 2,
        title: "Sankaber to Geech",
        description: "Trek through afro-alpine forest, spot gelada baboons.",
        items: ["Morning hike", "Giant lobelia fields", "Arrive Geech camp"],
        boldtext: "Land of the gelada",
      },
      {
        id: 303,
        tourPackageId: "3",
        dayNumber: 3,
        title: "Geech to Chennek via Imet Gogo",
        description: "Spectacular views from Imet Gogo, descend to Chennek.",
        items: [
          "Sunrise at Imet Gogo",
          "Photography stop",
          "Arrive Chennek camp",
        ],
        boldtext: "Best viewpoint in the mountains",
      },
      {
        id: 304,
        tourPackageId: "3",
        dayNumber: 4,
        title: "Chennek to Addis",
        description: "Descend and drive back to Gondar, fly to Addis.",
        items: [
          "Morning hike down",
          "Drive to Gondar",
          "Flight to Addis",
          "Farewell dinner",
        ],
        boldtext: "End of trek",
      },
    ],
  },
  {
    id: "4",
    slugUrl: "danakil-depression-expedition",
    imageUrl:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tourTitle: "Danakil Depression Expedition",
    tourDescription:
      "Visit one of the hottest and most alien landscapes on Earth.",
    tourDuration: 4,
    tourDestination: "Danakil Depression",
    tourPrice: { price: 700, group: 600 },
    tourRating: 4.3,
    included: ["Transport", "Guide", "Water"],
    excluded: ["Flights", "Personal Gear"],
    tourDocumentUrl: null,
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
    tourPlanDays: [
      {
        id: 401,
        tourPackageId: "4",
        dayNumber: 1,
        title: "Drive to Mekele",
        description: "Fly to Mekele and drive to Hamedela.",
        items: ["Flight to Mekele", "4x4 drive to Hamedela", "Camp overnight"],
        boldtext: "Into the desert",
      },
      {
        id: 402,
        tourPackageId: "4",
        dayNumber: 2,
        title: "Dallol & Lake Asale",
        description: "Explore colorful sulfur springs and salt flats.",
        items: [
          "Visit Dallol hydrothermal field",
          "Walk on salt flats",
          "Sunset at Lake Asale",
        ],
        boldtext: "Otherworldly landscape",
      },
      {
        id: 403,
        tourPackageId: "4",
        dayNumber: 3,
        title: "Erta Ale Volcano",
        description: "Trek to the active lava lake.",
        items: ["Drive to base camp", "Evening trek to crater", "Camp at rim"],
        boldtext: "Meet the lava lake",
      },
      {
        id: 404,
        tourPackageId: "4",
        dayNumber: 4,
        title: "Return to Mekele",
        description: "Descend and drive back.",
        items: ["Sunrise at volcano", "Drive to Mekele", "Fly to Addis"],
        boldtext: null,
      },
    ],
  },
  {
    id: "5",
    slugUrl: "bale-mountains-wildlife",
    imageUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tourTitle: "Bale Mountains Wildlife Safari",
    tourDescription:
      "Spot Ethiopian wolves and other endemic wildlife in the Bale Mountains.",
    tourDuration: 6,
    tourDestination: "Bale Mountains",
    tourPrice: { price: 1100 },
    tourRating: 4.6,
    included: ["Lodge Accommodation", "Guide", "Transport", "Park Fees"],
    excluded: ["Flights", "Drinks", "Tips"],
    tourDocumentUrl: "https://example.com/bale-itinerary.pdf",
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
    tourPlanDays: [
      {
        id: 501,
        tourPackageId: "5",
        dayNumber: 1,
        title: "Addis to Dinsho",
        description: "Drive to Bale Mountains National Park HQ.",
        items: [
          "Scenic drive",
          "Arrive at Dinsho lodge",
          "Short wildlife walk",
        ],
        boldtext: "Park entrance",
      },
      {
        id: 502,
        tourPackageId: "5",
        dayNumber: 2,
        title: "Sanetti Plateau",
        description: "Search for Ethiopian wolves and giant mole rats.",
        items: ["4x4 drive to plateau", "Wildlife spotting", "Picnic lunch"],
        boldtext: "Highest plateau in Africa",
      },
      {
        id: 503,
        tourPackageId: "5",
        dayNumber: 3,
        title: "Harenna Forest",
        description:
          "Explore the lush Harenna Forest, home to many birds and monkeys.",
        items: ["Forest hike", "Waterfall visit", "Camp overnight"],
        boldtext: "Jungle experience",
      },
      {
        id: 504,
        tourPackageId: "5",
        dayNumber: 4,
        title: "Return to Dinsho",
        description: "Drive back, stop at viewpoints.",
        items: ["Morning forest walk", "Scenic drive", "Lodge relaxation"],
        boldtext: null,
      },
      {
        id: 505,
        tourPackageId: "5",
        dayNumber: 5,
        title: "Sof Omar Caves",
        description:
          "Optional excursion to the longest cave system in Ethiopia.",
        items: ["Drive to Sof Omar", "Guided cave tour", "Return to lodge"],
        boldtext: "Underground wonders",
      },
      {
        id: 506,
        tourPackageId: "5",
        dayNumber: 6,
        title: "Return to Addis",
        description: "Drive back to Addis Ababa.",
        items: ["Breakfast", "Scenic drive", "Drop-off at hotel/airport"],
        boldtext: "Farewell",
      },
    ],
  },
  {
    id: "6",
    slugUrl: "harar-cultural-tour",
    imageUrl:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tourTitle: "Harar Cultural Discovery",
    tourDescription:
      "Explore the ancient walled city of Harar and its vibrant markets.",
    tourDuration: 3,
    tourDestination: "Harar",
    tourPrice: { price: 450 },
    tourRating: 4.4,
    included: ["Hotel", "Guide", "Hyena Feeding Experience"],
    excluded: ["Flights", "Meals"],
    tourDocumentUrl: null,
    createdAt: "2024-04-15T00:00:00Z",
    updatedAt: "2024-04-15T00:00:00Z",
    tourPlanDays: [
      {
        id: 601,
        tourPackageId: "6",
        dayNumber: 1,
        title: "Fly to Dire Dawa & Drive to Harar",
        description: "Arrive in Dire Dawa, transfer to Harar.",
        items: [
          "Flight to Dire Dawa",
          "Scenic drive (1 hour)",
          "Check into heritage hotel",
        ],
        boldtext: "Enter the walled city",
      },
      {
        id: 602,
        tourPackageId: "6",
        dayNumber: 2,
        title: "Harar Jugol Exploration",
        description:
          "Walk through the old city with its 82 mosques and shrines.",
        items: [
          "Visit Rimbaud's house",
          "Explore colorful markets",
          "Coffee ceremony in a traditional Harari home",
        ],
        boldtext: "A living museum",
      },
      {
        id: 603,
        tourPackageId: "6",
        dayNumber: 3,
        title: "Hyena Man & Departure",
        description: "Early morning hyena feeding, then return to Dire Dawa.",
        items: [
          "Sunrise hyena feeding experience",
          "Free time for souvenirs",
          "Transfer to Dire Dawa airport",
          "Flight to Addis",
        ],
        boldtext: "Unforgettable wildlife encounter",
      },
    ],
  },
];
