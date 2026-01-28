-- ================================================
-- FIX RLS INFINITE RECURSION: Simplify veiculos & vehicle_users policies
-- ================================================

-- Drop existing problematic policies on veiculos
DROP POLICY IF EXISTS "Usuários podem criar seus próprios veículos" ON public.veiculos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios veículos" ON public.veiculos;
DROP POLICY IF EXISTS "Veículos são públicos para leitura" ON public.veiculos;
DROP POLICY IF EXISTS "Usuarios podem ver veiculos que tem acesso" ON public.veiculos;

-- Recreate simple, non-recursive policies for veiculos

-- 1. SELECT: Public read (needed for /v/:id public verification)
CREATE POLICY "veiculos_select_public"
  ON public.veiculos
  FOR SELECT
  USING (true);

-- 2. INSERT: Only authenticated users can create vehicles (assigned to themselves)
CREATE POLICY "veiculos_insert_own"
  ON public.veiculos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Only the vehicle owner can update
CREATE POLICY "veiculos_update_own"
  ON public.veiculos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================
-- Simplify vehicle_users policies (remove any circular checks)
-- ================================================

DROP POLICY IF EXISTS "Donos podem adicionar usuários" ON public.vehicle_users;
DROP POLICY IF EXISTS "Donos podem remover ou usuários podem sair" ON public.vehicle_users;
DROP POLICY IF EXISTS "Usuários podem ver seus compartilhamentos" ON public.vehicle_users;

-- Use the existing security definer function is_vehicle_owner to avoid recursion

-- 1. SELECT: Users can see shares they belong to OR own the vehicle
CREATE POLICY "vehicle_users_select"
  ON public.vehicle_users
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.is_vehicle_owner(auth.uid(), vehicle_id)
  );

-- 2. INSERT: Only vehicle owners can add users
CREATE POLICY "vehicle_users_insert"
  ON public.vehicle_users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_vehicle_owner(auth.uid(), vehicle_id));

-- 3. DELETE: Users can remove themselves OR owner can remove anyone
CREATE POLICY "vehicle_users_delete"
  ON public.vehicle_users
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_vehicle_owner(auth.uid(), vehicle_id)
  );