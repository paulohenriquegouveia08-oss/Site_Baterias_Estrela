// WhatsApp and Phone Utilities for Baterias Estrela

export interface WhatsAppProductMessageParams {
  productName: string;
  sku?: string | null;
  brand?: string | null;
  amperageAh?: number | null;
  vehicleName?: string | null;
  customNotes?: string | null;
}

export interface WhatsAppRescueMessageParams {
  problemType: string;
  vehicle?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  addressReference?: string | null;
}

export interface WhatsAppServiceMessageParams {
  serviceName: string;
  vehicle?: string | null;
  notes?: string | null;
}

/**
 * Limpa uma string de telefone, mantendo apenas os dígitos numéricos.
 * Se for número brasileiro com DDD (ex: 43996110253) e não começar com 55, adiciona 55 para o WhatsApp.
 */
export function sanitizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // Se já tem código de país 55 e tem 12 ou 13 dígitos
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Se tem DDD e número (10 ou 11 dígitos, ex: 43996110253)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Formata um número para exibição humana (ex: "(43) 99611-0253" ou "(43) 3275-0000")
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Remove 55 se estiver no início para exibição local amigável
  const localDigits = (digits.startsWith('55') && digits.length >= 12) ? digits.slice(2) : digits;

  if (localDigits.length === 11) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
  }
  if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
  }
  return phone;
}

/**
 * Gera a mensagem padrão para consulta de produto no WhatsApp
 */
export function buildWhatsAppProductMessage(params: WhatsAppProductMessageParams): string {
  const { productName, sku, brand, amperageAh, vehicleName, customNotes } = params;

  let details = productName;
  const tags: string[] = [];
  if (brand) tags.push(`Marca: ${brand}`);
  if (amperageAh) tags.push(`${amperageAh}Ah`);
  if (sku) tags.push(`Cód/SKU: ${sku}`);

  if (tags.length > 0) {
    details += ` (${tags.join(' | ')})`;
  }

  let msg = `Olá! Gostaria de consultar o preço e a disponibilidade da bateria ${details}.`;

  if (vehicleName && vehicleName.trim().length > 0) {
    msg += ` Meu veículo é ${vehicleName.trim()}.`;
  }

  if (customNotes && customNotes.trim().length > 0) {
    msg += ` Observação: ${customNotes.trim()}`;
  }

  msg += ` Poderiam me ajudar?`;
  return msg;
}

/**
 * Gera a mensagem padrão para socorro automotivo emergencial
 */
export function buildWhatsAppRescueMessage(params: WhatsAppRescueMessageParams): string {
  const { problemType, vehicle, description, latitude, longitude, addressReference } = params;

  let msg = `🚨 *SOCORRO AUTOMOTIVO - BATERIAS ESTRELA*\n\n`;
  msg += `Olá, preciso de atendimento emergencial em Arapongas/região.\n`;
  msg += `*Problema:* ${problemType}\n`;

  if (vehicle && vehicle.trim()) {
    msg += `*Veículo:* ${vehicle.trim()}\n`;
  }

  if (description && description.trim()) {
    msg += `*Detalhes:* ${description.trim()}\n`;
  }

  if (addressReference && addressReference.trim()) {
    msg += `*Ponto de Referência:* ${addressReference.trim()}\n`;
  }

  if (latitude != null && longitude != null) {
    msg += `*Localização GPS:* https://maps.google.com/?q=${latitude},${longitude}\n`;
  }

  msg += `\nFavor me informar a disponibilidade para atendimento.`;
  return msg;
}

/**
 * Gera mensagem para solicitação de serviços (ex: teste gratuito, troca preventiva)
 */
export function buildWhatsAppServiceMessage(params: WhatsAppServiceMessageParams): string {
  const { serviceName, vehicle, notes } = params;
  let msg = `Olá! Gostaria de informações sobre o serviço de *${serviceName}* da Baterias Estrela.`;

  if (vehicle && vehicle.trim()) {
    msg += ` Meu veículo é ${vehicle.trim()}.`;
  }

  if (notes && notes.trim()) {
    msg += ` Observação: ${notes.trim()}.`;
  }

  msg += ` Como funciona o agendamento/atendimento?`;
  return msg;
}

/**
 * Constrói o link oficial do WhatsApp wa.me com número validado e mensagem codificada em URL
 */
export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  const sanitized = sanitizePhoneNumber(phoneNumber);
  if (!sanitized) return '#';
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${sanitized}?text=${encodedText}`;
}

/**
 * Constrói o link de discagem rápida tel:
 */
export function buildTelLink(phoneNumber: string): string {
  const digits = phoneNumber.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}
