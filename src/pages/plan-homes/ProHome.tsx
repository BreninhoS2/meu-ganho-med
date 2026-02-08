import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Receipt,
  Wallet,
  Target,
  BarChart3,
  Download,
  ArrowRight,
  Crown,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/navigation/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

const proFeatureCards = [
  {
    title: 'Recebimentos',
    description: 'Próximos 7 e 30 dias',
    icon: Receipt,
    path: '/pagamentos',
    color: 'bg-green-500/10 text-green-600',
    stat: 'R$ 12.500',
    statLabel: 'Próx. 7 dias',
  },
  {
    title: 'Despesas',
    description: 'Controle por categoria',
    icon: Wallet,
    path: '/despesas',
    color: 'bg-red-500/10 text-red-600',
    stat: 'R$ 3.200',
    statLabel: 'Este mês',
  },
  {
    title: 'Metas',
    description: 'Progresso mensal',
    icon: Target,
    path: '/metas',
    color: 'bg-amber-500/10 text-amber-600',
    stat: '68%',
    statLabel: 'Atingido',
  },
  {
    title: 'Relatórios',
    description: 'Por local e ranking',
    icon: BarChart3,
    path: '/relatorios',
    color: 'bg-blue-500/10 text-blue-600',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ProHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <AppLayout title="Início">
      <div className="space-y-6">
        {/* Header with plan badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Olá, {userName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Seu controle financeiro
            </p>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            Plano Pro
          </Badge>
        </div>

        {/* Financial summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Recebido este mês
                  </p>
                  <p className="text-2xl font-bold text-primary">R$ 18.450</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    A receber
                  </p>
                  <p className="text-2xl font-bold text-foreground">R$ 8.200</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Meta do mês</span>
                  <span className="font-medium">R$ 18.450 / R$ 25.000</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          {proFeatureCards.map((card) => (
            <motion.div key={card.path} variants={item}>
              <Card 
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                onClick={() => navigate(card.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {card.description}
                  </CardDescription>
                  {card.stat && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-lg font-semibold text-foreground">{card.stat}</p>
                      <p className="text-xs text-muted-foreground">{card.statLabel}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Export actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/export')}
                >
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/export')}
                >
                  ICS (Calendário)
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Alertas e Insights avançados
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Faça upgrade para Premium e tenha automação completa
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/subscribe?plan=premium')}
                  variant="outline"
                  className="hidden sm:flex border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                >
                  Ver planos
                </Button>
              </div>
              <Button 
                onClick={() => navigate('/subscribe?plan=premium')}
                variant="outline"
                className="w-full mt-4 sm:hidden border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
              >
                Ver planos
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
