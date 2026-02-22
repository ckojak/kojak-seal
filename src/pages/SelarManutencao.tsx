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
import { Camera, Stamp, Loader2, Search, ShieldCheck, Car, AlertCircle, Clock } from 'lucide-react';
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
  const [diasRevisao, setDiasRevisao] = useState('0'); // NOVO: Controlador de Garantia/Revisão
  const [fotoServico, setFotoServico] = useState<File | null>(null);
  const [fotoPeca, setFotoPeca] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // REGRA DE ACESSO: CEO ou Oficina Verificada com Plano Ativo
  const canSeal = isCEO || (isOficina && sub?.canUsePremiumFeatures);

  const handleSearchVehicle = async () => {
    if (searchPlate.length < 7) return toast.error("Digite a placa completa");
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .ilike('placa', searchPlate.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setVeiculo(data);
        toast.success("Veículo localizado na base global!");
      } else {
        setVeiculo(null);
        toast.error("Placa não encontrada. O cliente deve cadastrar o carro primeiro.");
      }
    } catch (err) {
      toast.error("Erro ao consultar base de dados");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeSeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculo) return;
    if (!fotoServico || !fotoPeca) return toast.error("As duas fotos são obrigatórias para o selo.");

    setLoading(true);
    try {
      // Upload das evidências (Serviço + Peça/Nota)
      const urlServico = await uploadFoto.mutateAsync(fotoServico);
      const urlPeca = await uploadFoto.mutateAsync(fotoPeca);

      await createManutencao.mutateAsync({
        veiculo_id: veiculo.id,
        km_atual: parseInt(kmAtual),
        descricao,
        foto_url: urlServico,
        foto_peca_url: urlPeca,
        oficina: profile?.razao_social || 'Oficina Verificada',
        dias_revisao: parseInt(diasRevisao, 10) // NOVO: Envia os dias para o banco
      });

      toast.success("MANUTENÇÃO SELADA COM SUCESSO!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Falha ao aplicar selo imutável.");
    } finally {
      setLoading(false);
    }
  };

  if (!canSeal) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive/30 mb-4" />
          <h2 className="text-xl font-bold">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Apenas oficinas verificadas com plano ativo podem selar manutenções na rede.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Stamp className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Selar Manutenção</h1>
        </div>

        {/* BUSCA GLOBAL POR PLACA */}
        <div className="space-y-4 mb-8">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Pesquisar Veículo no App
          </Label>
          <div className="flex gap-2">
            <Input 
              placeholder="DIGITE A PLACA (EX: ABC1D23)" 
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              className="h-14 bg-secondary border-none rounded-2xl font-mono text-lg font-bold"
            />
            <Button 
              onClick={handleSearchVehicle} 
              disabled={loading}
              className="h-14 w-14 rounded-2xl shrink-0"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
          </div>
        </div>

        {/* FORMULÁRIO DE SELAGEM (Só aparece se achar o carro) */}
        {veiculo ? (
          <form onSubmit={handleFinalizeSeal} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Info do Carro Localizado */}
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Veículo Identificado</p>
                <h3 className="font-bold text-lg">{veiculo.marca} {veiculo.modelo}</h3>
                <p className="text-xs font-mono text-muted-foreground">{veiculo.placa}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kilometragem Atual (KM)</Label>
              <Input 
                type="number" 
                value={kmAtual} 
                onChange={e => setKmAtual(e.target.value)} 
                className="h-12 bg-secondary rounded-xl border-none" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição Detalhada do Serviço</Label>
              <Textarea 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)} 
                className="bg-secondary rounded-xl border-none min-h-[100px]" 
                placeholder="O que foi feito no veículo?"
                required 
              />
            </div>

            {/* NOVO: Bloco de Agendamento de Revisão */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Agendar Revisão / Garantia
              </Label>
              <select
                value={diasRevisao}
                onChange={e => setDiasRevisao(e.target.value)}
                className="h-12 w-full bg-secondary text-foreground rounded-xl border-none px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
              >
                <option value="0">Sem retorno obrigatório</option>
                <option value="30">Retorno em 30 dias (Garantia Curta)</option>
                <option value="60">Retorno em 60 dias (Revisão Padrão)</option>
                <option value="90">Retorno em 90 dias (Garantia Longa)</option>
                <option value="180">Retorno em 6 meses (Revisão Preventiva)</option>
                <option value="365">Retorno em 1 ano (Revisão Anual)</option>
              </select>
            </div>

            {/* Upload de Provas Digitais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase ml-1">Foto do Serviço</Label>
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                  <span className="text-[10px] mt-2 text-center px-2">
                    {fotoServico ? '✅ Carregada' : 'Foto do Carro na Oficina'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setFotoServico(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase ml-1">Peça / Nota</Label>
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                  <span className="text-[10px] mt-2 text-center px-2">
                    {fotoPeca ? '✅ Carregada' : 'Foto da Peça ou NF'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setFotoPeca(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="w-6 h-6" /> APLICAR SELO DIGITAL</>}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-[2rem] opacity-50">
            <Car className="w-12 h-12 mb-4" />
            <p className="text-sm">Busque uma placa para liberar o formulário de selagem.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
