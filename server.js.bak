'use strict';

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const CONFIG_PATH = path.join(__dirname, '.pipedrive_config.json');
const MAP_PATH    = path.join(__dirname, 'pipedrive_map.json');

const config    = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const map       = JSON.parse(fs.readFileSync(MAP_PATH,    'utf8'));
const API_BASE  = config.base_url || 'https://api.pipedrive.com/v1';
const API_TOKEN = config.api_token;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cnpjDigitsOnly(cnpj) {
  return String(cnpj || '').replace(/\D/g, '');
}

// mFieldPacote sends values like "Inicial · 10 a 30 colaboradores"
// Extract plan name (first word before ·) and faixa key
function parsePacote(raw) {
  // raw: "Inicial · 10 a 30 colaboradores" or just "Inicial"
  const parts = raw.split('·');
  const planName = parts[0].trim(); // "Inicial", "Completo", "Super"

  // Map faixa label to key
  const faixaLabelToKey = {
    '10 a 30 colaboradores':  '10-30',
    '31 a 50 colaboradores':  '31-50',
    '51 a 70 colaboradores':  '51-70',
    '71 a 100 colaboradores': '71-100',
  };
  const faixaLabel = parts[1] ? parts[1].trim() : null;
  const faixaKey   = faixaLabel ? (faixaLabelToKey[faixaLabel] || null) : null;

  return { planName, faixaKey, faixaLabel };
}

function faixaFromColabs(colabs) {
  const n = Number(colabs);
  if (n >= 5  && n <= 30)  return '10-30';
  if (n >= 31 && n <= 50)  return '31-50';
  if (n >= 51 && n <= 70)  return '51-70';
  if (n >= 71 && n <= 100) return '71-100';
  return '10-30';
}

function priceFor(plan, faixa) {
  return ((map.price_table[plan] || {})[faixa]) || 0;
}

function partnersForPlan(plan) {
  return map.deal_fields.parceiros.options_by_plan[plan]
      || map.deal_fields.parceiros.options_by_plan['Inicial'];
}

function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length <= 1) return { first_name: parts[0] || '', last_name: '' };
  return { first_name: parts.slice(0, -1).join(' '), last_name: parts[parts.length - 1] };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Pipedrive helpers ───────────────────────────────────────────────────────

async function pdPost(endpoint, body) {
  const url = `${API_BASE}${endpoint}?api_token=${API_TOKEN}`;
  const res  = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(`Pipedrive ${endpoint}: ${JSON.stringify(json.error || json)}`);
  return json.data;
}

