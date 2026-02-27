import { supabase } from "@/integrations/supabase/client";

// Definição do Tipo (A estrutura que vem da Receita Federal)
export interface CnpjData {
  nome_fantasia: string;
  razao_social: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  status: string;
}

export const validarCnpjOficina = async (cnpj: string): Promise<CnpjData | null> => {
  // Limpa o CNPJ (deixa só números)
  const cleanCnpj = cnpj.replace(/\D/g, '');

  if (cleanCnpj.length !== 14) return null;

  // Chama a tua Edge Function que acabaste de subir
  const { data, error } = await supabase.functions.invoke('validar-cnpj', {
    body: { cnpj: cleanCnpj }
  });

  if (error) {
    console.error('Erro na validação do CNPJ:', error);
    return null;
  }

  return data as CnpjData;
};
