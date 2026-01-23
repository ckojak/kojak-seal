-- Tabela de veículos
CREATE TABLE public.veiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placa VARCHAR(10) NOT NULL,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  ano INTEGER,
  cor VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de manutenções com data_selada imutável (apenas servidor)
CREATE TABLE public.manutencoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  km_atual INTEGER NOT NULL,
  oficina VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  foto_url TEXT,
  data_selada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verificado BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;

-- Políticas para veículos
CREATE POLICY "Usuários podem ver seus próprios veículos" 
ON public.veiculos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios veículos" 
ON public.veiculos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios veículos" 
ON public.veiculos FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para manutenções (SEM DELETE e UPDATE após criação)
CREATE POLICY "Usuários podem ver suas manutenções" 
ON public.manutencoes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar manutenções" 
ON public.manutencoes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NÃO CRIAR políticas de UPDATE e DELETE para manutenções - imutabilidade

-- Trigger para updated_at em veículos
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_veiculos_updated_at
BEFORE UPDATE ON public.veiculos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket para fotos de manutenções
INSERT INTO storage.buckets (id, name, public) VALUES ('manutencoes-fotos', 'manutencoes-fotos', true);

-- Políticas de storage
CREATE POLICY "Fotos são públicas para visualização" 
ON storage.objects FOR SELECT USING (bucket_id = 'manutencoes-fotos');

CREATE POLICY "Usuários autenticados podem fazer upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'manutencoes-fotos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem deletar suas próprias fotos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'manutencoes-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);