// Stripe product and price mapping
export const STRIPE_PLANS: Record<PlanType, PlanConfig> = {
  start: {
    productId: "prod_TwVT7PQgjyfEtc",
    priceId: "price_1SycSrGTYqtJZx3utVtvpkk3",
    name: "Start",
    price: 29.90,
    description: "Organização básica",
    popular: false,
  },
  pro: {
    productId: "prod_TwVVy3Qj9rkrk5",
    priceId: "price_1SycUNGTYqtJZx3uIiY215C1",
    name: "Pro",
    price: 39.90,
    description: "Controle financeiro completo",
    popular: true,
  },
  premium: {
    productId: "prod_TwVnkUxZzIrU4Q",
    priceId: "price_1SyclVGTYqtJZx3u0K3ogDvb",
    name: "Premium",
    price: 69.90,
    description: "Automação + insights",
    popular: false,
  },
};

export type PlanType = 'start' | 'pro' | 'premium';

export interface PlanConfig {
  productId: string;
  priceId: string;
  name: string;
  price: number;
  description: string;
  popular: boolean;
}

// Feature keys for gating
export const FEATURES = {
  // Start features
  agenda: 'agenda',
  locations: 'locations',
  event_status: 'event_status',
  payment_status: 'payment_status',
  net_value_calc: 'net_value_calc',
  monthly_dashboard: 'monthly_dashboard',
  calendar_view: 'calendar_view',
  cloud_backup: 'cloud_backup',
  // Pro features
  expenses_basic: 'expenses_basic',
  receivables_smart: 'receivables_smart',
  reports_by_location: 'reports_by_location',
  monthly_goals: 'monthly_goals',
  export_csv: 'export_csv',
  export_ics: 'export_ics',
  // Premium features
  alerts_smart: 'alerts_smart',
  reports_advanced: 'reports_advanced',
  expenses_advanced: 'expenses_advanced',
  export_accountant: 'export_accountant',
} as const;

export type FeatureKey = keyof typeof FEATURES;

// Plan features for display
export const PLAN_FEATURES: Record<PlanType, { included: string[]; excluded: string[] }> = {
  start: {
    included: [
      "Agenda completa de plantões e consultas",
      "Locais com valores padrão e prazo",
      "Status do evento e pagamento",
      "Cálculo automático do valor líquido",
      "Dashboard do mês",
      "Calendário mensal",
      "Backup na nuvem + multi-dispositivo",
    ],
    excluded: [
      "Despesas por categoria",
      "Relatórios por local",
      "Metas mensais",
      "Exportações CSV/ICS",
      "Alertas inteligentes",
      "Relatórios avançados",
    ],
  },
  pro: {
    included: [
      "Tudo do Start",
      "Recebimentos inteligentes (7/30 dias)",
      "Despesas básicas",
      "Relatórios por local e ranking",
      "Metas mensais + progresso",
      "Exportações CSV e ICS",
    ],
    excluded: [
      "Alertas automáticos",
      "Relatórios avançados (tendências)",
      "Despesas avançadas com categorias",
      "Export para contador",
    ],
  },
  premium: {
    included: [
      "Tudo do Pro",
      "Alertas inteligentes",
      "Relatórios avançados (tendências)",
      "Despesas avançadas com categorias",
      "Resultado líquido real",
      "Export para contador",
      "Suporte prioritário",
    ],
    excluded: [],
  },
};

// Feature to minimum required plan mapping
export const FEATURE_REQUIRED_PLAN: Record<string, PlanType> = {
  expenses_basic: 'pro',
  receivables_smart: 'pro',
  reports_by_location: 'pro',
  monthly_goals: 'pro',
  export_csv: 'pro',
  export_ics: 'pro',
  alerts_smart: 'premium',
  reports_advanced: 'premium',
  expenses_advanced: 'premium',
  export_accountant: 'premium',
};
