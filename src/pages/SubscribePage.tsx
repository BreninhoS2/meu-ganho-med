import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Check, X, Loader2, Crown, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, PLAN_FEATURES, PlanType } from '@/lib/stripe';

export default function SubscribePage() {
  const navigate = useNavigate();
  const { user, subscription, signOut } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const handleSubscribe = async (plan: PlanType) => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    setLoadingPlan(plan);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: STRIPE_PLANS[plan].priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Erro ao iniciar pagamento',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPlanIcon = (plan: PlanType) => {
    switch (plan) {
      case 'start':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <Sparkles className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
    }
  };

  const isCurrentPlan = (plan: PlanType) => {
    return subscription.subscribed && subscription.plan === plan;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">PlantãoMed</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Escolha seu plano</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Selecione o plano ideal para gerenciar seus plantões e finanças médicas
          </p>
          
          {user && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">
                Logado como {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sair
              </Button>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(Object.keys(STRIPE_PLANS) as PlanType[]).map((planKey) => {
            const plan = STRIPE_PLANS[planKey];
            const features = PLAN_FEATURES[planKey];
            const isCurrent = isCurrentPlan(planKey);
            const isPopular = plan.popular;

            return (
              <Card
                key={planKey}
                className={`relative overflow-hidden transition-all ${
                  isPopular
                    ? 'border-primary shadow-lg scale-105 z-10'
                    : 'border-border/50'
                } ${isCurrent ? 'ring-2 ring-primary' : ''}`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                    Mais vendido
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-br-lg">
                    Seu plano
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                    isPopular ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {getPlanIcon(planKey)}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Included features */}
                  <div className="space-y-2">
                    {features.included.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Excluded features */}
                  {features.excluded.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      {features.excluded.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 opacity-50">
                          <X className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    className="w-full mt-4"
                    variant={isPopular ? 'default' : 'outline'}
                    disabled={isCurrent || loadingPlan !== null}
                    onClick={() => handleSubscribe(planKey)}
                  >
                    {loadingPlan === planKey ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {isCurrent ? 'Plano atual' : 'Assinar agora'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ / Info */}
        <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            Pagamento seguro via Stripe. Você pode cancelar ou alterar seu plano a qualquer momento.
            Todos os planos incluem backup na nuvem e acesso em múltiplos dispositivos.
          </p>
        </div>

        {!user && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Já tem uma conta?
            </p>
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Fazer login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
