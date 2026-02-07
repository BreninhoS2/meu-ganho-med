import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface QuickInsightsProps {
  insights: string[];
}

export function QuickInsights({ insights }: QuickInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="p-4 bg-accent/30 border-accent">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-accent-foreground" />
        </div>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <p key={index} className="text-sm text-foreground">
              {insight}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
}
