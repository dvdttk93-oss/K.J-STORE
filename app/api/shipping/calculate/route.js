import { NextResponse } from 'next/server';
import { calcularPrecoPrazo } from 'correios-brasil';

/**
 * API para calcular frete dos Correios
 * POST /api/shipping/calculate
 * 
 * Body: {
 *   cep: string,
 *   weight: number (em kg),
 *   value: number (em R$)
 * }
 */

// Configurações da loja (ajuste conforme necessário)
const STORE_CONFIG = {
  cepOrigem: '47807064', // CEP de origem (Barreiras - BA)
  altura: 10, // cm
  largura: 20, // cm
  comprimento: 30, // cm
  diametro: 0, // cm (para cilindros)
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { cep, weight = 1, value = 100 } = body;

    // Validação do CEP
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      return NextResponse.json(
        { error: 'CEP inválido' },
        { status: 400 }
      );
    }

    const cleanCEP = cep.replace(/\D/g, '');

    // Calcular distância aproximada por região (primeiro dígito do CEP)
    const originRegion = parseInt(STORE_CONFIG.cepOrigem.substring(0, 1));
    const destRegion = parseInt(cleanCEP.substring(0, 1));
    
    // Tabela de distâncias aproximadas entre regiões (km)
    const regionDistances = {
      '0-0': 100, '0-1': 300, '0-2': 600, '0-3': 1000, '0-4': 1500, '0-5': 2000, '0-6': 2500, '0-7': 3000, '0-8': 3500, '0-9': 4000,
      '1-0': 300, '1-1': 100, '1-2': 400, '1-3': 800, '1-4': 1200, '1-5': 1800, '1-6': 2300, '1-7': 2800, '1-8': 3300, '1-9': 3800,
      '2-0': 600, '2-1': 400, '2-2': 100, '2-3': 500, '2-4': 900, '2-5': 1400, '2-6': 1900, '2-7': 2400, '2-8': 2900, '2-9': 3400,
      '3-0': 1000, '3-1': 800, '3-2': 500, '3-3': 100, '3-4': 600, '3-5': 1000, '3-6': 1500, '3-7': 2000, '3-8': 2500, '3-9': 3000,
      '4-0': 1500, '4-1': 1200, '4-2': 900, '4-3': 600, '4-4': 100, '4-5': 800, '4-6': 1200, '4-7': 1700, '4-8': 2200, '4-9': 2700,
      '5-0': 2000, '5-1': 1800, '5-2': 1400, '5-3': 1000, '5-4': 800, '5-5': 100, '5-6': 800, '5-7': 1300, '5-8': 1800, '5-9': 2300,
      '6-0': 2500, '6-1': 2300, '6-2': 1900, '6-3': 1500, '6-4': 1200, '6-5': 800, '6-6': 100, '6-7': 900, '6-8': 1400, '6-9': 1900,
      '7-0': 3000, '7-1': 2800, '7-2': 2400, '7-3': 2000, '7-4': 1700, '7-5': 1300, '7-6': 900, '7-7': 100, '7-8': 1000, '7-9': 1500,
      '8-0': 3500, '8-1': 3300, '8-2': 2900, '8-3': 2500, '8-4': 2200, '8-5': 1800, '8-6': 1400, '8-7': 1000, '8-8': 100, '8-9': 800,
      '9-0': 4000, '9-1': 3800, '9-2': 3400, '9-3': 3000, '9-4': 2700, '9-5': 2300, '9-6': 1900, '9-7': 1500, '9-8': 800, '9-9': 100,
    };
    
    const distanceKey = `${originRegion}-${destRegion}`;
    const distance = regionDistances[distanceKey] || 1000;

    try {
      // Tentar usar a API dos Correios com timeout aumentado
      const args = {
        sCepOrigem: STORE_CONFIG.cepOrigem,
        sCepDestino: cleanCEP,
        nVlPeso: weight.toString(),
        nCdFormato: '1',
        nVlComprimento: STORE_CONFIG.comprimento.toString(),
        nVlAltura: STORE_CONFIG.altura.toString(),
        nVlLargura: STORE_CONFIG.largura.toString(),
        nVlDiametro: STORE_CONFIG.diametro.toString(),
        nCdServico: ['04510', '04014'], // PAC e SEDEX
        nVlValorDeclarado: value.toString(),
        sCdMaoPropria: 'N',
        sCdAvisoRecebimento: 'N',
      };

      // Timeout de 8 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );

      const result = await Promise.race([
        calcularPrecoPrazo(args),
        timeoutPromise
      ]);

      const shippingOptions = result.map(option => ({
        service: option.Codigo === '04014' ? 'SEDEX' : 'PAC',
        code: option.Codigo,
        price: parseFloat(option.Valor.replace(',', '.')),
        deliveryTime: parseInt(option.PrazoEntrega),
        error: option.Erro !== '0' ? option.MsgErro : null,
      })).filter(opt => !opt.error);

      if (shippingOptions.length > 0) {
        return NextResponse.json({
          success: true,
          origin: STORE_CONFIG.cepOrigem,
          destination: cleanCEP,
          distance: distance,
          options: shippingOptions,
          source: 'correios'
        });
      }
    } catch (apiError) {
      console.log('API Correios indisponível, usando cálculo baseado em distância');
    }

    // Fallback: Cálculo baseado em DISTÂNCIA + peso + valor
    const basePrice = 12.00;
    const pricePerKm = 0.015; // R$ 0,015 por km
    const pricePerKg = 6.00; // R$ 6,00 por kg
    const insuranceRate = 0.008; // 0.8% do valor

    // Cálculo considerando distância
    const distanceCost = distance * pricePerKm;
    const weightCost = weight * pricePerKg;
    const insuranceCost = value * insuranceRate;

    const pacPrice = basePrice + distanceCost + weightCost + insuranceCost;
    const sedexPrice = pacPrice * 1.65; // SEDEX é ~65% mais caro

    // Prazo baseado em distância
    const pacDays = Math.ceil(5 + (distance / 500)); // 5 dias base + 1 dia a cada 500km
    const sedexDays = Math.ceil(2 + (distance / 1000)); // 2 dias base + 1 dia a cada 1000km

    const estimatedOptions = [
      {
        service: 'PAC',
        code: '04510',
        price: Math.round(pacPrice * 100) / 100,
        deliveryTime: Math.min(pacDays, 20), // máximo 20 dias
        estimated: true
      },
      {
        service: 'SEDEX',
        code: '04014',
        price: Math.round(sedexPrice * 100) / 100,
        deliveryTime: Math.min(sedexDays, 10), // máximo 10 dias
        estimated: true
      }
    ];

    return NextResponse.json({
      success: true,
      origin: STORE_CONFIG.cepOrigem,
      destination: cleanCEP,
      distance: distance,
      options: estimatedOptions,
      source: 'estimated',
      note: 'Valores estimados baseados em distância. Confirmação no checkout.'
    });

  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular frete. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Método GET para testar
export async function GET() {
  return NextResponse.json({
    message: 'API de cálculo de frete dos Correios',
    endpoint: 'POST /api/shipping/calculate',
    exampleBody: {
      cep: '01310100',
      weight: 1,
      value: 100
    }
  });
}
