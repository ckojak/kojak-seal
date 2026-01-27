-- 1. Create security definer function to check vehicle access without recursion
CREATE OR REPLACE FUNCTION public.user_has_vehicle_access(_user_id uuid, _vehicle_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.veiculos WHERE id = _vehicle_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.vehicle_users WHERE vehicle_id = _vehicle_id AND user_id = _user_id
  )
$$;

-- 2. Create function to check if user is vehicle owner
CREATE OR REPLACE FUNCTION public.is_vehicle_owner(_user_id uuid, _vehicle_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.veiculos WHERE id = _vehicle_id AND user_id = _user_id
  )
$$;

-- 3. Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.email() = 'bmw.reta@hotmail.com'
$$;

-- 4. Drop problematic policies on veiculos
DROP POLICY IF EXISTS "Usuários autenticados podem ver seus veículos" ON public.veiculos;
DROP POLICY IF EXISTS "Veículos são públicos para visualização por ID" ON public.veiculos;

-- 5. Create new non-recursive policies for veiculos
CREATE POLICY "Veículos são públicos para leitura"
ON public.veiculos
FOR SELECT
USING (true);

-- 6. Drop and recreate vehicle_users policies without recursion
DROP POLICY IF EXISTS "Usuários podem ver compartilhamentos de seus veículos" ON public.vehicle_users;
DROP POLICY IF EXISTS "Donos podem adicionar usuários" ON public.vehicle_users;
DROP POLICY IF EXISTS "Donos podem remover ou usuários podem sair" ON public.vehicle_users;

CREATE POLICY "Usuários podem ver seus compartilhamentos"
ON public.vehicle_users
FOR SELECT
USING (
  user_id = auth.uid() OR public.is_vehicle_owner(auth.uid(), vehicle_id)
);

CREATE POLICY "Donos podem adicionar usuários"
ON public.vehicle_users
FOR INSERT
WITH CHECK (public.is_vehicle_owner(auth.uid(), vehicle_id));

CREATE POLICY "Donos podem remover ou usuários podem sair"
ON public.vehicle_users
FOR DELETE
USING (
  user_id = auth.uid() OR public.is_vehicle_owner(auth.uid(), vehicle_id)
);

-- 7. Add admin policy for profiles update
CREATE POLICY "Admin pode atualizar verificação"
ON public.profiles
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. Add admin select all profiles policy
CREATE POLICY "Admin pode ver todos os profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin() OR auth.uid() = user_id OR true);