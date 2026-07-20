
// --- types ----------------------------------------------------
export type RestaurantImage = {
  id: string;
  url: string;
  sortOrder: number;
  restaurantId: string;
  createdAt: Date;
};

export type OperatingHours = {
  id: string;
  day: number; // 0 for Sunday, 1 for Monday, etc.
  isOpen: boolean;
  openTime: string; // "HH:MM" format
  closeTime: string; // "HH:MM" format
  restaurantId: string;
};

export type RestaurantSettingsType = {
  id: string;
  name: string;
  slug: string;
  description: string | null; // Optional Prisma fields map to string | null
  cuisineType: string;
  city: string;
  address: string | null;
  phone: string;
  logoUrl: string | null;
  coverImages: RestaurantImage[]; // Kept relation type
  operatingHours: OperatingHours[];

  isOpen: boolean;
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  deliveryFee: number; // Float maps to number
  minimumOrder: number; // Float maps to number
  estimatedTime: number; // Int maps to number

  acceptsCash: boolean;
  acceptsCard: boolean;
  acceptsOnline: boolean;
  
  createdAt: Date; // DateTime maps to Date
  updatedAt: Date;
};