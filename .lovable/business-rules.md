# PlantaoMed — Regras de Negócio Completas

> Documento gerado em 17/03/2026. Detalha TODAS as regras de negócio, CRUD por tela, cálculos, permissões por plano e lógica de autenticação.

---

## 1. Autenticação e Segurança

### 1.1 Cadastro (Sign Up)
- Campos: **Nome**, **Email**, **Senha**
- Senha mínima: **8 caracteres**, **1 número**, **1 letra maiúscula**
- Medidor visual de força da senha (fraco/médio/forte)
- Campo com alternância de visibilidade (olho)
- **Confirmação por e-mail obrigatória** — o usuário precisa clicar no link de verificação antes de conseguir fazer login
- Ao criar conta no Supabase Auth, um trigger `handle_new_user()` automaticamente:
  - Cria um registro na tabela `profiles` com o `user_id` e `name`
  - Cria um registro na tabela `user_roles` com `role = 'user'`

### 1.2 Login (Sign In)
- Email + Senha via `supabase.auth.signInWithPassword()`
- Após login bem-sucedido, salva timestamp de última atividade no localStorage
- Dispara verificação de assinatura (`check-subscription`) automaticamente

### 1.3 Recuperação de Senha
- Envia email via `supabase.auth.resetPasswordForEmail()`
- Mensagem genérica para evitar enumeração de contas ("Se o email existir, enviaremos um link")
- Redireciona para `/auth?mode=reset`

### 1.4 Sessão e Inatividade
- Sessão gerenciada pelo Supabase Auth com refresh automático de tokens
- **Timeout por inatividade: 3 dias** (72 horas)
- Monitora `click`, `keydown`, `scroll` para atualizar timestamp de atividade
- No carregamento, verifica se o tempo desde última atividade > 3 dias → logout automático

### 1.5 Verificação de Assinatura (check-subscription Edge Function)
- Executada automaticamente em:
  - Login / criação de sessão
  - Carregamento inicial da página
  - A cada **60 segundos** (polling periódico)
- Fluxo:
  1. Autentica o usuário via token JWT
  2. Verifica se é **admin** (`user_roles.role = 'admin'`) → se sim, retorna `{ subscribed: true, plan: 'premium', is_admin: true }`
  3. Busca cliente no Stripe pelo email
  4. Se não encontrar no Stripe, verifica a tabela `subscriptions` local (fallback para planos ativados manualmente)
  5. Se encontrar assinatura ativa no Stripe, mapeia `product_id` → plano e faz upsert na tabela `subscriptions`
  6. Retorna `{ subscribed, plan, subscription_end, is_admin }`

### 1.6 Roles e Admin
- Tabela `user_roles` com enum `app_role`: `'admin' | 'user'`
- Função SQL `has_role(_user_id, _role)` para verificações seguras (SECURITY DEFINER)
- **Admins têm acesso total** (equivalente a Premium) independente do status da assinatura
- RLS: usuários só podem ver seus próprios roles

---

## 2. Planos e Assinaturas (Stripe)

### 2.1 Planos Disponíveis

| Plano | Preço/mês | Stripe Product ID | Stripe Price ID |
|-------|-----------|-------------------|-----------------|
| **Start** | R$ 29,90 | `prod_TwVT7PQgjyfEtc` | `price_1SycSrGTYqtJZx3utVtvpkk3` |
| **Pro** | R$ 39,90 | `prod_TwVVy3Qj9rkrk5` | `price_1SycUNGTYqtJZx3uIiY215C1` |
| **Premium** | R$ 69,90 | `prod_TwVnkUxZzIrU4Q` | `price_1SyclVGTYqtJZx3u0K3ogDvb` |

### 2.2 Hierarquia de Planos
```
Start < Pro < Premium
```
Um plano superior inclui **todos os recursos** dos planos inferiores.

### 2.3 Checkout
- Edge Function `create-checkout`: cria sessão Stripe Checkout
- Verifica se cliente já existe no Stripe (pelo email) para evitar duplicação
- Modo: `subscription` (recorrente mensal)
- Redireciona para URL de sucesso/cancelamento

