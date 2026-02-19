import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  oficinaEmail?: string;
}

export function AddVehicleForm({ onSubmit, isSubmitting, initialPlaca = '' }: AddVehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    placa: initialPlaca,
    marca: '',
    modelo: '',
    ano: '',
    cor: '',
    oficinaEmail: '',
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

  const updateField = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Placa do Veículo</Label>
        <Input
          value={formData.placa}
          onChange={(e) => updateField('placa', e.target.value)}
          onBlur={handlePlacaBlur}
          placeholder="ABC1234 ou ABC1D23"
          className="bg-secondary border-border rounded-xl uppercase"
          maxLength={7}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marca</Label>
          <Input
            value={formData.marca}
            onChange={(e) => updateField('marca', e.target.value)}
            placeholder="Toyota"
            className="bg-secondary border-border rounded-xl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Modelo</Label>
          <Input
            value={formData.modelo}
            onChange={(e) => updateField('modelo', e.target.value)}
            placeholder="Corolla"
            className="bg-secondary border-border rounded-xl"
            required
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
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Cor</Label>
          <Input
            value={formData.cor}
            onChange={(e) => updateField('cor', e.target.value)}
            placeholder="Prata"
            className="bg-secondary border-border rounded-xl"
            required
          />
        </div>
      </div>

      <div className="space-y-2 mt-4 p-4 bg-secondary/30 border border-border rounded-xl">
        <Label className="text-primary">E-mail da Oficina (Opcional)</Label>
        <Input
          type="email"
          value={formData.oficinaEmail}
          onChange={(e) => updateField('oficinaEmail', e.target.value)}
          placeholder="oficina@email.com"
          className="bg-secondary border-border rounded-xl"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Se o carro for de um cliente, digite o e-mail da sua oficina para ter acesso ao veículo. Se você for o cliente, coloque o e-mail do seu mecânico de confiança.
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-6" 
        disabled={isSubmitting || isAutoCompleting}
      >
        {isSubmitting ? 'Salvando...' : 'Adicionar veículo'}
      </Button>
    </form>
  );
}
