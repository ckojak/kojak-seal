import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useCreateManutencao, useUploadFoto } from '@/hooks/useManutencoes';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Stamp, Loader2, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SelarManutencao() {
  const navigate = useNavigate();
  const { isOficina, isCEO, profile } = useCurrentProfile();
  const { data: sub } = useSubscription();
  const createManutencao = useCreateManutencao();
  const uploadFoto = useUploadFoto();

  const [searchPlate, setSearchPlate] = useState('');
  const [veiculo, setVeiculo] = useState<any>(null);
  const [kmAtual, setKmAtual] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoServico, setFotoServico] = useState<File | null>(null);
  const [fotoPeca, setFotoPeca] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const canSeal = isCEO || (isOficina && sub?.canUsePremiumFeatures);

  const findCar = async () => {
    if (searchPlate.length < 7) return;
    setLoading(true);
    const { data } = await supabase.from('veiculos').select('*').eq('placa', searchPlate.toUpperCase()).maybeSingle();
    if (data) {
      setVeiculo(data);
      toast.success("Carro identificado para selagem");
    } else {
      toast.error("Carro não encontrado. Peça ao cliente para cadastrar primeiro.");
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculo) return toast.error("Busque um veículo primeiro");
    if (!fotoServico || !fotoPeca) return toast.error("Fotos obrigatórias!");
    
    setLoading(true);
    try {
      const url1 = await uploadFoto.mutateAsync(fotoServico);
      const url2 = await uploadFoto.mutateAsync(fotoPeca);
      
      await createManutencao.mutateAsync({
        veiculo_id: veiculo.id,
        km_atual: parseInt(kmAtual),
        descricao,
        foto_url: url1,
        foto_peca_url: url2,
        oficina: profile?.razao_social || 'Oficina Verificada'
      });

      toast.success("Selo aplicado com sucesso!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Erro ao selar");
    } finally {
      setLoading(false);
    }
  };

  if (!canSeal) return <AppLayout><div className="p-10 text-center font-bold">Acesso Negado</div></AppLayout>;

  return (
    <AppLayout>
      <div className="px-4 py-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2"><Stamp className="text-primary" /> Selagem Profissional</h1>
        
        {/* BUSCA DO CARRO */}
        <div className="mb-8 flex gap-2">
          <Input 
            placeholder="PLACA DO CLIENTE..." 
            value={searchPlate} 
            onChange={e => setSearchPlate(e.target.value.toUpperCase())}
            className="h-12 bg-secondary rounded-xl font-bold"
          />
          <Button onClick={findCar} disabled={loading} className="h-12 rounded-xl"><Search /></Button>
        </div>

        {veiculo && (
          <form onSubmit={handleUpload} className="space-y-6 animate-in fade-in">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-3">
              <ShieldCheck className="text-primary" />
              <p className="text-sm font-bold text-primary">{veiculo.marca} {veiculo.modelo} ({veiculo.placa})</p>
            </div>

            <div className="space-y-2">
              <Label>KM Atual</Label>
              <Input type="number" value={kmAtual} onChange={e => setKmAtual(e.target.value)} className="bg-secondary h-12 rounded-xl" required />
            </div>

            <div className="space-y-2">
              <Label>Descrição do Serviço</Label>
              <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="bg-secondary rounded-xl" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer bg-secondary/50">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] mt-1">{fotoServico ? 'OK' : 'Foto Serviço'}</span>
                <input type="file" className="hidden" onChange={e => setFotoServico(e.target.files?.[0] || null)} />
              </label>
              <label className="h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer bg-secondary/50">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] mt-1">{fotoPeca ? 'OK' : 'Foto Peça/Nota'}</span>
                <input type="file" className="hidden" onChange={e => setFotoPeca(e.target.files?.[0] || null)} />
              </label>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Selo de Confiança'}
            </Button>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