### 2.4 Portal do Cliente
- Edge Function `customer-portal`: cria sessão do Stripe Customer Portal
- Permite cancelar, trocar plano, atualizar método de pagamento

### 2.5 Webhook Stripe
- Edge Function `stripe-webhook`: processa eventos do Stripe
- Mantém tabela `subscriptions` sincronizada

---

## 3. Permissões por Plano — Rotas

### 3.1 Rotas Base (acessíveis a TODOS os planos)

| Rota | Descrição |
|------|-----------|
| `/start` | Home do plano Start |
| `/pro` | Home do plano Pro |
| `/premium` | Home do plano Premium |
| `/agenda` | Agenda de plantões e consultas |
| `/calendario` | Calendário mensal visual |
| `/locais` | Gestão de locais de trabalho |
| `/pagamentos` | Status de pagamentos |
| `/dashboard` | Dashboard resumo mensal |
| `/config` | Configurações gerais |

### 3.2 Rotas Pro (requerem plano Pro ou superior)

| Rota | Descrição |
|------|-----------|
| `/despesas` | Gestão de despesas por categoria |
| `/relatorios` | Relatórios por local e ranking |
| `/metas` | Metas mensais com progresso |
| `/export` | Exportação CSV e ICS |

### 3.3 Rotas Premium (requerem plano Premium)

| Rota | Descrição |
|------|-----------|
| `/alertas-inteligentes` | Alertas automáticos inteligentes |
| `/insights` | Insights avançados e tendências |
| `/resultado-real` | Resultado líquido real (receitas - despesas) |
| `/contador` | Exportação formatada para contador |
| `/suporte` | Suporte prioritário |

### 3.4 Lógica de Proteção de Rotas

**Componente `PlanBasedRoute`:**
1. Se carregando → spinner
2. Se não logado → redireciona para `/auth`
3. ⚠️ **BYPASS ATIVO** (linha 33): `return <>{children}</>` — libera tudo para desenvolvimento
4. Se admin → acesso total
5. Se sem assinatura ativa → redireciona para `/subscribe`
6. Verifica `canAccessRoute(plan, route)` comparando hierarquia de planos
7. Se bloqueado → mostra `LockedScreen` com botão de upgrade

---

## 4. Feature Gating (dentro das telas)

Além do bloqueio de rotas, algumas **abas/seções dentro de telas** são controladas por feature keys:

| Feature Key | Plano Mínimo | Onde é usado |
|------------|-------------|--------------|
| `agenda` | Start | Agenda |
| `locations` | Start | Locais |
| `event_status` | Start | Status de eventos |
| `payment_status` | Start | Status de pagamentos |
| `net_value_calc` | Start | Cálculo valor líquido |
| `monthly_dashboard` | Start | Dashboard mensal |
| `calendar_view` | Start | Calendário |
| `cloud_backup` | Start | Backup na nuvem |
| `expenses_basic` | **Pro** | Aba Despesas em Finanças |
| `receivables_smart` | **Pro** | Aba Recebimentos em Finanças |
| `reports_by_location` | **Pro** | Aba Relatórios em Finanças |
| `monthly_goals` | **Pro** | Metas mensais |
| `export_csv` | **Pro** | Exportar CSV |
| `export_ics` | **Pro** | Exportar ICS |
| `alerts_smart` | **Premium** | Alertas inteligentes |
| `reports_advanced` | **Premium** | Relatórios avançados |
| `expenses_advanced` | **Premium** | Despesas avançadas |
| `export_accountant` | **Premium** | Export contador |

**Verificação:** `hasFeature(featureKey)` no `AuthContext`:
- Admin → sempre `true`
- Sem assinatura → sempre `false`
- Com assinatura → compara `planHierarchy.indexOf(userPlan) >= planHierarchy.indexOf(requiredPlan)`

**Comportamento quando bloqueado:** Mostra card com ícone de cadeado + mensagem "Recurso exclusivo do plano X" + botão "Fazer upgrade"

