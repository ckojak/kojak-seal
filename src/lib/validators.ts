// src/lib/validators.ts

export const verificarCNPJ = async (cnpj: string) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return { valid: false, message: "CNPJ Inválido" };

  try {
    // Consulta oficial na base da Receita via BrasilAPI
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
    const data = await response.json();

    if (response.ok && data.situacao === "ATIVA") {
      return { 
        valid: true, 
        nome: data.razao_social || data.nome_fantasia, 
        endereco: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio} - ${data.uf}`,
        telefone: data.ddd_telefone_1 || ""
      };
    }
    
    return { valid: false, message: "Este CNPJ não está ATIVO na Receita Federal." };
  } catch (error) {
    return { valid: false, message: "Erro ao conectar com a base da Receita." };
  }
};
