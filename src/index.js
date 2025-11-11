// ============================================
// SYNTHX - Digital Game Store API
// SISTEMA ANTIGO (Node.js + Express + SQLite)
// ============================================

// ⚠️ IMPORTANTE: Este arquivo é do SISTEMA ANTIGO
// 
// O projeto foi MIGRADO para Supabase Functions (Deno + Hono)
// 
// NOVO ENTRY POINT: /supabase/functions/server/index.tsx
// 
// Este arquivo é mantido apenas para:
// - Referência histórica
// - Comparação com sistema novo
// - Documentação da arquitetura anterior
//
// NÃO EXECUTAR este arquivo! Use o novo sistema Supabase.
//
// Para mais informações, veja:
// - /INDEX_MIGRATION_GUIDE.md
// - /supabase/functions/server/index.tsx
// - /SETUP.md
//
// ============================================

const express = require('express');
const v1Routes = require('./routes/v1');
const fs = require('fs');
const path = require('path');

// ============================================
// VALIDAÇÃO DE ENVIRONMENT VARIABLES
// ============================================
// Sistema antigo: Validava .env manualmente
// Sistema novo: Supabase gerencia env vars automaticamente

const envPath = path.resolve(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('ERRO: O arquivo .env não foi encontrado!');
  console.error('Por favor, crie um arquivo .env na raiz do projeto e adicione as variáveis de ambiente necessárias.');

  process.exit(1);
}

// ============================================
// CONFIGURAÇÃO DO EXPRESS APP
// ============================================
// Sistema antigo: Express
// Sistema novo: Hono (mais rápido, edge-ready)

const app = express();
const APP_PORT = process.env.APP_PORT || 3000;

// Realiza um parse do body para uma estrutura JSON
app.use(express.json());

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================
// Sistema antigo: app.listen() na porta específica
// Sistema novo: Deno.serve() serverless

app.listen(APP_PORT, '0.0.0.0', () => {
  console.log(`API de vendas de jogos em execução na porta ${APP_PORT}.`);
  console.log(`Acesse a url http://localhost:${APP_PORT}`);
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
// Sistema antigo: GET /check
// Sistema novo: GET /health

app.get('/check', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API está funcionando corretamente.' });
});

// ============================================
// ROTAS DA API V1
// ============================================
// Sistema antigo: app.use('/api/v1', v1Routes)
// Sistema novo: Rotas em /supabase/functions/server/routes.tsx

app.use('/api/v1', v1Routes);

// ============================================
// COMPARAÇÃO: ANTIGO vs NOVO
// ============================================
//
// ANTIGO (index.js):
// - Express.js framework
// - app.listen() em porta específica (3000)
// - Rotas em /routes/v1
// - Validação manual de .env
// - SQLite local
// - CORS manual
//
// NOVO (/supabase/functions/server/index.tsx):
// - Hono framework
// - Deno.serve() serverless
// - Rotas em /supabase/functions/server/routes.tsx
// - Env vars gerenciadas pelo Supabase
// - KV Store distribuído
// - CORS via middleware Hono
//
// ============================================
// MIGRAÇÃO
// ============================================
//
// Para migrar do sistema antigo para o novo:
//
// 1. Leia: /INDEX_MIGRATION_GUIDE.md
// 2. Configure Supabase: /SETUP.md
// 3. Deploy functions: supabase functions deploy
// 4. Teste: /QUICKSTART.md
//
// ============================================