---

## 5. CRUD por Tela — Detalhamento Completo

### 5.1 Eventos (Plantões e Consultas)

**Tabela:** `events`  
**RLS:** Cada usuário só acessa seus próprios eventos (`auth.uid() = user_id`)  
**Hook:** `useDbEvents()`

#### Tipos de Evento
- **Plantão (shift):** duração 12h, 24h ou custom + horários início/fim
- **Consulta (consultation):** horário + nome do paciente (com modo privacidade)

#### Criar Evento (Adicionar)
- **Tela:** `/agenda` → botão "+" abre `EventFormModal`
- **Campos obrigatórios:** tipo, data, local (select), valor bruto
- **Campos opcionais:** desconto (valor ou %), notas, horários, paciente
- **Lógica automática ao selecionar local:**
  - Preenche valor bruto com o valor padrão do local (depende do tipo e duração)
  - Calcula data de vencimento: `data_evento + paymentDeadlineDays` do local
- **Campos calculados automaticamente:**
  - `payment_status`: default `'pending'`
  - `status`: default `'scheduled'`
  - `discount_type`: default `'value'`
- **Persistência:** `supabase.from('events').insert(...)` com `user_id` do usuário logado

#### Editar Evento
- **Tela:** `/agenda`, `/pagamentos`, `/finanças` (aba Recebimentos)
- **Ação:** clicar no card do evento → abre `EventFormModal` em modo edição
- **Campos editáveis:** todos os campos do formulário
- **Persistência:** `supabase.from('events').update(...).eq('id', id).eq('user_id', user.id)`
- **Atualização na UI:** otimista (atualiza state local imediatamente)

#### Deletar Evento
- **Tela:** Dentro do `EventFormModal` em modo edição
- **Confirmação:** AlertDialog com "Tem certeza?"
- **Persistência:** `supabase.from('events').delete().eq('id', id).eq('user_id', user.id)`

#### Marcar como Pago
- **Tela:** `/pagamentos`, `/finanças` (aba Recebimentos)
- **Ação:** botão "Marcar como pago"
- **Lógica:** `updateEvent(id, { paymentStatus: 'paid', paymentDate: dataInformada || hoje })`
- **Impacto:** o campo `paid_at` (se preenchido) é a **fonte de verdade** para cálculos de faturamento

#### Cálculos de Evento
```typescript
// Valor líquido
netValue = discountType === 'percentage' 
  ? grossValue * (1 - discount/100) 
  : grossValue - discount
netValue = Math.max(0, netValue)

// Horas
hours = type === 'shift' 
  ? (duration === 'custom' ? customHours : duration === '12h' ? 12 : 24) 
  : 1 // consulta = 1h

// Taxa horária
hourlyRate = hours > 0 ? netValue / hours : 0
```

#### Filtros de Eventos
- Por tipo (plantão/consulta)
- Por status (agendado/completado/cancelado)
- Por status de pagamento (pago/pendente)
- Por local
- Por período (data início/fim)

#### Status de Pagamento (visual)
- **Pago (verde):** `paymentStatus === 'paid'`
- **Atrasado (vermelho):** `paymentStatus === 'pending'` E `paymentDate < hoje`
- **Pendente (laranja):** `paymentStatus === 'pending'` E `paymentDate >= hoje`

---

### 5.2 Locais de Trabalho

**Tabela:** `locations`  
**RLS:** `auth.uid() = user_id`  
**Hook:** `useDbLocations()`

#### Criar Local
- **Tela:** `/locais` → botão "Adicionar local" abre `LocationFormModal`
- **Campos:**
  - `name` (obrigatório): nome do hospital/clínica
  - `type`: `'hospital'` ou `'clinic'` (default: hospital)
  - `defaultShift12hValue`: valor padrão plantão 12h (default: 0)
  - `defaultShift24hValue`: valor padrão plantão 24h (default: 0)
  - `defaultConsultationValue`: valor padrão consulta (default: 0)
  - `paymentDeadlineDays`: prazo de pagamento em dias (default: 30)
  - `notes`: observações opcionais

