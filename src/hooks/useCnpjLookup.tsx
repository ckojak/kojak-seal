import { useState } from 'react';
import { cleanCnpj, isValidCnpj } from '@/lib/cnpj';

export interface CnpjData {
  razaoSocial: string;
  nomeFantasia: string;
  endereco: string;
  telefone: string;
  situacaoCadastral: string;
  ativa: boolean;
}

export function useCnpjLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByCnpj = async (cnpj: string): Promise<CnpjData | null> => {
    const clean = cleanCnpj(cnpj);
    setError(null);

    if (!isValidCnpj(clean)) {
      setError('CNPJ inválido. Confira os números digitados.');
      return null;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);

      if (res.status === 404) {
        setError('CNPJ não encontrado na Receita Federal.');
        return null;
      }
      if (!res.ok) {
        setError('Erro ao consultar CNPJ. Tente novamente.');
        return null;
      }

      const data = await res.json();

      const enderecoPartes = [
        data.logradouro,
        data.numero,
        data.complemento,
        data.bairro,
        data.municipio,
        data.uf,
      ].filter(Boolean);

      return {
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || '',
        endereco: enderecoPartes.join(', '),
        telefone: data.ddd_telefone_1 || '',
        situacaoCadastral: data.descricao_situacao_cadastral || '',
        ativa: data.descricao_situacao_cadastral === 'ATIVA',
      };
    } catch {
      setError('Erro de conexão ao consultar CNPJ.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchByCnpj, isLoading, error };
}
