import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useCreateManutencao, useUploadFoto } from '@/hooks/useManutencoes';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Stamp, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SelarManutencao() {
  const navigate = useNavigate();
  const { isOficina, profile } = useCurrentProfile();
  const { data: veiculos = [] } = useVeiculos({ isOficina });
  const createManutencao = useCreateManutencao();
  const uploadFoto = useUploadFoto();
  
  const [veiculoId, setVeiculoId] = useState<string>('');
  const [kmAtual, setKmAtual] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoServico, setFotoServico] = useState<File | null>(null);
  const [fotoPeca, setFotoPeca] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fotoServico || !fotoPeca) {
      toast.error('As duas fotos são obrigatórias para o selo de confiança.');
      return;
    }

    setLoading(true);
    try {
      const urlServico = await uploadFoto.mutateAsync(fotoServico);
      const urlPeca = await uploadFoto.mutateAsync(fotoPeca);

      await createManutencao.mutateAsync({
        veiculo_id: veiculoId,
        km_atual: parseInt(kmAtual),
        descricao,
        foto_url: urlServico,
        foto_peca_url: urlPeca,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Stamp className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Selar Manutenção</h1>
        </div>

        {!profile?.is_verified_admin && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-200">
              Atenção: Seu perfil ainda não foi validado como Oficina Oficial. 
              Sua selagem aparecerá como "Registro Pessoal" até sua conta ser verificada.
            </p>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select onValueChange={setVeiculoId} required>
              <SelectTrigger className="bg-secondary rounded-xl">
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {veiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.placa} - {v.modelo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quilometragem Atual</Label>
            <Input 
              type="number" 
              value={kmAtual} 
              onChange={e => setKmAtual(e.target.value)} 
              required 
              className="bg-secondary rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição do Serviço</Label>
            <Textarea 
              value={descricao} 
              onChange={e => setDescricao(e.target.value)} 
              required 
              className="bg-secondary rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase">Foto do Serviço</Label>
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-[10px] mt-1">{fotoServico ? 'OK' : 'Anexar'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => setFotoServico(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase">Foto Peça/Nota</Label>
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-[10px] mt-1">{fotoPeca ? 'OK' : 'Anexar'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => setFotoPeca(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full py-6 rounded-xl text-lg font-bold" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Selar Agora'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