#### Editar Local
- **Tela:** `/locais` → clicar no card/item do local
- Mesmos campos do formulário de criação
- **Persistência:** `update().eq('id', id).eq('user_id', user.id)`

#### Deletar Local
- **Tela:** `/locais` → botão de exclusão
- **Impacto:** eventos que usavam esse local mantêm o `location_name` salvo (snapshot), mas perdem a referência por `location_id`

#### Valores Padrão (auto-fill)
Quando o usuário seleciona um local ao criar um evento:
```typescript
getLocationDefaults(locationId, eventType, duration) → {
  grossValue: valor_padrao_do_tipo,
  paymentDeadlineDays: prazo_do_local
}
```
- Plantão 12h → `defaultShift12hValue`
- Plantão 24h → `defaultShift24hValue`
- Consulta → `defaultConsultationValue`

---

### 5.3 Despesas

**Tabela:** `expenses`  
**RLS:** `auth.uid() = user_id`  
**Hook:** `useDbExpenses()`  
**Plano mínimo:** Pro (`expenses_basic`)

#### Criar Despesa
- **Tela:** `/despesas` ou `/finanças` (aba Despesas)
- **Campos:**
  - `category` (obrigatório): enum `'accountant' | 'course' | 'uniform' | 'transport' | 'food' | 'equipment' | 'other'`
  - `value` (obrigatório): valor em reais
  - `date` (obrigatório): data da despesa
  - `description` (opcional): descrição livre

#### Deletar Despesa
- **Tela:** mesma tela de listagem
- Botão de exclusão direto

#### Editar Despesa
- **Hook suporta:** `updateExpense(id, updates)` disponível no código
- Campos editáveis: `category`, `value`, `date`, `description`

#### Cálculos Automáticos
- `currentMonthExpenses`: filtra despesas do mês atual
- `totalCurrentMonthExpenses`: soma dos valores do mês
- `expensesByCategory`: agrupamento por categoria com soma dos valores

---

### 5.4 Metas Mensais

**Tabela:** `goals`  
**RLS:** `auth.uid() = user_id`  
**Hook:** `useDbGoals()`  
**Plano mínimo:** Pro (`monthly_goals`)

#### Criar/Definir Meta
- **Tela:** `/metas`, `/pro` (home), `/premium` (home), `/dashboard`
- **Campo:** `targetAmount` (valor alvo em reais)
- **Persistência:** `upsert` com `onConflict: 'user_id,month,year'`
- Ao salvar manualmente: `last_manual_edit_at = agora`, `is_suggestion_applied = false`

#### Auto-criação de Meta
Quando o mês atual não tem meta:
1. Tenta usar meta do mês anterior como fallback
2. Calcula **sugestão inteligente** baseada nos últimos 3 meses
3. Se houver valor > 0, cria automaticamente com `is_suggestion_applied = true`

#### Sugestão Inteligente
```
1. Pega receita (paid_at) dos últimos 3 meses
2. Calcula média dos meses com receita > 0
3. Calcula tendência: (mês_mais_recente - mês_mais_antigo) / mês_mais_antigo
4. Aplica amortecimento de 50% na tendência
5. suggestedAmount = média × (1 + tendência × 0.5)
6. Arredonda para centena mais próxima
```

#### Bloqueio de Edição (Cooldown de 15 dias)
- Após edição manual, o campo `last_manual_edit_at` é setado
- **Próxima edição bloqueada por 15 dias** (`EDIT_COOLDOWN_DAYS = 15`)
- UI mostra "Edição bloqueada" com countdown de dias restantes

#### Desbloqueio Consciente (Override)
- Permite burlar o cooldown após confirmação em **dois estágios**:
  - Estágio 1: "Tem certeza?"
  - Estágio 2: Checkbox de responsabilidade
- Ao confirmar: `override_used = true`, `override_at = agora`, `last_manual_edit_at = null`
- Registrado no banco para auditoria

