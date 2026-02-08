

# Arquitetura de Telas por Plano - PlantãoMed

## Resumo

Implementar sistema completo de rotas e home screens diferenciadas por plano (Start, Pro, Premium), com menu dinâmico, redirecionamento automático pós-login, e tela de bloqueio elegante para rotas não permitidas.

---

## 1. Estrutura de Rotas por Plano

```text
+------------------+----------------------------------+--------------------------------+
| Plano            | Rotas Permitidas                 | Rotas Bloqueadas               |
+------------------+----------------------------------+--------------------------------+
| START            | /start, /agenda, /calendario,    | /despesas, /relatorios,        |
|                  | /locais, /pagamentos, /dashboard,| /metas, /export, /alertas,     |
|                  | /config                          | /contador                      |
+------------------+----------------------------------+--------------------------------+
| PRO              | Tudo do Start +                  | /insights, /alertas-inteligentes,|
|                  | /despesas, /relatorios, /metas,  | /contador, /resultado-real     |
|                  | /export                          |                                |
+------------------+----------------------------------+--------------------------------+
| PREMIUM          | Tudo do Pro +                    | (Nenhuma)                      |
|                  | /alertas-inteligentes, /insights,|                                |
|                  | /resultado-real, /contador,      |                                |
|                  | /suporte                         |                                |
+------------------+----------------------------------+--------------------------------+
```

---

## 2. Arquivos a Criar/Modificar

### 2.1 Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/lib/permissions.ts` | Mapa central de permissoes por plano e rotas |
| `src/components/navigation/PlanBasedRoute.tsx` | Wrapper de rota que verifica plano |
| `src/components/subscription/LockedScreen.tsx` | Tela de bloqueio com upgrade CTA |
| `src/components/navigation/DynamicSidebar.tsx` | Menu lateral dinamico por plano |
| `src/pages/plan-homes/StartHome.tsx` | Home do plano Start |
| `src/pages/plan-homes/ProHome.tsx` | Home do plano Pro |
| `src/pages/plan-homes/PremiumHome.tsx` | Home do plano Premium |
| `src/pages/CalendarPage.tsx` | Pagina de calendario mensal |
| `src/pages/LocationsPage.tsx` | Pagina de locais |
| `src/pages/PaymentsPage.tsx` | Pagina de pagamentos |
| `src/pages/DashboardPage.tsx` | Dashboard do mes |
| `src/pages/ExpensesPage.tsx` | Pagina de despesas (Pro+) |
| `src/pages/ReportsPage.tsx` | Pagina de relatorios (Pro+) |
| `src/pages/GoalsPage.tsx` | Pagina de metas (Pro+) |
| `src/pages/ExportPage.tsx` | Pagina de exportacao (Pro+) |
| `src/pages/AlertsPage.tsx` | Alertas inteligentes (Premium) |
| `src/pages/InsightsPage.tsx` | Insights avancados (Premium) |
| `src/pages/AccountantExportPage.tsx` | Export contador (Premium) |
| `src/pages/SupportPage.tsx` | Suporte prioritario (Premium) |

### 2.2 Arquivos a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/lib/stripe.ts` | Adicionar mapeamento de rotas por plano |
| `src/contexts/AuthContext.tsx` | Adicionar `canAccessRoute()` e `getPlanHomeRoute()` |
| `src/App.tsx` | Adicionar novas rotas com `PlanBasedRoute` |
| `src/pages/AuthPage.tsx` | Redirecionar para home do plano apos login |
| `src/components/navigation/BottomNav.tsx` | Tornar dinamico por plano |
| `src/components/navigation/AppLayout.tsx` | Integrar sidebar dinamico |

---

## 3. Detalhamento Tecnico

### 3.1 Mapa de Permissoes (`src/lib/permissions.ts`)

```typescript
export type PlanType = 'start' | 'pro' | 'premium';

export const PLAN_ROUTES: Record<PlanType, string[]> = {
  start: [
    '/start', '/agenda', '/calendario', '/locais', 
    '/pagamentos', '/dashboard', '/config'
  ],
  pro: [
    // herda start +
    '/despesas', '/relatorios', '/metas', '/export'
  ],
  premium: [
    // herda pro +
    '/alertas-inteligentes', '/insights', 
    '/resultado-real', '/contador', '/suporte'
  ],
};

export const ROUTE_REQUIRED_PLAN: Record<string, PlanType> = {
  '/despesas': 'pro',
  '/relatorios': 'pro',
  '/metas': 'pro',
  '/export': 'pro',
  '/alertas-inteligentes': 'premium',
  '/insights': 'premium',
  '/resultado-real': 'premium',
  '/contador': 'premium',
  '/suporte': 'premium',
};

export const PLAN_HOME_ROUTES: Record<PlanType, string> = {
  start: '/start',
  pro: '/pro',
  premium: '/premium',
};

export function canAccessRoute(
  userPlan: PlanType | null, 
  route: string
): boolean {
  // Rotas base sao liberadas para todos os planos
  const baseRoutes = ['/start', '/agenda', '/calendario', ...];
  if (baseRoutes.includes(route)) return true;
  
  const requiredPlan = ROUTE_REQUIRED_PLAN[route];
  if (!requiredPlan) return true;
  
  const hierarchy = ['start', 'pro', 'premium'];
  return hierarchy.indexOf(userPlan) >= hierarchy.indexOf(requiredPlan);
}
```