async function pdPut(endpoint, body) {
  const url = `${API_BASE}${endpoint}?api_token=${API_TOKEN}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(`Pipedrive PUT ${endpoint}: ${JSON.stringify(json.error || json)}`);
  return json.data;
}

// createOrganization: razaoSocial → org.name | cnpjDigits → 7d66 field
async function createOrganization(razaoSocial, cnpjDigits) {
  const body = { name: razaoSocial };
  const digits = String(cnpjDigits || '').replace(/\D/g, '');
  if (digits) body['7d66ed32455df13d2dc07d60e62a6769caf84812'] = digits;
  console.log('[createOrg] name=' + razaoSocial + ' | cnpj=' + digits);
  return (await pdPost('/organizations', body)).id;
}

async function createPerson({ name, phone, email, org_id }) {
  const { first_name, last_name } = splitName(name);
  const body = { name, first_name, last_name, org_id };
  if (phone) body.phone = [{ value: phone, primary: true }];
  if (email) body.email = [{ value: email, primary: true }];
  return (await pdPost('/persons', body)).id;
}

async function createDeal(body) {
  return (await pdPost('/deals', body)).id;
}

const F = map.deal_fields;

// ─── Express ─────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/',       (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── POST /lead ────────────────────────────────────────────────────────────────
app.post('/lead', async (req, res) => {
  try {
    const {
      nome, email, telefone, empresa, cnpj,
      plano = 'Inicial', mensagem, colabs,
      utm_source = '', utm_campaign = '',
    } = req.body;

    // plano pode vir como "Completo · 10 a 30 colaboradores" ou só "Completo"
    const { planName } = parsePacote(plano);

    const org_id    = await createOrganization(empresa || nome, cnpj);
    const person_id = await createPerson({ name: nome, phone: telefone, email, org_id });

    const deal_id = await createDeal({
      title:       `[Lead] ${empresa || nome}`,
      pipeline_id: map.pipelines.leads.id,
      stage_id:    map.pipelines.leads.stage_id,
      person_id,
      org_id,
      [F.cnpj.key]:                                cnpjDigitsOnly(cnpj),
      [F.parceiros.key]:                           partnersForPlan(planName),
      [F.utm_source.key]:                          utm_source,
      [F.utm_campaign.key]:                        utm_campaign,
      'ae04f1b066ad708e6e572a0a187d103125663a46': email    || '',  // E-mail Gestor Plataforma
      'fc4bd0fbbe1c271eec1081b9f9f89218e63eb588': telefone || '',  // Telefone Gestor Plataforma
      'afde843344f385462d61059094e8cba4ea7e20c2': 627,             // Canal de Origem 2 = Nova LP
      '0aea8bb3f53bc6a0fde2c00856e4976fdb40fc6a': parseInt(colabs, 10) || 0,  // Quantidade de Vidas
    });

    return res.json({ success: true, deal_id });
  } catch (err) {
    console.error('[/lead]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /contrato ────────────────────────────────────────────────────────────
app.post('/contrato', async (req, res) => {
  try {
    const {
      pacote,                    // "Inicial · 10 a 30 colaboradores" ou "Inicial"
      faixa: faixaInput,
      razao_social, cnpj,
      fantasia, endereco, cidade, estado, cep,
      tel_empresa, email_empresa,
      focal_nome, focal_cargo, focal_tel, focal_email,
      colabs,
      utm_source = '', utm_campaign = '',
    } = req.body;

    // Extrair plano e faixa do campo pacote combinado
    const { planName, faixaKey: faixaFromPacote, faixaLabel: faixaLabelFromPacote } = parsePacote(pacote);

    // Faixa: prioridade 1 = extraída do pacote, 2 = faixaInput, 3 = calculada dos colabs
    const faixaKey   = faixaFromPacote || faixaInput || faixaFromColabs(colabs);
    const faixaLabel = faixaLabelFromPacote || map.faixa_map[faixaKey] || faixaKey;

    const valor     = priceFor(planName, faixaKey);
    const numColabs = parseInt(colabs, 10) || 0;
    const valorUnit = numColabs > 0 ? Math.round((valor / numColabs) * 100) / 100 : 0;

    console.log('[/contrato] planName:', planName, 'faixaKey:', faixaKey, 'valor:', valor, 'colabs:', numColabs, 'valorUnit:', valorUnit);

    console.log('[/contrato] Dados recebidos do frontend:');
    console.log('  razao_social:', razao_social);
    console.log('  cnpj:', cnpj);

    const org_id    = await createOrganization(razao_social, cnpj);
    const person_id = await createPerson({ name: focal_nome, phone: focal_tel, email: focal_email, org_id });

    const deal_id = await createDeal({
      title:       `[Autocontratação] ${razao_social}`,
      pipeline_id: map.pipelines.contratos.id,
      stage_id:    map.pipelines.contratos.stage_id,
      value:       valor,
      currency:    'BRL',
      person_id,
      org_id,
      [F.cnpj.key]:                                cnpjDigitsOnly(cnpj),
      [F.tipo_cobranca.key]:                       F.tipo_cobranca.value,
      [F.classificacao_cliente.key]:               F.classificacao_cliente.value,
      [F.tipo_negociacao.key]:                     F.tipo_negociacao.value,
      [F.time_responsavel.key]:                    F.time_responsavel.value,
      [F.status.key]:                              F.status.value,
      [F.substatus.key]:                           F.substatus.value,
      [F.data_contratacao.key]:                    today(),
      [F.parceiros.key]:                           partnersForPlan(planName),
      [F.valor_total_plano.key]:                   valor,
      [`${F.valor_total_plano.key}_currency`]:     'BRL',
      [F.faixa.key]:                               faixaLabel,
      [F.utm_source.key]:                          utm_source,
      [F.utm_campaign.key]:                        utm_campaign,
      '0aea8bb3f53bc6a0fde2c00856e4976fdb40fc6a': numColabs,           // Quantidade de Vidas
      'ce59e6c334cceb77c4ed2384ff11f1adca886370': valorUnit,            // Valor Unitário do Plano (confirmed)
      'ce59e6c334cceb77c4ed2384ff11f1adca886370_currency': 'BRL',      // currency companion for monetary field
      'ae04f1b066ad708e6e572a0a187d103125663a46': focal_email || '',   // E-mail Gestor Plataforma
      'fc4bd0fbbe1c271eec1081b9f9f89218e63eb588': focal_tel   || '',   // Telefone Gestor Plataforma
      'afde843344f385462d61059094e8cba4ea7e20c2': 627,                 // Canal de Origem 2 = Nova LP
      '259618d511fa349b6bccf67d9c4ad523aece8e65': 'Contratar agora',  // Estratégia de venda
    });

    // Aguardar automações do Pipedrive rodarem e então corrigir sincronamente
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
      const cnpjFinal = String(cnpj || '').replace(/\D/g, '');
      await pdPut(`/organizations/${org_id}`, {
        name: razao_social,
        '7d66ed32455df13d2dc07d60e62a6769caf84812': cnpjFinal,
      });
      console.log('[correction] Org ' + org_id + ' corrigida: name=' + razao_social + ' cnpj=' + cnpjFinal);
    } catch (e) {
      console.error('[correction] Falha:', e.message);
    }

    return res.json({ success: true, deal_id });
  } catch (err) {
    console.error('[/contrato]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Colab+ server on port ${PORT}`));
module.exports = app;
