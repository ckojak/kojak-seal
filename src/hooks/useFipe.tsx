import { useState, useEffect } from 'react';

interface FipeResult {
  valor: string | null;
  isLoading: boolean;
  error: string | null;
}

// Mapeamento de marcas comuns para códigos FIPE
const MARCAS_FIPE: Record<string, string> = {
  'FIAT': '21',
  'VOLKSWAGEN': '59',
  'VW': '59',
  'CHEVROLET': '23',
  'GM': '23',
  'FORD': '22',
  'TOYOTA': '56',
  'HONDA': '25',
  'HYUNDAI': '26',
  'RENAULT': '48',
  'NISSAN': '44',
  'JEEP': '29',
  'PEUGEOT': '47',
  'CITROEN': '18',
  'MITSUBISHI': '40',
  'BMW': '07',
  'MERCEDES': '37',
  'MERCEDES-BENZ': '37',
  'AUDI': '06',
  'KIA': '32',
  'SUZUKI': '54',
  'CAOA CHERY': '89',
  'CHERY': '89',
  'BYD': '207',
  'VOLVO': '58',
  'LAND ROVER': '33',
  'PORSCHE': '46',
  'JAGUAR': '28',
  'MINI': '39',
  'RAM': '92',
  'SUBARU': '52',
  'LEXUS': '34',
};

export function useFipe(marca: string | null, modelo: string | null, ano: number | null): FipeResult {
  const [valor, setValor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFipe = async () => {
      if (!marca || !modelo || !ano) {
        setValor(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Buscar marca pelo nome
        const marcaUpper = marca.toUpperCase();
        const marcaCodigo = MARCAS_FIPE[marcaUpper];

        if (!marcaCodigo) {
          // Tentar buscar todas as marcas e encontrar a mais próxima
          const marcasResponse = await fetch('https://brasilapi.com.br/api/fipe/marcas/v1/carros');
          if (!marcasResponse.ok) throw new Error('Erro ao buscar marcas');
          
          const marcas = await marcasResponse.json();
          const marcaEncontrada = marcas.find((m: { nome: string; valor: string }) => 
            m.nome.toUpperCase().includes(marcaUpper) || 
            marcaUpper.includes(m.nome.toUpperCase())
          );

          if (!marcaEncontrada) {
            setValor(null);
            setError('Marca não encontrada na tabela FIPE');
            setIsLoading(false);
            return;
          }

          // Buscar modelos da marca
          const modelosResponse = await fetch(`https://brasilapi.com.br/api/fipe/tabelas/v1`);
          if (!modelosResponse.ok) throw new Error('Erro ao buscar tabela FIPE');

          // Usar a tabela mais recente
          const tabelas = await modelosResponse.json();
          const tabelaRecente = tabelas[0]?.codigo;

          // Fazer busca direta pelo código FIPE usando nome + modelo + ano
          const searchTerm = `${marca} ${modelo}`.toLowerCase();
          
          // Tentar buscar valor aproximado
          const precoResponse = await fetch(
            `https://brasilapi.com.br/api/fipe/preco/v1/${encodeURIComponent(searchTerm)}?ano=${ano}`
          );

          if (precoResponse.ok) {
            const precos = await precoResponse.json();
            if (precos.length > 0) {
              setValor(precos[0].valor);
              setIsLoading(false);
              return;
            }
          }

          // Fallback: estimar valor baseado no ano
          const valorEstimado = estimarValor(ano);
          setValor(valorEstimado);
          setIsLoading(false);
          return;
        }

        // Tentar busca alternativa por nome completo
        const searchQuery = `${marca} ${modelo}`.trim();
        const searchResponse = await fetch(
          `https://brasilapi.com.br/api/fipe/preco/v1/${encodeURIComponent(searchQuery)}`
        );

        if (searchResponse.ok) {
          const results = await searchResponse.json();
          
          // Filtrar pelo ano
          const resultadoAno = results.find((r: { anoModelo: number; valor: string }) => 
            r.anoModelo === ano || 
            r.anoModelo === ano - 1 || 
            r.anoModelo === ano + 1
          );

          if (resultadoAno) {
            setValor(resultadoAno.valor);
          } else if (results.length > 0) {
            // Usar o primeiro resultado como referência
            setValor(results[0].valor);
          } else {
            // Fallback
            const valorEstimado = estimarValor(ano);
            setValor(valorEstimado);
          }
        } else {
          // Fallback: estimar valor baseado em dados médios
          const valorEstimado = estimarValor(ano);
          setValor(valorEstimado);
        }
      } catch (err) {
        console.error('Erro ao buscar FIPE:', err);
        // Fallback: valor estimado
        const valorEstimado = estimarValor(ano);
        setValor(valorEstimado);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchFipe, 500);
    return () => clearTimeout(debounceTimer);
  }, [marca, modelo, ano]);

  return { valor, isLoading, error };
}

// Função de fallback para estimar valor baseado no ano
function estimarValor(ano: number): string {
  const anoAtual = new Date().getFullYear();
  const idade = anoAtual - ano;
  
  // Valor médio base de um carro popular novo
  const valorBase = 80000;
  
  // Depreciação: ~15% no primeiro ano, ~10% ao ano depois
  let valor = valorBase;
  
  if (idade <= 0) {
    valor = valorBase;
  } else if (idade === 1) {
    valor = valorBase * 0.85;
  } else {
    valor = valorBase * 0.85 * Math.pow(0.90, idade - 1);
  }
  
  // Limite mínimo
  valor = Math.max(valor, 8000);
  
  return valor.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2 
  });
}