### 3.2 Componente PlanBasedRoute

```typescript
interface PlanBasedRouteProps {
  children: React.ReactNode;
  requiredPlan?: PlanType;
  routePath: string;
}

export function PlanBasedRoute({ 
  children, 
  requiredPlan, 
  routePath 
}: PlanBasedRouteProps) {
  const { user, subscription, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!subscription.subscribed) {
    return <Navigate to="/subscribe" replace />;
  }

  // Verificar se pode acessar a rota
  if (!canAccessRoute(subscription.plan, routePath)) {
    return <LockedScreen 
      requiredPlan={requiredPlan || ROUTE_REQUIRED_PLAN[routePath]} 
      currentRoute={routePath}
    />;
  }

  return <>{children}</>;
}
```

### 3.3 Tela de Bloqueio (LockedScreen)

Design elegante com:
- Icone de cadeado/sparkles animado
- Titulo: "Recurso disponivel no plano {PLAN}"
- Lista de beneficios do plano necessario
- Botao primario: "Fazer upgrade agora" -> `/subscribe?plan={plan}`
- Botao secundario: "Voltar"
- Nao executa logout

### 3.4 Home Screens por Plano

**StartHome (/start)**
- Cards grandes com icones:
  - Proximos plantoes (link para /agenda)
  - Calendario mensal (link para /calendario)
  - Locais cadastrados (link para /locais)
  - Pagamentos pendentes (link para /pagamentos)
  - Dashboard do mes (link para /dashboard)
- Badge "Seu plano: Start" no topo
- CTA sutil "Faca upgrade para Pro" no rodape

**ProHome (/pro)**
- Foco financeiro:
  - Recebimentos 7/30 dias (resumo + link)
  - Despesas do mes (resumo + link para /despesas)
  - Metas do mes (barra de progresso + link)
  - Relatorios por local (resumo + link)
  - Exportar CSV/ICS (botoes de acao)
- Badge "Seu plano: Pro"
- CTA "Faca upgrade para Premium"

**PremiumHome (/premium)**
- Foco em automacao/insights:
  - Alertas ativos (cards de alerta)
  - Tendencias do mes (grafico simplificado)
  - Resultado liquido real (card destacado)
  - Export para contador (botao)
  - Suporte prioritario (link para central)
- Badge "Seu plano: Premium"

### 3.5 Menu Lateral Dinamico

```typescript
const MENU_ITEMS = [
  { path: '/agenda', icon: Calendar, label: 'Agenda', plan: 'start' },
  { path: '/calendario', icon: CalendarDays, label: 'Calendario', plan: 'start' },
  { path: '/locais', icon: Building2, label: 'Locais', plan: 'start' },
  { path: '/pagamentos', icon: Receipt, label: 'Pagamentos', plan: 'start' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', plan: 'start' },
  { path: '/despesas', icon: Wallet, label: 'Despesas', plan: 'pro', badge: 'Pro' },
  { path: '/relatorios', icon: BarChart3, label: 'Relatorios', plan: 'pro', badge: 'Pro' },
  { path: '/metas', icon: Target, label: 'Metas', plan: 'pro', badge: 'Pro' },
  { path: '/export', icon: Download, label: 'Exportar', plan: 'pro', badge: 'Pro' },
  { path: '/alertas-inteligentes', icon: Bell, label: 'Alertas', plan: 'premium', badge: 'Premium' },
  { path: '/insights', icon: TrendingUp, label: 'Insights', plan: 'premium', badge: 'Premium' },
  { path: '/contador', icon: FileSpreadsheet, label: 'Contador', plan: 'premium', badge: 'Premium' },
  { path: '/suporte', icon: HeadphonesIcon, label: 'Suporte', plan: 'premium', badge: 'Premium' },
];

// Renderiza items:
// - Plano permite: item normal clicavel
// - Plano nao permite: item com opacity + cadeado, clique abre UpgradeModal
```

