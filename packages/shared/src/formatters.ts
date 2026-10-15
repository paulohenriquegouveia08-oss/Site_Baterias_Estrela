// Helper formatters for automotive battery attributes

import { BatteryTechnology, TerminalPolarity } from './types';

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatPolarityLabel(polarity: TerminalPolarity): string {
  switch (polarity) {
    case 'POSITIVE_RIGHT':
      return 'Pólo Positivo Direito (D)';
    case 'POSITIVE_LEFT':
      return 'Pólo Positivo Esquerdo (E)';
    case 'CENTER':
      return 'Pólos Centrais';
    default:
      return polarity;
  }
}

export function formatTechnologyLabel(tech: BatteryTechnology): string {
  switch (tech) {
    case 'SLI':
      return 'Convencional (SLI)';
    case 'EFB':
      return 'EFB (Start-Stop)';
    case 'AGM':
      return 'AGM (Alta Performance / Start-Stop)';
    case 'GEL':
      return 'Gel / Ciclo Profundo';
    case 'VRLA':
      return 'VRLA Selada';
    default:
      return tech;
  }
}

export function formatWarrantyLabel(months?: number | null): string {
  if (!months) return 'Sob consulta';
  if (months === 12) return '1 ano de garantia';
  if (months === 18) return '18 meses de garantia';
  if (months === 24) return '2 anos de garantia';
  return `${months} meses de garantia`;
}
