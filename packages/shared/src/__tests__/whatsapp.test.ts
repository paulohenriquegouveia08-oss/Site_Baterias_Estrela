import { describe, it, expect } from 'vitest';
import {
  sanitizePhoneNumber,
  formatPhoneNumber,
  buildWhatsAppProductMessage,
  buildWhatsAppRescueMessage,
  buildWhatsAppLink,
} from '../whatsapp';

describe('WhatsApp and Phone Utilities', () => {
  it('sanitizes local brazilian phone without country code', () => {
    expect(sanitizePhoneNumber('43996110253')).toBe('5543996110253');
    expect(sanitizePhoneNumber('(43) 99611-0253')).toBe('5543996110253');
  });

  it('preserves phone that already has country code', () => {
    expect(sanitizePhoneNumber('5543991184520')).toBe('5543991184520');
    expect(sanitizePhoneNumber('+55 (43) 99118-4520')).toBe('5543991184520');
  });

  it('formats human readable phone number', () => {
    expect(formatPhoneNumber('43996110253')).toBe('(43) 99611-0253');
    expect(formatPhoneNumber('5543996110253')).toBe('(43) 99611-0253');
  });

  it('builds product inquiry message without price', () => {
    const msg = buildWhatsAppProductMessage({
      productName: 'Bateria Moura 60Ah M60GD',
      sku: 'M60GD',
      brand: 'Moura',
      amperageAh: 60,
      vehicleName: 'VW Gol 1.6 2018',
    });

    expect(msg).toContain('Bateria Moura 60Ah M60GD');
    expect(msg).toContain('Marca: Moura');
    expect(msg).toContain('60Ah');
    expect(msg).toContain('Cód/SKU: M60GD');
    expect(msg).toContain('Meu veículo é VW Gol 1.6 2018');
    expect(msg).toContain('Gostaria de consultar o preço e a disponibilidade');
    // Ensure no price is hardcoded or mentioned in message
    expect(msg).not.toMatch(/R\$/);
  });

  it('builds rescue message with GPS link if provided', () => {
    const msg = buildWhatsAppRescueMessage({
      problemType: 'Bateria arriada / sem partida',
      vehicle: 'Fiat Strada 2020',
      description: 'Estou estacionado próximo ao cemitério',
      latitude: -23.414,
      longitude: -51.428,
    });

    expect(msg).toContain('SOCORRO AUTOMOTIVO - BATERIAS ESTRELA');
    expect(msg).toContain('Fiat Strada 2020');
    expect(msg).toContain('https://maps.google.com/?q=-23.414,-51.428');
  });

  it('generates encoded wa.me URL correctly', () => {
    const link = buildWhatsAppLink('43996110253', 'Olá teste!');
    expect(link).toBe('https://wa.me/5543996110253?text=Ol%C3%A1%20teste!');
  });
});
