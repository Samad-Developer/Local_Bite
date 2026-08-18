export type RestaurantImage = {
  id: string;
  url: string;
  sortOrder: number;
  restaurantId: string;
  createdAt: Date;
};

export type OperatingHours = {
  id: string;
  day: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  restaurantId: string;
};

export type RestaurantSettingsType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisineType: string;
  city: string;
  address: string | null;
  phone: string;
  logoUrl: string | null;
  coverImages: RestaurantImage[];
  operatingHours: OperatingHours[];

  isOpen: boolean;
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedTime: number;

  acceptsCash: boolean;
  acceptsCard: boolean;
  acceptsOnline: boolean;
  
  createdAt: Date;
  updatedAt: Date;
};
