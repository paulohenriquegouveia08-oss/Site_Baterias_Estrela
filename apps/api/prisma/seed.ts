import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⚡ Iniciando seed de Baterias Estrela (Arapongas - PR)...');

  // 1. Admin inicial
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@bateriasestrela.com.br';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Estrela@Admin2026';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Administrador Baterias Estrela';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: adminName,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: adminName,
      role: 'admin',
      isActive: true,
    },
  });
  console.log(`✅ Administrador pronto: ${admin.email}`);

  // 2. Configurações do site (Baterias Estrela)
  const settingsList = await prisma.siteSettings.findMany();
  if (settingsList.length === 0) {
    await prisma.siteSettings.create({
      data: {
        storeName: 'Baterias Estrela Mendes',
        tagline: 'Sua loja de baterias automotivas em Arapongas - PR',
        address: 'Rua Taperaçu 165, Vila Sampaio',
        city: 'Arapongas',
        state: 'PR',
        postalCode: '86700-000',
        workingHours: 'Segunda a Sexta: 08:00 às 19:00 | Sábado: 08:00 às 13:00',
        email: 'contato@bateriasestrela.com.br',
        homeHeroTitle: 'A Bateria Certa para o seu Veículo com Entrega e Instalação Grátis em Arapongas',
        homeHeroSubtitle: 'Trabalhamos com marcas consagradas na região como Moura, Zetta, Heliar, Pioneiro, Eletran, entre muitas outras. Entrega e instalação gratuita em Arapongas com teste de carga e preservação da memória de bordo.',
        seoTitle: 'Baterias Estrela | Loja e Socorro de Baterias em Arapongas - PR',
        seoDescription: 'Baterias automotivas em Arapongas - PR. Entrega e instalação grátis em toda a cidade, teste gratuito e garantia de fábrica. Atendimento via WhatsApp!',
      },
    });
    console.log('✅ Configurações do site inseridas.');
  }

  // 3. Canais de Contato
  await prisma.contactChannel.deleteMany();
  await prisma.contactChannel.createMany({
    data: [
      {
        label: 'WhatsApp Plantão & Vendas',
        number: '43996110253',
        type: 'whatsapp',
        placement: 'all',
        isDefault: true,
        displayOrder: 1,
        status: 'active',
      },
      {
        label: 'Telefone Principal',
        number: '43996110253',
        type: 'phone',
        placement: 'header',
        isDefault: true,
        displayOrder: 2,
        status: 'active',
      },
      {
        label: 'Telefone Secundário / Atendimento',
        number: '43991184520',
        type: 'phone',
        placement: 'contact',
        isDefault: false,
        displayOrder: 3,
        status: 'active',
      },
    ],
  });
  console.log('✅ Canais de contato configurados (43 99611-0253 / 43 99118-4520).');

  // 4. Categorias
  const catLeves = await prisma.category.upsert({
    where: { slug: 'automotivas-leves' },
    update: {},
    create: {
      name: 'Baterias Automotivas Leves',
      slug: 'automotivas-leves',
      description: 'Baterias para veículos de passeio, hatches e sedãs convencionais (40Ah a 65Ah).',
      displayOrder: 1,
      status: 'active',
    },
  });

  const catStartStop = await prisma.category.upsert({
    where: { slug: 'start-stop' },
    update: {},
    create: {
      name: 'Baterias Start-Stop (EFB / AGM)',
      slug: 'start-stop',
      description: 'Tecnologia avançada para veículos equipados com sistema start-stop inteligente e alta demanda elétrica.',
      displayOrder: 2,
      status: 'active',
    },
  });

  const catSuv = await prisma.category.upsert({
    where: { slug: 'caminhoes-e-pesados' },
    update: {},
    create: {
      name: 'Baterias para Caminhões e Pesados',
      slug: 'caminhoes-e-pesados',
      description: 'Alta amperagem e máxima robustez para caminhões, ônibus, tratores e linha pesada (90Ah a 220Ah).',
      displayOrder: 3,
      status: 'active',
    },
  });

  const catMotos = await prisma.category.upsert({
    where: { slug: 'motos' },
    update: {},
    create: {
      name: 'Baterias para Motocicletas',
      slug: 'motos',
      description: 'Baterias seladas e livres de manutenção para motos de todas as cilindradas.',
      displayOrder: 4,
      status: 'active',
    },
  });

  // 5. Serviços
  await prisma.service.deleteMany();
  await prisma.service.createMany({
    data: [
      {
        name: 'Entrega e Instalação Grátis em Arapongas',
        slug: 'entrega-e-instalacao-gratis',
        description: 'Levamos a bateria até você em qualquer bairro de Arapongas sem custo de taxa de entrega. Realizamos a troca técnica utilizando bateria auxiliar para preservar as memórias de bordo e injeção do seu veículo.',
        iconName: 'Truck',
        regionServed: 'Arapongas e proximidades',
        workingHours: 'Seg a Sex das 08h às 19h | Sáb até 13h',
        ctaText: 'Pedir Bateria em Casa',
        whatsappMessage: 'Olá! Gostaria de solicitar a entrega e instalação de bateria no meu endereço em Arapongas.',
        displayOrder: 1,
        status: 'active',
      },
      {
        name: 'Socorro Automotivo para Baterias',
        slug: 'socorro-automotivo-emergencial',
        description: 'O carro não pega na garagem ou parou no trânsito? Acione nosso socorro rápido exclusivo para baterias. Levamos equipamento de teste e a bateria compatível para você voltar a rodar no menor tempo possível.',
        iconName: 'Zap',
        regionServed: 'Arapongas',
        workingHours: 'Seg a Sáb das 08h às 19h',
        ctaText: 'Chamar Socorro de Bateria',
        whatsappMessage: 'URGENTE: Preciso de socorro automotivo para bateria descarregada.',
        displayOrder: 2,
        status: 'active',
      },
      {
        name: 'Teste Computadorizado de Bateria e Alternador',
        slug: 'teste-gratuito-bateria-alternador',
        description: 'Não troque de bateria sem ter certeza! Realizamos o teste gratuito de condutância e teste de carga do alternador com laudo instantâneo na nossa loja física ou durante os atendimentos de entrega/socorro.',
        iconName: 'Gauge',
        regionServed: 'Na loja ou durante atendimento',
        workingHours: 'Horário comercial',
        ctaText: 'Ver Como Chegar à Loja',
        whatsappMessage: 'Olá! Gostaria de tirar dúvidas sobre o teste computadorizado de bateria na loja física da Baterias Estrela.',
        displayOrder: 3,
        status: 'active',
      },
      {
        name: 'Instalação Técnica com Preservação de Memória',
        slug: 'instalacao-tecnica-memoria',
        description: 'Ao substituir a bateria, conectamos uma bateria auxiliar ao sistema do carro para manter alimentados o módulo de injeção eletrônica (ECU), relógio, multimídia e memórias de bordo, prevenindo códigos de falha e desprogramação.',
        iconName: 'ShieldCheck',
        regionServed: 'Loja e atendimentos móveis',
        workingHours: 'Seg a Sex das 08h às 19h | Sáb até 13h',
        ctaText: 'Consultar Instalação',
        whatsappMessage: 'Olá! Gostaria de saber mais sobre a troca de bateria com preservação de memória de bordo.',
        displayOrder: 4,
        status: 'active',
      },
    ],
  });
  console.log('✅ Serviços cadastrados.');

  // 6. Fabricantes, Modelos e Variantes de Veículos
  console.log('🚗 Cadastrando base técnica de veículos...');

  // Fabricantes
  const makeVw = await prisma.vehicleMake.upsert({
    where: { slug: 'volkswagen' },
    update: {},
    create: { name: 'Volkswagen', slug: 'volkswagen' },
  });

  const makeFiat = await prisma.vehicleMake.upsert({
    where: { slug: 'fiat' },
    update: {},
    create: { name: 'Fiat', slug: 'fiat' },
  });

  const makeGm = await prisma.vehicleMake.upsert({
    where: { slug: 'chevrolet' },
    update: {},
    create: { name: 'Chevrolet', slug: 'chevrolet' },
  });

  const makeToyota = await prisma.vehicleMake.upsert({
    where: { slug: 'toyota' },
    update: {},
    create: { name: 'Toyota', slug: 'toyota' },
  });

  const makeHyundai = await prisma.vehicleMake.upsert({
    where: { slug: 'hyundai' },
    update: {},
    create: { name: 'Hyundai', slug: 'hyundai' },
  });

  // Modelos & Variantes
  // VW Gol
  const modelGol = await prisma.vehicleModel.upsert({
    where: { makeId_slug: { makeId: makeVw.id, slug: 'gol' } },
    update: {},
    create: { makeId: makeVw.id, name: 'Gol', slug: 'gol' },
  });

  const varGol10 = await prisma.vehicleVariant.create({
    data: {
      modelId: modelGol.id,
      name: 'Gol 1.0 Total Flex (G5 / G6 / G7)',
      yearStart: 2008,
      yearEnd: 2022,
      engine: '1.0 8V / 12V Flex',
      fuel: 'Flex',
      technicalNotes: 'Bateria recomendada de 60Ah com pólo positivo direito para maior durabilidade com ar-condicionado.',
    },
  });

  const varGol16 = await prisma.vehicleVariant.create({
    data: {
      modelId: modelGol.id,
      name: 'Gol 1.6 MSI Flex (G5 / G6 / G7)',
      yearStart: 2008,
      yearEnd: 2022,
      engine: '1.6 EA111 / MSI',
      fuel: 'Flex',
      technicalNotes: '60Ah recomendada.',
    },
  });

  // VW Polo TSI Start-Stop
  const modelPolo = await prisma.vehicleModel.upsert({
    where: { makeId_slug: { makeId: makeVw.id, slug: 'polo' } },
    update: {},
    create: { makeId: makeVw.id, name: 'Polo', slug: 'polo' },
  });

  const varPoloTsi = await prisma.vehicleVariant.create({
    data: {
      modelId: modelPolo.id,
      name: 'Polo 1.0 TSI (Com Sistema Start-Stop)',
      yearStart: 2018,
      yearEnd: 2024,
      engine: '1.0 200 TSI Turbo',
      fuel: 'Flex',
      version: 'Comfortline / Highline TSI',
      technicalNotes: 'Exige obrigatoriamente tecnologia EFB ou AGM homologada para Start-Stop.',
    },
  });

  // Fiat Strada
  const modelStrada = await prisma.vehicleModel.upsert({
    where: { makeId_slug: { makeId: makeFiat.id, slug: 'strada' } },
    update: {},
    create: { makeId: makeFiat.id, name: 'Strada', slug: 'strada' },
  });

  const varStradaFire = await prisma.vehicleVariant.create({
    data: {
      modelId: modelStrada.id,
      name: 'Strada 1.4 Fire / Hard Working',
      yearStart: 2010,
      yearEnd: 2020,
      engine: '1.4 Fire 8V',
      fuel: 'Flex',
      technicalNotes: 'Caixa convencional 60Ah pólo direito.',
    },
  });

  const varStradaFirefly = await prisma.vehicleVariant.create({
    data: {
      modelId: modelStrada.id,
      name: 'Nova Strada 1.3 Firefly',
      yearStart: 2020,
      yearEnd: 2024,
      engine: '1.3 Firefly',
      fuel: 'Flex',
      technicalNotes: '60Ah com partida a frio elétrica.',
    },
  });

  // Fiat Uno
  const modelUno = await prisma.vehicleModel.upsert({
    where: { makeId_slug: { makeId: makeFiat.id, slug: 'uno' } },
    update: {},
    create: { makeId: makeFiat.id, name: 'Uno', slug: 'uno' },
  });

  const varUnoFire = await prisma.vehicleVariant.create({
    data: {
      modelId: modelUno.id,
      name: 'Uno 1.0 Fire Economy / Vivace',
      yearStart: 2004,
      yearEnd: 2016,
      engine: '1.0 Fire',
      fuel: 'Flex',
      technicalNotes: 'Compatível com baterias de 48Ah a 60Ah.',
    },
  });

  // Chevrolet Onix
  const modelOnix = await prisma.vehicleModel.upsert({
    where: { makeId_slug: { makeId: makeGm.id, slug: 'onix' } },
    update: {},
    create: { makeId: makeGm.id, name: 'Onix', slug: 'onix' },
  });

  const varOnixG1 = await prisma.vehicleVariant.create({
    data: {
      modelId: modelOnix.id,
      name: 'Onix 1.0 / 1.4 (Geração 1 / Joy)',
      yearStart: 2012,
      yearEnd: 2019,
      engine: '1.0 / 1.4 SPE/4',
      fuel: 'Flex',
      technicalNotes: 'Pólo positivo direito, padrão 60Ah.',
    },
  });

  const varOnixTurbo = await prisma.vehicleVariant.create({
    data: {
      modelId: modelOnix.id,
      name: 'Novo Onix 1.0 Turbo (Com Start-Stop)',
      yearStart: 2020,
      yearEnd: 2024,
      engine: '1.0 Turbo 3 Cilindros',
      fuel: 'Flex',
      technicalNotes: 'Obrigatoriamente bateria EFB de alta ciclicidade.',
    },
  });

  // Toyota Corolla
  const modelCorolla = await prisma.vehicleModel.upsert({
    where: { makeId_slug: { makeId: makeToyota.id, slug: 'corolla' } },
    update: {},
    create: { makeId: makeToyota.id, name: 'Corolla', slug: 'corolla' },
  });

  const varCorolla20 = await prisma.vehicleVariant.create({
    data: {
      modelId: modelCorolla.id,
      name: 'Corolla 1.8 / 2.0 Dual VVT-i (GLi / XEi / Altis)',
      yearStart: 2009,
      yearEnd: 2019,
      engine: '1.8 / 2.0 16V Flex',
      fuel: 'Flex',
      technicalNotes: 'Caixa JIS/baixa 60Ah com pólo direito.',
    },
  });

  // Toyota Hilux
  const modelHilux = await prisma.vehicleModel.upsert({
    where: { makeId_slug: { makeId: makeToyota.id, slug: 'hilux' } },
    update: {},
    create: { makeId: makeToyota.id, name: 'Hilux', slug: 'hilux' },
  });

  const varHiluxDiesel = await prisma.vehicleVariant.create({
    data: {
      modelId: modelHilux.id,
      name: 'Hilux 2.8 Turbo Diesel D-4D 4x4',
      yearStart: 2016,
      yearEnd: 2024,
      engine: '2.8 Turbo Diesel',
      fuel: 'Diesel',
      technicalNotes: 'Exige alta capacidade de partida (CCA 650A+ e 70Ah a 90Ah).',
    },
  });

  // Hyundai HB20
  const modelHb20 = await prisma.vehicleModel.upsert({
    where: { makeId_slug: { makeId: makeHyundai.id, slug: 'hb20' } },
    update: {},
    create: { makeId: makeHyundai.id, name: 'HB20', slug: 'hb20' },
  });

  const varHb20 = await prisma.vehicleVariant.create({
    data: {
      modelId: modelHb20.id,
      name: 'HB20 1.0 / 1.6 Kappa & Gamma',
      yearStart: 2012,
      yearEnd: 2022,
      engine: '1.0 12V / 1.6 16V Flex',
      fuel: 'Flex',
      technicalNotes: 'Caixa asiática 50Ah/60Ah pólo direito.',
    },
  });

  // 7. Produtos (Moura, Heliar, Bralmax, Zetta, Cral)
  console.log('🔋 Cadastrando catálogo de baterias com especificações técnicas...');

  // Produto 1: Moura 60Ah M60GD
  const prodMoura60 = await prisma.product.create({
    data: {
      name: 'Bateria Moura 60Ah - M60GD',
      slug: 'bateria-moura-60ah-m60gd',
      sku: 'M60GD',
      brand: 'Moura',
      description: 'A bateria automotiva mais vendida do Brasil. A Moura conta com tecnologia exclusiva de liga de prata que suporta até 3x mais ciclos de carga, perfeita para o clima brasileiro e trânsito urbano com ar-condicionado constante. Peça original nas principais montadoras.',
      amperageAh: 60,
      voltageV: 12,
      ccaA: 460,
      dimensionsMm: '242 x 175 x 175 mm',
      warrantyMonths: 18,
      polarity: 'POSITIVE_RIGHT',
      technology: 'SLI',
      isFeatured: true,
      stockStatus: 'in_stock',
      status: 'active',
      internalCostNotes: 'Preço de custo distribuidor R$ 390. Margem sugerida R$ 510.',
      categories: {
        create: [{ categoryId: catLeves.id }],
      },
        ],
      },
    },
  });

  // Produto 2: Heliar 60Ah HF60DD
  const prodHeliar60 = await prisma.product.create({
    data: {
      name: 'Bateria Heliar 60Ah Original - HF60DD',
      slug: 'bateria-heliar-60ah-hf60dd',
      sku: 'HF60DD',
      brand: 'Heliar',
      description: 'Tecnologia PowerFrame patenteada, que garante máxima condutividade elétrica e resistência à corrosão das placas. Acompanha Proteção 24 Horas Heliar contra panes elétricas em todo o território nacional durante a vigência da garantia.',
      amperageAh: 60,
      voltageV: 12,
      ccaA: 480,
      dimensionsMm: '242 x 175 x 175 mm',
      warrantyMonths: 24,
      polarity: 'POSITIVE_RIGHT',
      technology: 'SLI',
      isFeatured: true,
      stockStatus: 'in_stock',
      status: 'active',
      internalCostNotes: 'Custo R$ 410. Inclui seguro socorro 24h Heliar.',
      categories: {
        create: [{ categoryId: catLeves.id }],
      },
        ],
      },
    },
  });

  // Produto 3: Moura EFB 60Ah MF60ED (Start-Stop)
  const prodMouraEfb60 = await prisma.product.create({
    data: {
      name: 'Bateria Moura EFB 60Ah Start-Stop - MF60ED',
      slug: 'bateria-moura-efb-60ah-mf60ed',
      sku: 'MF60ED',
      brand: 'Moura',
      description: 'Desenvolvida especificamente para veículos com sistema Start-Stop moderno. A linha Moura EFB suporta até 2,5 vezes mais ciclos de carga e descarga contínuos do que baterias comuns, garantindo que o motor desligue e ligue nos semáforos sem perda de carga ou falha eletrônica.',
      amperageAh: 60,
      voltageV: 12,
      ccaA: 560,
      dimensionsMm: '242 x 175 x 190 mm',
      warrantyMonths: 24,
      polarity: 'POSITIVE_RIGHT',
      technology: 'EFB',
      isFeatured: true,
      stockStatus: 'in_stock',
      status: 'active',
      categories: {
        create: [{ categoryId: catStartStop.id }, { categoryId: catLeves.id }],
      },
        ],
      },
    },
  });

  // Produto 4: Bralmax 60Ah B60D
  const prodBralmax60 = await prisma.product.create({
    data: {
      name: 'Bateria Bralmax 60Ah - B60D',
      slug: 'bateria-bralmax-60ah-b60d',
      sku: 'B60D',
      brand: 'Bralmax',
      description: 'Excelente opção de custo-benefício para motoristas de aplicativos e uso diário em Arapongas. Alta confiabilidade com placas de chumbo virgem e indicador de carga embutido tipo olho mágico.',
      amperageAh: 60,
      voltageV: 12,
      ccaA: 420,
      dimensionsMm: '242 x 175 x 175 mm',
      warrantyMonths: 15,
      polarity: 'POSITIVE_RIGHT',
      technology: 'SLI',
      isFeatured: false,
      stockStatus: 'in_stock',
      status: 'active',
      categories: {
        create: [{ categoryId: catLeves.id }],
      },
        ],
      },
    },
  });

  // Produto 5: Zetta 60Ah Z60D
  const prodZetta60 = await prisma.product.create({
    data: {
      name: 'Bateria Zetta 60Ah - Z60D (Linha Moura)',
      slug: 'bateria-zetta-60ah-z60d',
      sku: 'Z60D',
      brand: 'Zetta',
      description: 'Segunda linha oficial da Acumuladores Moura S.A., projetada com o mesmo rigor de qualidade e processos fabris da marca líder, com preço altamente competitivo para quem busca economia sem abrir mão da procedência.',
      amperageAh: 60,
      voltageV: 12,
      ccaA: 400,
      dimensionsMm: '242 x 175 x 175 mm',
      warrantyMonths: 12,
      polarity: 'POSITIVE_RIGHT',
      technology: 'SLI',
      isFeatured: false,
      stockStatus: 'in_stock',
      status: 'active',
      categories: {
        create: [{ categoryId: catLeves.id }],
      },
        ],
      },
    },
  });

  // Produto 6: Moura 48Ah M48FD
  const prodMoura48 = await prisma.product.create({
    data: {
      name: 'Bateria Moura 48Ah - M48FD',
      slug: 'bateria-moura-48ah-m48fd',
      sku: 'M48FD',
      brand: 'Moura',
      description: 'Dimensões compactas ideais para carros populares como Fiat Uno Fire, Ford Ka e modelos compactos de motor 1.0 que demandam corrente precisa e confiável em partidas diárias.',
      amperageAh: 48,
      voltageV: 12,
      ccaA: 380,
      dimensionsMm: '210 x 175 x 175 mm',
      warrantyMonths: 18,
      polarity: 'POSITIVE_RIGHT',
      technology: 'SLI',
      isFeatured: false,
      stockStatus: 'in_stock',
      status: 'active',
      categories: {
        create: [{ categoryId: catLeves.id }],
      },
        ],
      },
    },
  });

  // Produto 7: Moura 70Ah M70RD
  const prodMoura70 = await prisma.product.create({
    data: {
      name: 'Bateria Moura 70Ah - M70RD',
      slug: 'bateria-moura-70ah-m70rd',
      sku: 'M70RD',
      brand: 'Moura',
      description: 'Potência e capacidade reforçadas para picapes médias, utilitários leves, sedãs de grande porte e veículos com som e acessórios elétricos adicionais.',
      amperageAh: 70,
      voltageV: 12,
      ccaA: 550,
      dimensionsMm: '278 x 175 x 175 mm',
      warrantyMonths: 18,
      polarity: 'POSITIVE_RIGHT',
      technology: 'SLI',
      isFeatured: true,
      stockStatus: 'in_stock',
      status: 'active',
      categories: {
        create: [{ categoryId: catSuv.id }],
      },
        ],
      },
    },
  });

  // Produto 8: Moura 90Ah M90TD (Caminhonetes / Utilitários)
  const prodMoura90 = await prisma.product.create({
    data: {
      name: 'Bateria Moura 90Ah - M90TD Diesel',
      slug: 'bateria-moura-90ah-m90td',
      sku: 'M90TD',
      brand: 'Moura',
      description: 'Força bruta para motores diesel de alta compressão. Suporta partidas severas em dias frios de inverno com confiabilidade incomparável.',
      amperageAh: 90,
      voltageV: 12,
      ccaA: 700,
      dimensionsMm: '305 x 173 x 225 mm',
      warrantyMonths: 15,
      polarity: 'POSITIVE_RIGHT',
      technology: 'SLI',
      isFeatured: false,
      stockStatus: 'in_stock',
      status: 'active',
      categories: {
        create: [{ categoryId: catSuv.id }],
      },
        ],
      },
    },
  });

  // 8. Vinculação de Compatibilidades Validadas
  console.log('🔗 Estabelecendo compatibilidades técnicas verificadas...');

  // Compatibilidades Gol 1.0 e 1.6
  await prisma.productCompatibility.createMany({
    data: [
      {
        productId: prodMoura60.id,
        vehicleVariantId: varGol10.id,
        validationStatus: 'verified',
        validationSource: 'Tabela Oficial Fabricante Moura 2024',
        technicalNotes: 'Aplicação padrão para versões com ar-condicionado e direção hidráulica.',
      },
      {
        productId: prodHeliar60.id,
        vehicleVariantId: varGol10.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo de Aplicações Heliar 2024',
        technicalNotes: 'Encaixe original na bandeja com trava inferior.',
      },
      {
        productId: prodBralmax60.id,
        vehicleVariantId: varGol10.id,
        validationStatus: 'verified',
        validationSource: 'Aplicação Verificada Bralmax',
        technicalNotes: 'Opção com excelente custo.',
      },
      {
        productId: prodZetta60.id,
        vehicleVariantId: varGol10.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Zetta',
        technicalNotes: 'Compatível com bandeja G5/G6/G7.',
      },
      {
        productId: prodMoura60.id,
        vehicleVariantId: varGol16.id,
        validationStatus: 'verified',
        validationSource: 'Tabela Oficial Moura',
      },
      {
        productId: prodHeliar60.id,
        vehicleVariantId: varGol16.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Heliar',
      },
      // Polo TSI (apenas Start-Stop EFB / AGM!)
      {
        productId: prodMouraEfb60.id,
        vehicleVariantId: varPoloTsi.id,
        validationStatus: 'verified',
        validationSource: 'Manual de Serviço VW Polo TSI 2023 / Moura EFB',
        technicalNotes: 'Requer registro e codificação da substituição no módulo eletrônico do veículo.',
      },
      // Strada Fire & Firefly
      {
        productId: prodMoura60.id,
        vehicleVariantId: varStradaFire.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Moura',
      },
      {
        productId: prodHeliar60.id,
        vehicleVariantId: varStradaFire.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Heliar',
      },
      {
        productId: prodMoura60.id,
        vehicleVariantId: varStradaFirefly.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Moura',
      },
      // Uno Fire (aceita Moura 48Ah e 60Ah)
      {
        productId: prodMoura48.id,
        vehicleVariantId: varUnoFire.id,
        validationStatus: 'verified',
        validationSource: 'Manual Fiat Uno / Catálogo Moura',
        technicalNotes: 'Ideal para modelos sem ar-condicionado.',
      },
      {
        productId: prodMoura60.id,
        vehicleVariantId: varUnoFire.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Moura',
        technicalNotes: 'Recomendada para Uno com ar-condicionado.',
      },
      // Onix G1
      {
        productId: prodMoura60.id,
        vehicleVariantId: varOnixG1.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Chevrolet / Moura',
      },
      {
        productId: prodHeliar60.id,
        vehicleVariantId: varOnixG1.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Heliar',
      },
      // Novo Onix Turbo Start-Stop (apenas EFB!)
      {
        productId: prodMouraEfb60.id,
        vehicleVariantId: varOnixTurbo.id,
        validationStatus: 'verified',
        validationSource: 'Manual Técnico GM Onix Turbo / Moura EFB',
        technicalNotes: 'Veículo com sistema de carga regenerativa inteligente.',
      },
      // Corolla 2.0
      {
        productId: prodMoura60.id,
        vehicleVariantId: varCorolla20.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Toyota Corolla / Moura',
      },
      {
        productId: prodHeliar60.id,
        vehicleVariantId: varCorolla20.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Heliar',
      },
      // Hilux Diesel (Moura 70Ah e 90Ah)
      {
        productId: prodMoura70.id,
        vehicleVariantId: varHiluxDiesel.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Toyota Hilux D-4D',
      },
      {
        productId: prodMoura90.id,
        vehicleVariantId: varHiluxDiesel.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Toyota Hilux D-4D',
        technicalNotes: 'Capacidade máxima para uso severo e arranque a frio.',
      },
      // HB20
      {
        productId: prodMoura60.id,
        vehicleVariantId: varHb20.id,
        validationStatus: 'verified',
        validationSource: 'Catálogo Hyundai HB20 / Moura',
      },
    ],
  });

  console.log(`✨ Seed concluído com sucesso para a Baterias Estrela!`);
  console.log(`🔑 Login do Administrador: ${adminEmail}`);
  console.log(`🔑 Senha temporária: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
