import { AnalyticsEventType } from '@baterias-estrela/shared';
import { API_BASE_URL } from './api';

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('estrela_session_id');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      sessionStorage.setItem('estrela_session_id', sid);
    }
    return sid;
  } catch {
    return 'fallback_sid_' + Math.random().toString(36).substring(2, 10);
  }
}

function getDeviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getUtmParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

export function trackEvent(
  eventType: AnalyticsEventType,
  params: {
    path?: string;
    productId?: string | null;
    serviceId?: string | null;
    metadata?: Record<string, any> | null;
  } = {}
) {
  try {
    const payload = {
      eventType,
      path: params.path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      productId: params.productId || null,
      serviceId: params.serviceId || null,
      sessionId: getSessionId(),
      referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : null,
      deviceCategory: getDeviceCategory(),
      metadata: params.metadata || null,
      ...getUtmParams(),
    };

    // Usa fetch assíncrono com keepalive para garantir envio mesmo se página redirecionar
    fetch(`${API_BASE_URL}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Ignora erro de analytics silenciosamente para nunca travar a navegação do usuário
    });
  } catch {
    // Não interrompe o fluxo
  }
}

/**
 * Registra clique no WhatsApp e abre a janela com segurança
 */
export function handleWhatsAppClick(
  url: string,
  trackingParams?: { productId?: string; serviceId?: string; path?: string; metadata?: Record<string, any> }
) {
  trackEvent('whatsapp_click', trackingParams);
  // Abre o link
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Registra clique de ligação telefônica
 */
export function handlePhoneClick(
  phoneUrl: string,
  trackingParams?: { path?: string; metadata?: Record<string, any> }
) {
  trackEvent('phone_click', trackingParams);
  window.location.href = phoneUrl;
}
