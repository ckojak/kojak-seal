import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { supabase } from '@/integrations/supabase/client';
import { Award, ShieldCheck, Search, Loader2, Share2, FileDown, MessageCircle, Car, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export default function Certificado() {
  const { isOficina, isCEO } = useCurrentProfile();
  const [searchPlate, setSearchPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [veiculo, setVeiculo] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlate.length < 7) return toast.error("Digite uma placa válida");
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .ilike('placa', `%${searchPlate}%`)
        .single();

      if (error || !data) {
        setVeiculo(null);
        toast.error("Veículo não encontrado na base oficial");
      } else {
        setVeiculo(data);
        toast.success("Histórico localizado!");
      }
    } catch (err) {
      toast.error("Erro na busca");
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = veiculo ? `${window.location.origin}/v/${veiculo.id}` : '';

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        
        {/* BUSCA - SÓ PARA OFICINA OU CEO */}
        {(isOficina || isCEO) ? (
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Search className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Consultar Placa Global</h2>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input 
                placeholder="EX: ABC1D23" 
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                className="h-14 bg-card border-border rounded-2xl font-mono text-lg font-bold"
                maxLength={7}
              />
              <Button type="submit" className="h-14 w-14 rounded-2xl shrink-0" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
              </Button>
            </form>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <p className="text-xs text-muted-foreground">Apenas oficinas credenciadas podem emitir certificados de terceiros.</p>
          </div>
        )}

        {/* RESULTADO DO CERTIFICADO */}
        {veiculo ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative bg-gradient-to-b from-card to-secondary/30 border border-border p-8 rounded-[2.5rem] shadow-xl overflow-hidden mb-8">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Award className="w-32 h-32 text-primary" />
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <ShieldCheck className="w-10 h-10 text-primary" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-black tracking-tight uppercase">Certificado Digital</h1>
                  <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">Status: Verificado</p>
                </div>

                <div className="w-full py-6 border-y border-border/50 my-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Identificação do Veículo</p>
                  <h2 className="text-3xl font-mono font-bold text-foreground">{veiculo.placa}</h2>
                  <p className="text-sm font-medium text-muted-foreground">{veiculo.marca} {veiculo.modelo}</p>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-inner mb-4">
                  <QRCodeSVG value={publicUrl} size={160} level="H" />
                </div>
                <p className="text-[10px] text-muted-foreground max-w-[200px]">
                  Documento gerado para fins de comprovação de procedência e histórico de manutenção.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Confira o certificado do carro ' + veiculo.placa + ': ' + publicUrl)}`, '_blank')}
                className="h-16 rounded-2xl bg-primary text-primary-foreground font-bold gap-3"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar para o Cliente
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <Car className="w-20 h-20 mb-4" />
            <p className="text-sm font-medium">Aguardando busca de placa...</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