### 3.6 Redirecionamento Pos-Login

No `AuthPage.tsx`, apos login bem-sucedido:

```typescript
useEffect(() => {
  if (user && subscription.subscribed && subscription.plan) {
    const homeRoute = PLAN_HOME_ROUTES[subscription.plan];
    navigate(homeRoute);
  } else if (user && !subscription.subscribed) {
    navigate('/subscribe');
  }
}, [user, subscription]);
```

---

## 4. Estrutura de Rotas no App.tsx

```typescript
<Routes>
  {/* Publicas */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/subscribe" element={<SubscribePage />} />
  
  {/* Home por plano */}
  <Route path="/start" element={
    <PlanBasedRoute routePath="/start">
      <StartHome />
    </PlanBasedRoute>
  } />
  <Route path="/pro" element={
    <PlanBasedRoute routePath="/pro">
      <ProHome />
    </PlanBasedRoute>
  } />
  <Route path="/premium" element={
    <PlanBasedRoute routePath="/premium">
      <PremiumHome />
    </PlanBasedRoute>
  } />
  
  {/* Rotas Start (todos os planos) */}
  <Route path="/agenda" element={<PlanBasedRoute routePath="/agenda"><AgendaPage /></PlanBasedRoute>} />
  <Route path="/calendario" element={<PlanBasedRoute routePath="/calendario"><CalendarPage /></PlanBasedRoute>} />
  <Route path="/locais" element={<PlanBasedRoute routePath="/locais"><LocationsPage /></PlanBasedRoute>} />
  <Route path="/pagamentos" element={<PlanBasedRoute routePath="/pagamentos"><PaymentsPage /></PlanBasedRoute>} />
  <Route path="/dashboard" element={<PlanBasedRoute routePath="/dashboard"><DashboardPage /></PlanBasedRoute>} />
  <Route path="/config" element={<PlanBasedRoute routePath="/config"><ConfigPage /></PlanBasedRoute>} />
  
  {/* Rotas Pro */}
  <Route path="/despesas" element={<PlanBasedRoute routePath="/despesas"><ExpensesPage /></PlanBasedRoute>} />
  <Route path="/relatorios" element={<PlanBasedRoute routePath="/relatorios"><ReportsPage /></PlanBasedRoute>} />
  <Route path="/metas" element={<PlanBasedRoute routePath="/metas"><GoalsPage /></PlanBasedRoute>} />
  <Route path="/export" element={<PlanBasedRoute routePath="/export"><ExportPage /></PlanBasedRoute>} />
  
  {/* Rotas Premium */}
  <Route path="/alertas-inteligentes" element={<PlanBasedRoute routePath="/alertas-inteligentes"><AlertsPage /></PlanBasedRoute>} />
  <Route path="/insights" element={<PlanBasedRoute routePath="/insights"><InsightsPage /></PlanBasedRoute>} />
  <Route path="/resultado-real" element={<PlanBasedRoute routePath="/resultado-real"><NetResultPage /></PlanBasedRoute>} />
  <Route path="/contador" element={<PlanBasedRoute routePath="/contador"><AccountantExportPage /></PlanBasedRoute>} />
  <Route path="/suporte" element={<PlanBasedRoute routePath="/suporte"><SupportPage /></PlanBasedRoute>} />
  
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 5. Ordem de Implementacao

1. Criar `src/lib/permissions.ts` com mapa de rotas e funcoes auxiliares
2. Atualizar `AuthContext` com `canAccessRoute()` e `getPlanHomeRoute()`
3. Criar `PlanBasedRoute.tsx` (wrapper de protecao)
4. Criar `LockedScreen.tsx` (tela de bloqueio elegante)
5. Criar as 3 Home screens (StartHome, ProHome, PremiumHome)
6. Criar `DynamicSidebar.tsx` (menu lateral por plano)
7. Atualizar `AppLayout.tsx` para incluir sidebar
8. Criar paginas faltantes (CalendarPage, LocationsPage, etc.)
9. Atualizar `App.tsx` com todas as rotas
10. Atualizar `AuthPage.tsx` para redirecionamento pos-login
11. Atualizar `BottomNav.tsx` para ser dinamico por plano

---

## 6. Consideracoes de UX

- Animacoes suaves com Framer Motion em transicoes
- Cores consistentes (teal/verde PlantaoMed)
- Icones lucide-react em todo o app
- Badges "Pro" / "Premium" em itens bloqueados no menu
- Botao de upgrade sempre visivel mas nao intrusivo
- Preservar sessao do usuario em todas as navegacoes
- Paginas iniciam com dados mockados mas estrutura pronta para integracao