#### Progresso da Meta (tempo real)
```typescript
getCurrentProgress() → {
  received: soma_net_value_de_eventos_pagos_no_mes,
  target: meta_do_mes,
  percentage: min(100, received/target × 100),
  remaining: max(0, target - received),
  achieved: received >= target
}
```
- "Recebido" = soma do valor líquido de eventos com `paid_at` no mês vigente
- Eventos cancelados são excluídos

#### Histórico de Metas
- Mostra até 6 meses anteriores
- Para cada mês: `target`, `achieved` (receita real), `percentage`

---

### 5.5 Calendário

**Tela:** `/calendario`  
**Plano:** Start (todos)

- **Visualização apenas** — calendário mensal com marcadores nos dias que têm eventos
- Clicar num dia mostra os eventos daquele dia
- Não há ações de escrita diretas nesta tela

---

### 5.6 Dashboard

**Tela:** `/dashboard`  
**Plano:** Start (todos)

- **Visualização apenas** — resumo do mês atual
- Métricas calculadas em `calculateMonthlySummary()`:
  - `totalGross`: soma dos valores brutos (exclui cancelados)
  - `totalNet`: soma dos valores líquidos
  - `averageHourlyRate`: totalNet / totalHours
  - `totalShifts`: contagem de plantões
  - `totalConsultations`: contagem de consultas
  - `totalHours`: soma das horas
  - `pendingAmount`: soma líquida de eventos pendentes
  - `paidAmount`: soma líquida de eventos pagos
  - `totalExpenses`: soma das despesas do mês
  - `netAfterExpenses`: totalNet - totalExpenses

---

### 5.7 Pagamentos

**Tela:** `/pagamentos`  
**Plano:** Start (todos)

- Lista eventos filtrados por status de pagamento
- **Ações:**
  - Marcar como pago
  - Editar evento (abre modal)
- **Classificação de status:**
  - `paid_at != null` → **Pago** (badge verde)
  - `paid_at == null && payment_date < hoje` → **Atrasado** (badge vermelho)
  - `paid_at == null && payment_date >= hoje` → **Pendente** (badge laranja)

---

### 5.8 Finanças (Recebimentos + Despesas + Relatórios)

**Tela:** `/finanças` (se existir como rota unificada)  
**Tabs:** Recebimentos | Despesas | Relatórios

- **Recebimentos** (`receivables_smart` → Pro):
  - Lista pagamentos pendentes com filtros
  - Marcar como pago, editar evento
- **Despesas** (`expenses_basic` → Pro):
  - Mesmas regras da seção 5.3
- **Relatórios** (`reports_by_location` → Pro):
  - Relatórios por local com ranking
  - Resumo mensal com meta

Se o usuário não tem o plano necessário → `LockedTabContent` com cadeado

---

## 6. Navegação e Personalização

### 6.1 Bottom Navigation Bar
- Até **5 atalhos fixos** + "Início" (sempre presente) + "Menu (...)" para overflow
- **Início** redireciona dinamicamente:
  - Start → `/start`
  - Pro → `/pro`
  - Premium → `/premium`
- Itens filtrados pelo plano do usuário (não mostra atalhos de planos superiores)
- **Escondida** na rota `/config`

### 6.2 Personalização de Atalhos
- **Tabela:** `user_nav_prefs` (RLS: `auth.uid() = user_id`)
- Hook `useNavPrefs()`: salva/carrega `visible_items` (array de paths)
- Modal `NavPrefsModal` para reorganizar

### 6.3 Ordenação de Shortcuts (Home)
- **Tabela:** `user_shortcuts` (RLS: `auth.uid() = user_id`)
- Hook `useUserShortcuts()`: salva/carrega `shortcut_order`
- Permite mover para cima/baixo via `moveUp(index)` / `moveDown(index)`

### 6.4 Menu Suspenso "(...)"
- Organizado por categorias: **Pro**, **Start**, **Sistema**
- Visibilidade controlada por `subscription.plan`
- Não exibe recursos de planos superiores ao do usuário

---

## 7. Row Level Security (RLS)

