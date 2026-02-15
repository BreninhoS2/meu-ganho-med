import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function CheckoutTestPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'price_1T15A7GTYqtJZx3uot1IDKV1' },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error('Nenhuma URL retornada');

      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-background">
      <h1 className="text-2xl font-bold">Checkout de Teste</h1>
      <p className="text-muted-foreground text-sm">
        Usuário: {user?.email ?? 'não logado'}
      </p>
      <p className="text-muted-foreground text-xs">
        priceId: <code>price_1T15A7GTYqtJZx3uot1IDKV1</code>
      </p>

      <Button onClick={handleCheckout} disabled={loading || !user} size="lg">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Assinar plano premium (teste)
      </Button>

      {!user && <p className="text-destructive text-sm">Faça login primeiro.</p>}
      {error && <p className="text-destructive text-sm">Erro: {error}</p>}
    </div>
  );
}
