-- ============================================================
-- KOJAK AUTO-LOG: Script de Limpeza de Usuários Não Confirmados
-- ============================================================
-- 
-- Este script remove usuários "fantasmas" que:
-- 1. Foram criados há mais de 15 minutos
-- 2. Ainda NÃO confirmaram o e-mail (email_confirmed_at IS NULL)
--
-- IMPORTANTE: Execute este script no Supabase Dashboard ou configure
-- como um cron job para execução automática.
--
-- ============================================================

-- ============================================================
-- OPÇÃO 1: Comando SQL Direto (Executar Manualmente)
-- ============================================================
-- Use este comando no SQL Editor do Supabase para limpeza imediata:

DELETE FROM auth.users
WHERE email_confirmed_at IS NULL
  AND created_at < NOW() - INTERVAL '15 minutes';


-- ============================================================
-- OPÇÃO 2: Função para Limpeza Automática (Recomendado)
-- ============================================================
-- Crie esta função no banco de dados para chamar via cron:

CREATE OR REPLACE FUNCTION public.cleanup_unconfirmed_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Deleta usuários não confirmados com mais de 15 minutos
  DELETE FROM auth.users
  WHERE email_confirmed_at IS NULL
    AND created_at < NOW() - INTERVAL '15 minutes';
  
  -- Retorna o número de registros deletados
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log da operação (opcional - pode ser visto nos logs do Postgres)
  RAISE NOTICE 'Cleanup: % usuários não confirmados removidos em %', deleted_count, NOW();
  
  RETURN deleted_count;
END;
$$;

-- Concede permissão para o service_role executar a função
GRANT EXECUTE ON FUNCTION public.cleanup_unconfirmed_users() TO service_role;


-- ============================================================
-- OPÇÃO 3: Cron Job Automático (Usando pg_cron)
-- ============================================================
-- Configure um cron job para executar a cada 5 minutos:
-- NOTA: O pg_cron deve estar habilitado no seu projeto Supabase.

-- Primeiro, habilite a extensão pg_cron (se ainda não estiver habilitada):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Depois, agende o job:
-- SELECT cron.schedule(
--   'cleanup-unconfirmed-users',
--   '*/5 * * * *',  -- A cada 5 minutos
--   $$SELECT public.cleanup_unconfirmed_users()$$
-- );


-- ============================================================
-- VERIFICAÇÃO: Listar usuários que serão afetados
-- ============================================================
-- Execute este SELECT para ver quais usuários seriam deletados:

-- SELECT 
--   id,
--   email,
--   created_at,
--   email_confirmed_at,
--   EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 AS minutes_since_creation
-- FROM auth.users
-- WHERE email_confirmed_at IS NULL
--   AND created_at < NOW() - INTERVAL '15 minutes'
-- ORDER BY created_at DESC;


-- ============================================================
-- ROLLBACK: Caso precise reverter (não é possível após DELETE)
-- ============================================================
-- IMPORTANTE: Usuários deletados não podem ser recuperados.
-- Recomenda-se fazer backup antes de executar em produção.
-- 
-- Para ver usuários que SERIAM deletados sem deletar:
-- Basta executar o SELECT acima antes do DELETE.
