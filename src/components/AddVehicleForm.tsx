import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { usePlateAutoComplete } from '@/hooks/usePlateAutoComplete';
import { toast } from 'sonner';

interface AddVehicleFormProps {
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isSubmitting: boolean;
  initialPlaca?: string;
}

export interface VehicleFormData {
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
}

export function AddVehicleForm({ onSubmit, isSubmitting, initialPlaca = '' }: AddVehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    placa: initialPlaca,
    marca: '',
    modelo: '',
    ano: '',
    cor: '',
  });

  const { fetchByPlate, isLoading: isAutoCompleting } = usePlateAutoComplete();

  const handlePlacaBlur = useCallback(async () => {
    if (formData.placa.length >= 7 && !formData.marca && !formData.modelo) {
      const result = await fetchByPlate(formData.placa);
      if (result) {
        setFormData(prev => ({
          ...prev,
          marca: result.marca || prev.marca,
          modelo: result.modelo || prev.modelo,
          ano: result.ano || prev.ano,
          cor: result.cor || prev.cor,
        }));
        toast.success('Dados do veículo preenchidos automaticamente!');
      }
    }
  }, [formData.placa, formData.marca, formData.modelo, fetchByPlate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Placa *</Label>
        <div className="relative">
          <Input
            value={formData.placa}
            onChange={(e) => updateField('placa', e.target.value.toUpperCase())}
            onBlur={handlePlacaBlur}
            placeholder="ABC-1234"
            className="bg-secondary border-border rounded-xl"
            required
            maxLength={8}
          />
          {isAutoCompleting && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Buscando...</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Ao sair do campo, tentaremos preencher os dados automaticamente
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marca</Label>
          <Input
            value={formData.marca}
            onChange={(e) => updateField('marca', e.target.value)}
            placeholder="Toyota"
            className="bg-secondary border-border rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Modelo</Label>
          <Input
            value={formData.modelo}
            onChange={(e) => updateField('modelo', e.target.value)}
            placeholder="Corolla"
            className="bg-secondary border-border rounded-xl"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ano</Label>
          <Input
            type="number"
            value={formData.ano}
            onChange={(e) => updateField('ano', e.target.value)}
            placeholder="2024"
            className="bg-secondary border-border rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Cor</Label>
          <Input
            value={formData.cor}
            onChange={(e) => updateField('cor', e.target.value)}
            placeholder="Prata"
            className="bg-secondary border-border rounded-xl"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        variant="seal" 
        className="w-full" 
        disabled={isSubmitting || isAutoCompleting}
      >
        {isSubmitting ? 'Salvando...' : 'Adicionar veículo'}
      </Button>
    </form>
  );
}