Todas as tabelas de dados do usuário possuem RLS ativo com a mesma política:

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `events` | `uid = user_id` | `uid = user_id` | `uid = user_id` | `uid = user_id` |
| `locations` | `uid = user_id` | `uid = user_id` | `uid = user_id` | `uid = user_id` |
| `expenses` | `uid = user_id` | `uid = user_id` | `uid = user_id` | `uid = user_id` |
| `goals` | `uid = user_id` | `uid = user_id` | `uid = user_id` | `uid = user_id` |
| `profiles` | `uid = user_id` | `uid = user_id` | `uid = user_id` | ❌ Não permitido |
| `subscriptions` | `uid = user_id` | ❌ | ❌ | ❌ |
| `user_roles` | `uid = user_id` | ❌ | ❌ | ❌ |
| `entitlements` | `authenticated → true` | ❌ | ❌ | ❌ |
| `user_nav_prefs` | `uid = user_id` | `uid = user_id` | `uid = user_id` | ❌ |
| `user_shortcuts` | `uid = user_id` | `uid = user_id` | `uid = user_id` | ❌ |

**Tabelas somente-leitura para usuários:** `subscriptions`, `user_roles`, `entitlements` — gerenciadas apenas pelo backend (Edge Functions / admin).

---

## 8. Edge Functions

| Função | Propósito |
|--------|-----------|
| `check-subscription` | Verifica assinatura do usuário (Stripe + DB local + admin check) |
| `create-checkout` | Cria sessão Stripe Checkout para assinar um plano |
| `customer-portal` | Cria sessão do portal Stripe para gerenciar assinatura |
| `stripe-webhook` | Processa webhooks do Stripe (sincroniza DB) |
| `mcp-server` | Servidor MCP para acesso externo (Claude) — protegido por `MCP_SERVER_SECRET` |

---

## 9. MCP Server (Acesso Externo via Claude)

**Endpoint:** `POST /functions/v1/mcp-server`  
**Autenticação:** Header `Authorization: Bearer <MCP_SERVER_SECRET>`  
**Protocolo:** JSON-RPC 2.0

### Tools Disponíveis:
| Tool | Descrição |
|------|-----------|
| `list_users` | Lista usuários com perfil e roles |
| `get_user_details` | Detalhes completos de um usuário (perfil, roles, assinatura, contadores) |
| `list_events` | Lista eventos (filtro por user_id, tipo, período) |
| `list_expenses` | Lista despesas (filtro por user_id, período) |
| `list_locations` | Lista locais (filtro por user_id) |
| `list_goals` | Lista metas (filtro por user_id) |
| `list_subscriptions` | Lista assinaturas ativas |
| `get_stats` | Totais: usuários, eventos, planos ativos |
| `run_query` | Query direta em tabelas permitidas (profiles, events, expenses, locations, goals, subscriptions, user_roles, entitlements) |

---

## 10. Notas de Desenvolvimento

### ⚠️ Bypass Temporário
O componente `PlanBasedRoute` (linha 33) tem um `return <>{children}</>` que **libera todas as telas** sem verificar plano. **Remover antes de produção.**

### Categorias de Despesas
```typescript
type ExpenseCategory = 
  | 'accountant'  // Contador
  | 'course'      // Curso
  | 'uniform'     // Uniforme
  | 'transport'   // Transporte
  | 'food'        // Alimentação
  | 'equipment'   // Equipamento
  | 'other'       // Outros
```

### Tipos de Evento
```typescript
type EventType = 'shift' | 'consultation'
type ShiftDuration = '12h' | '24h' | 'custom'
type EventStatus = 'scheduled' | 'completed' | 'cancelled'
type PaymentStatus = 'paid' | 'pending'
```

### Fonte de Verdade para Faturamento
- O campo `paid_at` (timestamp) é a **única fonte de verdade** para determinar se um evento foi efetivamente pago
- `payment_date` é apenas a **data de vencimento** esperada
- Cálculos de receita mensal filtram por `paid_at` dentro do mês, NÃO por `payment_date`
