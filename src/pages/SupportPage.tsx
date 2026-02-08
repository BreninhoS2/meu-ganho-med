import { 
  Headphones, 
  MessageCircle, 
  Mail,
  Phone,
  Clock,
  ExternalLink,
  HelpCircle,
  FileQuestion
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/navigation/AppLayout';

const supportChannels = [
  {
    icon: MessageCircle,
    title: 'Chat ao vivo',
    description: 'Converse com nossa equipe em tempo real',
    action: 'Iniciar chat',
    available: true,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    icon: Mail,
    title: 'E-mail',
    description: 'Envie sua dúvida por e-mail',
    action: 'Enviar e-mail',
    email: 'suporte@plantaomed.com.br',
    available: true,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Phone,
    title: 'Telefone',
    description: 'Ligue para nossa central',
    action: '0800 123 4567',
    available: true,
    color: 'bg-purple-500/10 text-purple-600',
  },
];

const faqItems = [
  {
    question: 'Como faço para adicionar um novo local?',
    answer: 'Acesse a página de Locais e clique em "Novo local".',
  },
  {
    question: 'Posso exportar meus dados para Excel?',
    answer: 'Sim! Na página de Exportar você pode baixar em formato CSV.',
  },
  {
    question: 'Como cancelo minha assinatura?',
    answer: 'Acesse Configurações > Assinatura > Gerenciar assinatura.',
  },
];

export default function SupportPage() {
  return (
    <AppLayout title="Suporte">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Suporte Prioritário</h1>
            <p className="text-sm text-muted-foreground">
              Atendimento exclusivo Premium
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            Premium
          </Badge>
        </div>

        {/* Priority badge */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Você tem atendimento prioritário!
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Tempo médio de resposta: menos de 2 horas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support channels */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">Canais de atendimento</h2>
          {supportChannels.map((channel) => (
            <Card key={channel.title}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${channel.color}`}>
                    <channel.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{channel.title}</h4>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {channel.action}
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Perguntas frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="space-y-1">
                <h4 className="font-medium text-foreground text-sm flex items-start gap-2">
                  <FileQuestion className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  {item.question}
                </h4>
                <p className="text-sm text-muted-foreground pl-6">{item.answer}</p>
                {index < faqItems.length - 1 && (
                  <div className="border-b border-border/50 pt-3" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
