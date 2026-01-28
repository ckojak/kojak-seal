import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { SealAnimation } from '@/components/SealAnimation';
import { SubscriptionRenewalModal } from '@/components/SubscriptionRenewalModal';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useCreateManutencao, useUploadFoto } from '@/hooks/useManutencoes';
import { useSubscriptionGatekeeper } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Camera, Stamp, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SelarManutencao() {
  const navigate = useNavigate();
  const { data: veiculos = [] } = useVeiculos();
  const createManutencao = useCreateManutencao();
  const uploadFoto = useUploadFoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Subscription gatekeeper
  const { showRenewalModal, checkAccess, closeModal, isLoading: subscriptionLoading } = useSubscriptionGatekeeper();
  
  const [veiculoId, setVeiculoId] = useState<string>('');
  const [kmAtual, setKmAtual] = useState('');
  const [oficina, setOficina] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [showSeal, setShowSeal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check subscription access before proceeding
    if (!checkAccess()) {
      return; // Modal will be shown by gatekeeper
    }
    
    if (!veiculoId) {
      toast.error('Selecione um veículo');
      return;
    }
    
    if (!foto) {
      toast.error('A foto é obrigatória para selar a manutenção');
      return;
    }

    setLoading(true);

    try {
      // Upload da foto primeiro
      const fotoUrl = await uploadFoto.mutateAsync(foto);
      
      // Criar manutenção (data_selada é definida pelo servidor)
      await createManutencao.mutateAsync({
        veiculo_id: veiculoId,
        km_atual: parseInt(kmAtual),
        oficina,
        descricao,
        foto_url: fotoUrl,
      });

      // Mostrar animação do selo
      setShowSeal(true);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao selar manutenção');
      setLoading(false);
    }
  };

  const handleSealComplete = () => {
    toast.success('Manutenção selada com sucesso!');
    navigate('/historico');
  };

  if (subscriptionLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SealAnimation show={showSeal} onComplete={handleSealComplete} />
      <SubscriptionRenewalModal open={showRenewalModal} onClose={closeModal} />
      
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Selar Manutenção
            </h1>
            <p className="text-sm text-muted-foreground">
              Registro imutável com timestamp do servidor
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Veículo */}
          <div className="space-y-2">
            <Label>Veículo *</Label>
            <Select value={veiculoId} onValueChange={setVeiculoId}>
              <SelectTrigger className="h-12 bg-secondary border-border rounded-xl">
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {veiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} - {v.modelo || v.marca || 'Veículo'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* KM Atual */}
          <div className="space-y-2">
            <Label>KM Atual *</Label>
            <Input
              type="number"
              value={kmAtual}
              onChange={(e) => setKmAtual(e.target.value)}
              placeholder="Ex: 45000"
              className="h-12 bg-secondary border-border rounded-xl"
              required
              min={0}
            />
          </div>

          {/* Oficina */}
          <div className="space-y-2">
            <Label>Oficina *</Label>
            <Input
              value={oficina}
              onChange={(e) => setOficina(e.target.value)}
              placeholder="Nome da oficina"
              className="h-12 bg-secondary border-border rounded-xl"
              required
              maxLength={100}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição do Serviço *</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os serviços realizados..."
              className="min-h-[100px] bg-secondary border-border rounded-xl resize-none"
              required
            />
          </div>

          {/* Upload de Foto */}
          <div className="space-y-2">
            <Label>Foto do Comprovante *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoChange}
              className="hidden"
            />
            
            {fotoPreview ? (
              <div className="relative rounded-xl overflow-hidden bg-secondary">
                <img 
                  src={fotoPreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeFoto}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-secondary/50 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Tirar foto ou fazer upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Obrigatório para autenticidade
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="seal"
            size="xl"
            className="w-full gap-3"
            disabled={loading || !veiculoId || !kmAtual || !oficina || !descricao || !foto}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Stamp className="w-6 h-6" />
                Selar Manutenção
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Ao selar, o registro se torna imutável e a data é definida pelo servidor
          </p>
        </form>
      </div>
    </AppLayout>
  );
}
