import { z } from 'zod';

export const TerminalPolarityEnum = z.enum(['POSITIVE_RIGHT', 'POSITIVE_LEFT', 'CENTER']);
export const BatteryTechnologyEnum = z.enum(['SLI', 'EFB', 'AGM', 'GEL', 'VRLA']);
export const ContactChannelTypeEnum = z.enum(['whatsapp', 'phone']);
export const ContactPlacementEnum = z.enum(['header', 'footer', 'contact', 'services', 'all']);
export const ServiceStatusEnum = z.enum(['active', 'inactive']);
export const ProductStatusEnum = z.enum(['active', 'archived', 'draft']);
export const StockStatusEnum = z.enum(['in_stock', 'on_demand', 'out_of_stock']);
export const CompatibilityValidationStatusEnum = z.enum(['verified', 'pending', 'unverified']);

export const AnalyticsEventTypeEnum = z.enum([
  'page_view',
  'product_view',
  'catalog_search',
  'vehicle_search',
  'compatibility_result',
  'whatsapp_click',
  'phone_click',
  'service_request_click',
  'service_form_submit',
]);

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(10, 'Token inválido'),
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

// Category Schema
export const CategorySchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().trim().min(2).optional(),
  description: z.string().trim().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});

// Product Schema
export const ProductCreateSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z.string().trim().min(3).optional(),
  sku: z.string().trim().optional().nullable(),
  brand: z.string().trim().min(2, 'Marca obrigatória'),
  description: z.string().trim().min(5, 'Descrição deve ter pelo menos 5 caracteres'),
  amperageAh: z.coerce.number().positive('Amperagem deve ser positiva'),
  voltageV: z.coerce.number().int().positive().default(12),
  ccaA: z.coerce.number().int().positive().optional().nullable(),
  dimensionsMm: z.string().trim().optional().nullable(),
  warrantyMonths: z.coerce.number().int().positive().optional().nullable(),
  polarity: TerminalPolarityEnum.default('POSITIVE_RIGHT'),
  technology: BatteryTechnologyEnum.default('SLI'),
  isFeatured: z.boolean().default(false),
  stockStatus: StockStatusEnum.default('in_stock'),
  status: ProductStatusEnum.default('active'),
  internalCostNotes: z.string().trim().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).default([]),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

// Vehicle Schemas
export const VehicleMakeSchema = z.object({
  name: z.string().trim().min(2, 'Nome do fabricante obrigatório'),
  slug: z.string().trim().min(2).optional(),
});

export const VehicleModelSchema = z.object({
  makeId: z.string().uuid('ID do fabricante inválido'),
  name: z.string().trim().min(1, 'Nome do modelo obrigatório'),
  slug: z.string().trim().min(1).optional(),
});

export const VehicleVariantSchema = z.object({
  modelId: z.string().uuid('ID do modelo inválido'),
  name: z.string().trim().min(1, 'Nome da versão/motorização obrigatório'),
  yearStart: z.coerce.number().int().min(1950).max(2035),
  yearEnd: z.coerce.number().int().min(1950).max(2035).optional().nullable(),
  engine: z.string().trim().optional().nullable(),
  fuel: z.string().trim().optional().nullable(),
  version: z.string().trim().optional().nullable(),
  technicalNotes: z.string().trim().optional().nullable(),
});

export const CompatibilitySchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  vehicleVariantId: z.string().uuid('ID da variante do veículo inválido'),
  technicalNotes: z.string().trim().optional().nullable(),
  validationStatus: CompatibilityValidationStatusEnum.default('verified'),
});

// Service Schema
export const ServiceSchema = z.object({
  name: z.string().trim().min(3, 'Nome do serviço obrigatório'),
  slug: z.string().trim().min(3).optional(),
  description: z.string().trim().min(10, 'Descrição detalhada obrigatória'),
  iconName: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  regionServed: z.string().trim().default('Arapongas e região'),
  workingHours: z.string().trim().optional().nullable(),
  ctaText: z.string().trim().default('Solicitar Atendimento'),
  whatsappMessage: z.string().trim().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  status: ServiceStatusEnum.default('active'),
});

// Contact Channel Schema
export const ContactChannelSchema = z.object({
  label: z.string().trim().min(2, 'Rótulo obrigatório'),
  number: z.string().trim().min(8, 'Número inválido'),
  type: ContactChannelTypeEnum.default('whatsapp'),
  placement: ContactPlacementEnum.default('all'),
  isDefault: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});

// Site Settings Schema
export const SiteSettingsSchema = z.object({
  storeName: z.string().trim().min(2).default('Baterias Estrela'),
  tagline: z.string().trim().default('Sua loja de baterias automotivas em Arapongas'),
  address: z.string().trim().default('Rua Taperaçu 165, Vila Sampaio'),
  city: z.string().trim().default('Arapongas'),
  state: z.string().trim().default('PR'),
  postalCode: z.string().trim().default('86700-000'),
  workingHours: z.string().trim().default('Segunda a Sexta: 08h às 18h | Sábado: 08h às 12h'),
  email: z.string().trim().email().optional().nullable(),
  facebookUrl: z.string().trim().url().optional().nullable(),
  instagramUrl: z.string().trim().url().optional().nullable(),
  googleMapsUrl: z.string().trim().url().optional().nullable(),
  homeHeroTitle: z.string().trim().default('A Bateria Certa para o seu Veículo com Entrega e Instalação Grátis em Arapongas'),
  homeHeroSubtitle: z.string().trim().default('Trabalhamos com as melhores marcas do mercado. Socorro rápido, teste gratuito e garantia de fábrica.'),
  seoTitle: z.string().trim().default('Baterias Estrela | Loja e Socorro de Baterias em Arapongas - PR'),
  seoDescription: z.string().trim().default('Baterias automotivas Moura, Heliar, Bralmax e Zetta em Arapongas. Entrega e instalação rápida onde você estiver.'),
});

// Analytics Event Schema
export const AnalyticsEventSchema = z.object({
  eventType: AnalyticsEventTypeEnum,
  path: z.string().trim().default('/'),
  productId: z.string().uuid().optional().nullable(),
  serviceId: z.string().uuid().optional().nullable(),
  sessionId: z.string().trim().min(5).max(100),
  referrer: z.string().trim().max(500).optional().nullable(),
  utmSource: z.string().trim().max(100).optional().nullable(),
  utmMedium: z.string().trim().max(100).optional().nullable(),
  utmCampaign: z.string().trim().max(100).optional().nullable(),
  deviceCategory: z.enum(['mobile', 'desktop', 'tablet']).default('desktop'),
  metadata: z.record(z.any()).optional().nullable(),
});

// Service Request Schema
export const ServiceRequestSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatório'),
  phone: z.string().trim().min(8, 'Telefone obrigatório'),
  serviceId: z.string().uuid().optional().nullable(),
  vehicle: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  addressReference: z.string().trim().optional().nullable(),
});
