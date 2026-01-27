import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURAÇÃO DE ACESSO
 * 
 * Se você quer que o app apareça aqui no "Preview" do Google AI Studio, 
 * preencha as variáveis abaixo entre as aspas. 
 * 
 * Se deixar vazio, o app funcionará apenas no link do Vercel (onde você configurou o painel).
 */
const MANUAL_URL = "https://natermviczmlgqcdgiod.supabase.co";
const MANUAL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdGVybXZpY3ptbGdxY2RnaW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0OTA5NTQsImV4cCI6MjA4NTA2Njk1NH0._NhPgYfTxiq4lqiSW3WMmYujB2LSksexN72-KTy6sXM";

const getEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;

  // Tenta buscar no ambiente do Vercel/Vite primeiro
  try {
    // @ts-ignore
    const env = import.meta.env;
    if (env && (env[viteKey] || env[key])) {
      return env[viteKey] || env[key];
    }
  } catch (e) { }

  try {
    if (typeof process !== 'undefined' && process.env && (process.env[viteKey] || process.env[key])) {
      return process.env[viteKey] || process.env[key] || '';
    }
  } catch (e) { }

  // Se não encontrar no ambiente, usa o valor manual definido acima
  if (key === 'SUPABASE_URL') return MANUAL_URL;
  if (key === 'SUPABASE_ANON_KEY') return MANUAL_KEY;

  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  : (new Proxy({}, {
    get: () => {
      return () => {
        throw new Error("Configuração do Supabase ausente. Preencha MANUAL_URL e MANUAL_KEY no arquivo supabaseClient.ts para ver o preview aqui.");
      };
    }
  }) as any);
