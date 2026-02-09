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
import { getPlanHomeRoute } from '@/lib/permissions';
import { Building2, Plus, Database, Info, User, CreditCard, LogOut, Crown, Loader2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Location } from '@/types';

export default function ConfigPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, subscription, signOut } = useAuth();
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const { locations, isLoading, addLocation, updateLocation, removeLocation, getLocationById } = useDbLocations();

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

  const handleGoToEnvironment = () => {
    const homeRoute = getPlanHomeRoute(subscription.plan);
    navigate(homeRoute);
  };

  const handleEditLocation = (id: string) => {
    const location = getLocationById(id);
    if (location) {
      setEditingLocation(location);
      setShowLocationForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowLocationForm(false);
    setEditingLocation(null);
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
          
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  Plano {currentPlan?.name || 'Nenhum'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="default" size="sm" className="w-full justify-start" onClick={handleGoToEnvironment}>
                <Home className="w-4 h-4 mr-2" />
                Ir para o ambiente
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/subscribe')}>
                <CreditCard className="w-4 h-4 mr-2" />
                Plano / Assinatura
              </Button>
              {subscription.subscribed && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleManageSubscription}
                  disabled={isLoadingPortal}
                >
                  {isLoadingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
                  Gerenciar assinatura
                </Button>
              )}
              <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
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
            <Button size="sm" onClick={() => { setEditingLocation(null); setShowLocationForm(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          <LocationsList 
            locations={locations}
            onEdit={handleEditLocation}
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
          editingLocation={editingLocation ?? undefined}
          onSubmit={async (locationData) => {
            if (editingLocation) {
              await updateLocation(editingLocation.id, locationData);
            } else {
              await addLocation(locationData);
            }
            handleCloseForm();
          }}
          onClose={handleCloseForm}
        />
      )}
    </AppLayout>
  );
}
