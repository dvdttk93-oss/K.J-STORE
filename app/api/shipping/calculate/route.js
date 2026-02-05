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
  cepOrigem: '41940570', // CEP de origem (Salvador - BA)
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

    // Parâmetros para cálculo
    const args = {
      sCepOrigem: STORE_CONFIG.cepOrigem,
      sCepDestino: cleanCEP,
      nVlPeso: weight.toString(),
      nCdFormato: '1', // Caixa/Pacote
      nVlComprimento: STORE_CONFIG.comprimento.toString(),
      nVlAltura: STORE_CONFIG.altura.toString(),
      nVlLargura: STORE_CONFIG.largura.toString(),
      nVlDiametro: STORE_CONFIG.diametro.toString(),
      nCdServico: ['04014', '04510'], // PAC e SEDEX
      nVlValorDeclarado: value.toString(),
      sCdMaoPropria: 'N',
      sCdAvisoRecebimento: 'N',
    };

    // Calcular frete
    const result = await calcularPrecoPrazo(args);

    // Formatar resposta
    const shippingOptions = result.map(option => ({
      service: option.Codigo === '04014' ? 'SEDEX' : 'PAC',
      code: option.Codigo,
      price: parseFloat(option.Valor.replace(',', '.')),
      deliveryTime: parseInt(option.PrazoEntrega),
      error: option.Erro !== '0' ? option.MsgErro : null,
    })).filter(opt => !opt.error); // Remove opções com erro

    if (shippingOptions.length === 0) {
      return NextResponse.json(
        { error: 'Não foi possível calcular o frete. Verifique o CEP.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      origin: STORE_CONFIG.cepOrigem,
      destination: cleanCEP,
      options: shippingOptions,
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
