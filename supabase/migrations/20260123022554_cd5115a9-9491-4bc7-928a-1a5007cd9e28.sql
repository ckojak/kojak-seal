-- Criar enum para níveis de permissão
CREATE TYPE public.vehicle_permission AS ENUM ('owner', 'editor', 'viewer');

-- Tabela para relacionar múltiplos usuários a veículos
CREATE TABLE public.vehicle_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission vehicle_permission NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.vehicle_users ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver compartilhamentos de veículos que possuem ou foram compartilhados com eles
CREATE POLICY "Usuários podem ver compartilhamentos de seus veículos" 
ON public.vehicle_users FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.veiculos v 
    WHERE v.id = vehicle_id AND v.user_id = auth.uid()
  )
);

-- Apenas donos do veículo podem convidar outros usuários
CREATE POLICY "Donos podem adicionar usuários" 
ON public.vehicle_users FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.veiculos v 
    WHERE v.id = vehicle_id AND v.user_id = auth.uid()
  )
);

-- Donos podem remover compartilhamentos ou usuários podem se remover
CREATE POLICY "Donos podem remover ou usuários podem sair" 
ON public.vehicle_users FOR DELETE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.veiculos v 
    WHERE v.id = vehicle_id AND v.user_id = auth.uid()
  )
);

-- Criar política pública para consulta de veículos (para página pública de verificação)
CREATE POLICY "Veículos são públicos para visualização por ID" 
ON public.veiculos FOR SELECT 
USING (true);

-- Criar política pública para consulta de manutenções (para página pública)
CREATE POLICY "Manutenções são públicas para visualização por veículo" 
ON public.manutencoes FOR SELECT 
USING (true);

-- Dropar políticas antigas que eram restritivas demais
DROP POLICY IF EXISTS "Usuários podem ver seus próprios veículos" ON public.veiculos;
DROP POLICY IF EXISTS "Usuários podem ver suas manutenções" ON public.manutencoes;

-- Recriar políticas de veículo para usuários autenticados verem seus veículos e compartilhados
CREATE POLICY "Usuários autenticados podem ver seus veículos" 
ON public.veiculos FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.vehicle_users vu 
    WHERE vu.vehicle_id = id AND vu.user_id = auth.uid()
  )
);

-- Manutenções: donos e editores podem criar
CREATE POLICY "Editores e donos podem criar manutenções"
ON public.manutencoes FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.veiculos v 
    WHERE v.id = veiculo_id AND v.user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.vehicle_users vu 
    WHERE vu.vehicle_id = veiculo_id 
    AND vu.user_id = auth.uid() 
    AND vu.permission IN ('owner', 'editor')
  )
);

-- Remover política antiga de insert
DROP POLICY IF EXISTS "Usuários podem criar manutenções" ON public.manutencoes;