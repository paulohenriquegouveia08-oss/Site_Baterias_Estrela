import { API_BASE_URL } from './api';

/**
 * Resolve qualquer URL de imagem para garantir que caminhos relativos de upload
 * apontem corretamente para o servidor da API (VPS) e nunca causem links quebrados.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    // API_BASE_URL pode ser '/api/v1' ou 'https://137-131-233-254.sslip.io/baterias-api/api/v1'
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${base}${url}`;
  }
  return url;
}
