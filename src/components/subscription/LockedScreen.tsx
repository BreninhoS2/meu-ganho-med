import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowLeft, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanType, PLAN_FEATURES } from '@/lib/stripe';
import { AppLayout } from '@/components/navigation/AppLayout';

interface LockedScreenProps {
  requiredPlan: PlanType;
  currentRoute: string;
}

const planIcons: Record<PlanType, React.ReactNode> = {
  start: <Zap className="w-6 h-6" />,
  pro: <Sparkles className="w-6 h-6" />,
  premium: <Crown className="w-6 h-6" />,
};

const planNames: Record<PlanType, string> = {
  start: 'Start',
  pro: 'Pro',
  premium: 'Premium',
};

const planColors: Record<PlanType, string> = {
  start: 'from-blue-500 to-cyan-500',
  pro: 'from-primary to-emerald-400',
  premium: 'from-amber-500 to-orange-500',
};

export function LockedScreen({ requiredPlan, currentRoute }: LockedScreenProps) {
  const navigate = useNavigate();
  
  const features = PLAN_FEATURES[requiredPlan]?.included || [];

  const handleUpgrade = () => {
    navigate(`/subscribe?plan=${requiredPlan}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <AppLayout title="Recurso Bloqueado">
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${planColors[requiredPlan]} p-6 text-white`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4"
              >
                <Lock className="w-8 h-8" />
              </motion.div>
              <CardTitle className="text-center text-xl text-white">
                Recurso Exclusivo
              </CardTitle>
              <CardDescription className="text-center text-white/80 mt-2">
                Este recurso está disponível no plano {planNames[requiredPlan]}
              </CardDescription>
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                {planIcons[requiredPlan]}
                <span className="font-semibold text-lg text-foreground">
                  Plano {planNames[requiredPlan]}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Benefits list */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Ao fazer upgrade, você terá acesso a:
                </p>
                <ul className="space-y-2">
                  {features.slice(0, 5).map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleUpgrade} 
                  className="w-full"
                  size="lg"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Fazer upgrade agora
                </Button>
                <Button 
                  onClick={handleGoBack} 
                  variant="ghost" 
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
