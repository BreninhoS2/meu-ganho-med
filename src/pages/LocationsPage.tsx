import { useState } from 'react';
import { Plus, Building2, MapPin, DollarSign, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/navigation/AppLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Mock data for locations
const mockLocations = [
  {
    id: '1',
    name: 'Hospital São Lucas',
    type: 'hospital',
    shift12hValue: 1200,
    shift24hValue: 2400,
    consultationValue: 350,
    paymentDeadlineDays: 30,
  },
  {
    id: '2',
    name: 'UPA Centro',
    type: 'upa',
    shift12hValue: 1000,
    shift24hValue: 2000,
    consultationValue: 0,
    paymentDeadlineDays: 15,
  },
  {
    id: '3',
    name: 'Clínica Vida',
    type: 'clinica',
    shift12hValue: 0,
    shift24hValue: 0,
    consultationValue: 400,
    paymentDeadlineDays: 7,
  },
];

const typeLabels: Record<string, string> = {
  hospital: 'Hospital',
  upa: 'UPA',
  clinica: 'Clínica',
  consultorio: 'Consultório',
};

export default function LocationsPage() {
  const [locations] = useState(mockLocations);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <AppLayout title="Locais">
      <div className="space-y-4">
        {/* Header with add button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Locais</h1>
            <p className="text-sm text-muted-foreground">
              {locations.length} locais cadastrados
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo local
          </Button>
        </div>

        {/* Locations list */}
        <div className="space-y-3">
          {locations.map(location => (
            <Card key={location.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{location.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {typeLabels[location.type] || location.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir local?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os eventos associados perderão a referência a este local.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {location.shift12hValue > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>12h: {formatCurrency(location.shift12hValue)}</span>
                    </div>
                  )}
                  {location.shift24hValue > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>24h: {formatCurrency(location.shift24hValue)}</span>
                    </div>
                  )}
                  {location.consultationValue > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>Consulta: {formatCurrency(location.consultationValue)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Prazo: {location.paymentDeadlineDays} dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {locations.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg mb-2">Nenhum local cadastrado</CardTitle>
              <CardDescription className="text-center mb-4">
                Cadastre seus locais de trabalho para facilitar o registro de plantões e consultas
              </CardDescription>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar primeiro local
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
