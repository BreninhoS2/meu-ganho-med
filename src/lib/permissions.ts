import { PlanType } from './stripe';

// Routes accessible by each plan level
export const BASE_ROUTES = [
  '/start',
  '/pro', 
  '/premium',
  '/agenda',
  '/calendario',
  '/locais',
  '/pagamentos',
  '/dashboard',
  '/config',
];

// Routes that require specific plans
export const ROUTE_REQUIRED_PLAN: Record<string, PlanType> = {
  // Pro routes
  '/despesas': 'pro',
  '/relatorios': 'pro',
  '/metas': 'pro',
  '/export': 'pro',
  // Premium routes
  '/alertas-inteligentes': 'premium',
  '/insights': 'premium',
  '/resultado-real': 'premium',
  '/contador': 'premium',
  '/suporte': 'premium',
};

// Home route for each plan
export const PLAN_HOME_ROUTES: Record<PlanType, string> = {
  start: '/start',
  pro: '/pro',
  premium: '/premium',
};

// Plan hierarchy for comparison
const PLAN_HIERARCHY: PlanType[] = ['start', 'pro', 'premium'];

/**
 * Check if a user with a given plan can access a specific route
 */
export function canAccessRoute(userPlan: PlanType | null, route: string): boolean {
  // No plan means no access to protected routes
  if (!userPlan) return false;

  // Base routes are accessible to all plans
  if (BASE_ROUTES.includes(route)) return true;

  // Check if route requires a specific plan
  const requiredPlan = ROUTE_REQUIRED_PLAN[route];
  
  // If no required plan, allow access
  if (!requiredPlan) return true;

  // Compare plan hierarchy
  const userPlanIndex = PLAN_HIERARCHY.indexOf(userPlan);
  const requiredPlanIndex = PLAN_HIERARCHY.indexOf(requiredPlan);

  return userPlanIndex >= requiredPlanIndex;
}

/**
 * Get the required plan for a specific route
 */
export function getRequiredPlanForRoute(route: string): PlanType | null {
  return ROUTE_REQUIRED_PLAN[route] || null;
}

/**
 * Get the home route for a specific plan
 */
export function getPlanHomeRoute(plan: PlanType | null): string {
  if (!plan) return '/subscribe';
  return PLAN_HOME_ROUTES[plan];
}

// Menu items configuration with plan requirements
export interface MenuItem {
  path: string;
  icon: string;
  label: string;
  requiredPlan: PlanType | null;
  badge?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  // Start plan routes (accessible to all)
  { path: '/agenda', icon: 'Calendar', label: 'Agenda', requiredPlan: null },
  { path: '/calendario', icon: 'CalendarDays', label: 'Calendário', requiredPlan: null },
  { path: '/locais', icon: 'Building2', label: 'Locais', requiredPlan: null },
  { path: '/pagamentos', icon: 'Receipt', label: 'Pagamentos', requiredPlan: null },
  { path: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard', requiredPlan: null },
  // Pro plan routes
  { path: '/despesas', icon: 'Wallet', label: 'Despesas', requiredPlan: 'pro', badge: 'Pro' },
  { path: '/relatorios', icon: 'BarChart3', label: 'Relatórios', requiredPlan: 'pro', badge: 'Pro' },
  { path: '/metas', icon: 'Target', label: 'Metas', requiredPlan: 'pro', badge: 'Pro' },
  { path: '/export', icon: 'Download', label: 'Exportar', requiredPlan: 'pro', badge: 'Pro' },
  // Premium plan routes
  { path: '/alertas-inteligentes', icon: 'Bell', label: 'Alertas', requiredPlan: 'premium', badge: 'Premium' },
  { path: '/insights', icon: 'TrendingUp', label: 'Insights', requiredPlan: 'premium', badge: 'Premium' },
  { path: '/resultado-real', icon: 'Calculator', label: 'Resultado Real', requiredPlan: 'premium', badge: 'Premium' },
  { path: '/contador', icon: 'FileSpreadsheet', label: 'Contador', requiredPlan: 'premium', badge: 'Premium' },
  { path: '/suporte', icon: 'Headphones', label: 'Suporte', requiredPlan: 'premium', badge: 'Premium' },
];

/**
 * Get menu items filtered by user plan
 */
export function getMenuItemsForPlan(userPlan: PlanType | null): (MenuItem & { locked: boolean })[] {
  return MENU_ITEMS.map(item => ({
    ...item,
    locked: item.requiredPlan ? !canAccessRoute(userPlan, item.path) : false,
  }));
}
