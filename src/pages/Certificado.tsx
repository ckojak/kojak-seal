import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { supabase } from '@/integrations/supabase/client';
import { Award, ShieldCheck, Search, Loader2, MessageCircle, Car, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export default function Certificado() {
  const { isOficina, isCEO } = useCurrentProfile();
  const [searchPlate, setSearchPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [veiculo, setVeiculo] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const placa = searchPlate.toUpperCase().trim();
    if (placa.length < 7) return toast.error("Placa inválida");
    
    setLoading(true);
    try {
      // 1. Busca o Veículo (Global)
      const { data: car, error: carError } = await supabase
        .from('veiculos')
        .select('*')
        .ilike('placa', placa)
        .maybeSingle();

      if (carError || !car) {
        setVeiculo(null);
        return toast.error("Veículo não cadastrado no sistema");
      }

      // 2. Busca TODO o histórico (Universal - Sem filtro de oficina)
      const { data: logs, error: logsError } = await supabase
        .from('manutencoes')
        .select('*')
        .eq('veiculo_id', car.id)
        .order('data_selada', { ascending: false });

      setVeiculo(car);
      setHistorico(logs || []);
      toast.success(`Histórico completo localizado: ${logs?.length || 0} registros`);
    } catch (err) {
      toast.error("Erro na consulta global");
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = veiculo ? `${window.location.origin}/v/${veiculo.id}` : '';

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        {/* BUSCA GLOBAL (SÓ PROS ELITES) */}
        {(isOficina || isCEO) && (
          <form onSubmit={handleSearch} className="mb-8 flex gap-2">
            <Input 
              placeholder="PESQUISAR PLACA..." 
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="h-14 bg-card border-border rounded-2xl font-mono text-lg font-bold"
            />
            <Button type="submit" className="h-14 w-14 rounded-2xl" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
          </form>
        )}

        {veiculo ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-b from-card to-secondary/30 border border-border p-8 rounded-[2.5rem] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Award className="w-24 h-24" /></div>
              <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-xl font-black uppercase">Certificado de Procedência</h1>
              
              <div className="my-6 py-4 border-y border-border/50">
                <h2 className="text-3xl font-mono font-bold tracking-tighter">{veiculo.placa}</h2>
                <p className="text-sm text-muted-foreground">{veiculo.marca} {veiculo.modelo}</p>
              </div>

              <div className="bg-white p-4 rounded-3xl inline-block mb-4">
                <QRCodeSVG value={publicUrl} size={150} />
              </div>
              <p className="text-[10px] text-muted-foreground">Este QR Code contém {historico.length} selos de verificação.</p>
            </div>

            {/* LISTA DE TODAS AS OFICINAS QUE JÁ MEXERAM NO CARRO */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <History className="w-4 h-4" /> Linha do Tempo Universal
              </h3>
              {historico.map((m, i) => (
                <div key={i} className="bg-card border border-border p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold">{m.oficina}</p>
                    <p className="text-[10px] text-muted-foreground">{m.descricao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono">{m.km_atual} KM</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Certificado Oficial: ' + publicUrl)}`)}
              className="w-full h-16 rounded-2xl font-bold gap-2"
            >
              <MessageCircle className="w-5 h-5" /> Compartilhar Histórico
            </Button>
          </div>
        ) : (
          <div className="py-20 text-center opacity-20"><Car className="w-20 h-20 mx-auto" /></div>
        )}
      </div>
    </AppLayout>
  );
}
