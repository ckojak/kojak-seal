import { useState, useRef } from 'react';
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
import { Camera, Stamp } from 'lucide-react';
import { toast } from 'sonner';

export default function SelarManutencao() {
  const navigate = useNavigate();
  const { isOficina } = useCurrentProfile();
  const { data: veiculos = [] } = useVeiculos({ isOficina });
  const createManutencao = useCreateManutencao();
  const uploadFoto = useUploadFoto();
  
  const [veiculoId, setVeiculoId] = useState<string>('');
  const [kmAtual, setKmAtual] = useState('');
  const [descricao, setDescricao] = useState('');
  
  // Duas fotos obrigatórias agora
  const [fotoServico, setFotoServico] = useState<File | null>(null);
  const [fotoPeca, setFotoPeca] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Redireciona o engraçadinho que tentar acessar a URL direta sem ser oficina
  if (!isOficina) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!veiculoId || !kmAtual || !descricao) {
      toast.error('Preencha todos os campos.');
      return;
    }

    if (!fotoServico || !fotoPeca) {
      toast.error('As DUAS fotos (Serviço e Peça/Nota) são obrigatórias para gerar o selo.');
      return;
    }

    setLoading(true);
    try {
      // Faz o upload das duas fotos no backend (adapte conforme seu storage permite)
      const fotoUrl1 = await uploadFoto.mutateAsync(fotoServico);
      const fotoUrl2 = await uploadFoto.mutateAsync(fotoPeca);

      await createManutencao.mutateAsync({
        veiculo_id: veiculoId,
        km_atual: parseInt(kmAtual),
        descricao: descricao,
        foto_url: fotoUrl1, // ou mescle as duas URLs conforme a base de dados
        verificado: true // Como o botão só aparece para Oficina, já entra selado
      });
      
      toast.success('Serviço selado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Erro ao selar manutenção.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Selar Manutenção Oficial</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Selecione o Veículo</Label>
            <Select onValueChange={setVeiculoId}>
              <SelectTrigger className="bg-secondary border-border rounded-xl">
                <SelectValue placeholder="Escolha um carro" />
              </SelectTrigger>
              <SelectContent>
                {veiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} - {v.marca} {v.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>KM Atual</Label>
            <Input
              type="number"
              value={kmAtual}
              onChange={(e) => setKmAtual(e.target.value)}
              placeholder="Ex: 50000"
              className="bg-secondary border-border rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição do Serviço</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o que foi feito..."
              className="bg-secondary border-border rounded-xl min-h-[100px]"
            />
          </div>

          {/* ÁREA DAS DUAS FOTOS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-primary text-xs">FOTO 1: SERVIÇO</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoServico(e.target.files?.[0] || null)}
                className="bg-secondary border-border text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-primary text-xs">FOTO 2: PEÇA/NOTA</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoPeca(e.target.files?.[0] || null)}
                className="bg-secondary border-border text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-3 bg-primary text-primary-foreground mt-8"
            disabled={loading || !veiculoId || !kmAtual || !descricao || !fotoServico || !fotoPeca}
          >
            {loading ? 'Selando...' : <><Stamp className="w-5 h-5" /> Selar Manutenção</>}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
