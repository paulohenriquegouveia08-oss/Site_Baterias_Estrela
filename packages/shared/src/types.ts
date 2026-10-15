// Shared Types for Baterias Estrela

export type TerminalPolarity = 'POSITIVE_RIGHT' | 'POSITIVE_LEFT' | 'CENTER';
export type BatteryTechnology = 'SLI' | 'EFB' | 'AGM' | 'GEL' | 'VRLA';
export type ContactChannelType = 'whatsapp' | 'phone';
export type ContactPlacement = 'header' | 'footer' | 'contact' | 'services' | 'all';
export type ServiceStatus = 'active' | 'inactive';
export type ProductStatus = 'active' | 'archived' | 'draft';
export type StockStatus = 'in_stock' | 'on_demand' | 'out_of_stock';
export type CompatibilityValidationStatus = 'verified' | 'pending' | 'unverified';

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'catalog_search'
  | 'vehicle_search'
  | 'compatibility_result'
  | 'whatsapp_click'
  | 'phone_click'
  | 'service_request_click'
  | 'service_form_submit';

export interface PublicProductImage {
  id: string;
  url: string;
  altText?: string | null;
  displayOrder: number;
  isCover: boolean;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
}

export interface PublicVehicleMake {
  id: string;
  name: string;
  slug: string;
}

export interface PublicVehicleModel {
  id: string;
  makeId: string;
  name: string;
  slug: string;
}

export interface PublicVehicleVariant {
  id: string;
  modelId: string;
  name: string;
  yearStart: number;
  yearEnd?: number | null;
  engine?: string | null;
  fuel?: string | null;
  version?: string | null;
  technicalNotes?: string | null;
  makeName?: string;
  modelName?: string;
}

export interface PublicProductCompatibility {
  id: string;
  productId: string;
  vehicleVariantId: string;
  technicalNotes?: string | null;
  validationStatus: CompatibilityValidationStatus;
  vehicleVariant?: PublicVehicleVariant;
}

// NOTE: PublicProduct MUST NEVER have price fields!
export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  brand: string;
  description: string;
  amperageAh: number; // e.g. 60
  voltageV: number; // e.g. 12
  ccaA?: number | null; // e.g. 480
  dimensionsMm?: string | null; // e.g. "242 x 175 x 175"
  warrantyMonths?: number | null; // e.g. 18
  polarity: TerminalPolarity;
  technology: BatteryTechnology;
  isFeatured: boolean;
  stockStatus: StockStatus;
  images: PublicProductImage[];
  categories: PublicCategory[];
  compatibilitiesCount?: number;
  createdAt: string;
}

export interface PublicProductDetail extends PublicProduct {
  compatibilities: Array<{
    id: string;
    vehicleMake: string;
    vehicleModel: string;
    variantName: string;
    years: string;
    technicalNotes?: string | null;
  }>;
  relatedProducts?: PublicProduct[];
}

export interface AdminProduct extends PublicProduct {
  status: ProductStatus;
  internalCostNotes?: string | null;
  updatedAt: string;
}

export interface PublicService {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string | null;
  imageUrl?: string | null;
  regionServed: string;
  workingHours?: string | null;
  ctaText?: string | null;
  whatsappMessage?: string | null;
  displayOrder: number;
}

export interface PublicContactChannel {
  id: string;
  label: string;
  number: string;
  type: ContactChannelType;
  placement: ContactPlacement;
  isDefault: boolean;
  displayOrder: number;
}

export interface PublicSiteSettings {
  storeName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string | null;
  workingHours: string;
  email?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  googleMapsUrl?: string | null;
  homeHeroTitle?: string | null;
  homeHeroSubtitle?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface AnalyticsSummary {
  period: 'today' | '7d' | '30d' | 'custom';
  totalPageViews: number;
  estimatedUniqueVisitors: number;
  whatsappClicks: number;
  phoneClicks: number;
  productViews: number;
  vehicleSearches: number;
  unmatchedVehicleSearches: number;
  serviceInteractions: number;
  contactConversionRatePct: number;
}

export interface TimeSeriesPoint {
  date: string;
  pageViews: number;
  whatsappClicks: number;
  phoneClicks: number;
  vehicleSearches: number;
}

export interface TopProductItem {
  id: string;
  name: string;
  brand: string;
  views: number;
  whatsappClicks: number;
}

export interface TopPageItem {
  path: string;
  views: number;
}

export interface TrafficSourceItem {
  source: string;
  count: number;
  percentage: number;
}
