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

    try {
      // Tentar usar a API dos Correios
      const args = {
        sCepOrigem: STORE_CONFIG.cepOrigem,
        sCepDestino: cleanCEP,
        nVlPeso: weight.toString(),
        nCdFormato: '1',
        nVlComprimento: STORE_CONFIG.comprimento.toString(),
        nVlAltura: STORE_CONFIG.altura.toString(),
        nVlLargura: STORE_CONFIG.largura.toString(),
        nVlDiametro: STORE_CONFIG.diametro.toString(),
        nCdServico: ['04014', '04510'], // PAC e SEDEX
        nVlValorDeclarado: value.toString(),
        sCdMaoPropria: 'N',
        sCdAvisoRecebimento: 'N',
      };

      // Timeout de 5 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
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
          options: shippingOptions,
        });
      }
    } catch (apiError) {
      console.log('API Correios indisponível, usando cálculo estimado');
    }

    // Fallback: Cálculo estimado baseado em peso e valor
    const basePrice = 15.00;
    const pricePerKg = 8.00;
    const insuranceRate = 0.01; // 1% do valor

    const pacPrice = basePrice + (weight * pricePerKg) + (value * insuranceRate);
    const sedexPrice = pacPrice * 1.6; // SEDEX é ~60% mais caro

    const estimatedOptions = [
      {
        service: 'PAC',
        code: '04510',
        price: Math.round(pacPrice * 100) / 100,
        deliveryTime: 8,
        estimated: true
      },
      {
        service: 'SEDEX',
        code: '04014',
        price: Math.round(sedexPrice * 100) / 100,
        deliveryTime: 3,
        estimated: true
      }
    ];

    return NextResponse.json({
      success: true,
      origin: STORE_CONFIG.cepOrigem,
      destination: cleanCEP,
      options: estimatedOptions,
      note: 'Valores estimados. O valor final será confirmado no checkout.'
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
