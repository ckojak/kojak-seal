import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useCreateManutencao, useUploadFoto } from '@/hooks/useManutencoes';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Stamp, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function SelarManutencao() {
  const navigate = useNavigate();
  const { isOficina, isCEO, profile } = useCurrentProfile();
  const { data: sub } = useSubscription();
  const { data: veiculos = [] } = useVeiculos({ isOficina });
  const createManutencao = useCreateManutencao();
  const uploadFoto = useUploadFoto();
  
  const [veiculoId, setVeiculoId] = useState<string>('');
  const [kmAtual, setKmAtual] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoServico, setFotoServico] = useState<File | null>(null);
  const [fotoPeca, setFotoPeca] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // REGRA UNIVERSAL DE BILIONÁRIO
  const canSeal = isCEO || (isOficina && sub?.canUsePremiumFeatures);

  if (!canSeal) {
    return (
      <AppLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-destructive opacity-20" />
          <h2 className="text-xl font-bold">Acesso Bloqueado</h2>
          <p className="text-sm text-muted-foreground">Você precisa de uma oficina verificada pelo CEO e um plano ativo para selar manutenções.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="rounded-xl">Voltar ao Início</Button>
        </div>
      </AppLayout>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fotoServico || !fotoPeca) return toast.error('Anexe as duas fotos obrigatórias.');
    setLoading(true);
    try {
      const urlServico = await uploadFoto.mutateAsync(fotoServico);
      const urlPeca = await uploadFoto.mutateAsync(fotoPeca);
      await createManutencao.mutateAsync({ veiculo_id: veiculoId, km_atual: parseInt(kmAtual), descricao, foto_url: urlServico, foto_peca_url: urlPeca });
      navigate('/dashboard');
    } catch (error) { toast.error('Erro ao salvar selagem'); } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="px-4 py-8 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-8"><Stamp className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold">Selar Manutenção</h1></div>
        
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select onValueChange={setVeiculoId} required>
              <SelectTrigger className="bg-secondary h-12 rounded-xl"><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
              <SelectContent>{veiculos.map((v) => (<SelectItem key={v.id} value={v.id}>{v.placa} - {v.modelo}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2"><Label>KM Atual</Label><Input type="number" value={kmAtual} onChange={e => setKmAtual(e.target.value)} className="h-12 bg-secondary rounded-xl" required /></div>
          <div className="space-y-2"><Label>Descrição</Label><Textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="bg-secondary rounded-xl" required /></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-[10px]">FOTO DO SERVIÇO</Label>
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer bg-secondary/30">
                <Camera className="w-6 h-6 text-muted-foreground" /><span className="text-[10px] mt-1">{fotoServico ? 'Anexado' : 'Carregar'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => setFotoServico(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="space-y-1"><Label className="text-[10px]">PEÇA / NOTA</Label>
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer bg-secondary/30">
                <Camera className="w-6 h-6 text-muted-foreground" /><span className="text-[10px] mt-1">{fotoPeca ? 'Anexado' : 'Carregar'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => setFotoPeca(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl font-bold" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Selo de Confiança'}</Button>
        </form>
      </div>
    </AppLayout>
  );
}
