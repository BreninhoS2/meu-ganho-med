import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationsList } from '@/components/config/LocationsList';
import { LocationFormModal } from '@/components/config/LocationFormModal';
import { useDbLocations } from '@/hooks/useDbLocations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_PLANS } from '@/lib/stripe';
import { Building2, Plus, Database, Info, User, CreditCard, LogOut, Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConfigPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, subscription, signOut } = useAuth();
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const { locations, isLoading, addLocation, updateLocation, removeLocation } = useDbLocations();

  const currentPlan = subscription.plan ? STRIPE_PLANS[subscription.plan] : null;

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Erro ao abrir portal',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <AppLayout title="Configurações">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Configurações">
      <div className="space-y-6">
        {/* Account section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Conta</h2>
          </div>
          
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Logado desde {
                  user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'
                }</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </Button>
            </div>
          </Card>
        </section>

        {/* Subscription section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Assinatura</h2>
          </div>
          
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentPlan?.popular && <Crown className="w-4 h-4 text-primary" />}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Plano {currentPlan?.name || 'Nenhum'}
                  </p>
                  {subscription.subscriptionEnd && (
                    <p className="text-xs text-muted-foreground">
                      Renova em {new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManageSubscription}
                  disabled={isLoadingPortal}
                >
                  {isLoadingPortal ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : null}
                  Gerenciar
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/subscribe')}
                >
                  Alterar plano
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Locations section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Locais</h2>
            </div>
            <Button size="sm" onClick={() => setShowLocationForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          <LocationsList 
            locations={locations}
            onEdit={(id) => {
              // For now, just allow delete. Edit can be added later.
            }}
            onDelete={removeLocation}
          />
        </section>

        {/* Data section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Dados</h2>
          </div>
          
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground mb-1">
                  Seus dados estão salvos na nuvem com backup automático.
                </p>
                <p className="text-xs text-muted-foreground">
                  Acesse de qualquer dispositivo fazendo login com sua conta.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* App info */}
        <section>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">PlantãoMed v2.0</p>
            <p className="text-xs text-muted-foreground mt-1">
              Feito para médicos que querem clareza financeira
            </p>
          </Card>
        </section>
      </div>

      {showLocationForm && (
        <LocationFormModal
          onSubmit={async (location) => {
            await addLocation(location);
            setShowLocationForm(false);
          }}
          onClose={() => setShowLocationForm(false)}
        />
      )}
    </AppLayout>
  );
}
