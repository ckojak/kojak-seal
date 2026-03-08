import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, CheckCircle2, Calendar, Gauge, Car, AlertCircle, Home, Image as ImageIcon, FileText, Fingerprint, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateHealthScore, Manutencao } from '@/hooks/useManutencoes';
import { Veiculo } from '@/hooks/useVeiculos';
import { Button } from '@/components/ui/button';

export default function VehiclePublic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: veiculo, isLoading: loadingVeiculo } = useQuery({
    queryKey: ['veiculo-publico', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('veiculos').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Veiculo;
    },
    enabled: !!id,
  });

  const { data: manutencoes = [], isLoading: loadingManutencoes } = useQuery({
    queryKey: ['manutencoes-publicas', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('manutencoes')
        .select('*')
        .eq('veiculo_id', id)
        .order('data_selada', { ascending: false });
      if (error) throw error;
      return data as Manutencao[];
    },
    enabled: !!id,
  });

  const healthScore = calculateHealthScore(manutencoes);
  const isLoading = loadingVeiculo || loadingManutencoes;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-white">Veículo Não Encontrado</h1>
        <p className="text-slate-400 mt-2">Este link é inválido ou o registro foi removido.</p>
        <Button onClick={() => navigate('/')} className="mt-6 bg-primary font-bold">Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-primary/30">
      {/* Header Institucional */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="font-black tracking-tighter text-lg uppercase text-white">Ficha do Carro</span>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-primary uppercase">Dados Oficiais</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 pt-8 pb-32">
        {/* Card Principal de Identificação */}
        <section className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-800 border border-slate-700 mb-4 shadow-2xl">
            <Car className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase mb-1">{veiculo.placa}</h1>
          <p className="text-slate-400 font-medium">{veiculo.marca} {veiculo.modelo} • {veiculo.ano}</p>
        </section>

        {/* Health Score de Bilionário */}
        <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Score de Integridade</h3>
            <span className={`text-2xl font-black ${healthScore > 80 ? 'text-green-400' : 'text-amber-400'}`}>
              {healthScore}%
            </span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-primary via-blue-400 to-primary transition-all duration-1000" 
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 text-center">Auditado com base em {manutencoes.length} registros imutáveis.</p>
        </section>

        {/* Linha do Tempo de Manutenções */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Histórico de Manutenções
          </h3>

          {manutencoes.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
              <p className="text-sm text-slate-500 font-medium italic">Sem registros selados para este veículo.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {manutencoes.map((m) => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-primary/40 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-white text-lg tracking-tight uppercase">{m.oficina}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {format(new Date(m.data_selada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-xl border border-green-500/20 flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SELADO
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-6 leading-relaxed bg-slate-800/30 p-4 rounded-2xl border border-slate-800/50">
                    <span className="text-primary font-serif text-lg leading-none mr-1">"</span>
                    {m.descricao}
                    <span className="text-primary font-serif text-lg leading-none ml-1">"</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 border border-slate-700">
                      <Gauge className="w-3.5 h-3.5 text-primary" /> {m.km_atual.toLocaleString()} KM
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-950/50 px-3 py-1.5 rounded-lg text-slate-500 border border-slate-800">
                      <Fingerprint className="w-3.5 h-3.5" /> Hash: {m.id.substring(0, 8).toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Registro de Serviço
                      </span>
                      {m.foto_url ? (
                        <img src={m.foto_url} alt="Serviço" className="w-full h-32 object-cover rounded-2xl border border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer" />
                      ) : (
                        <div className="h-32 bg-slate-800/30 rounded-2xl flex items-center justify-center border border-dashed border-slate-700">
                          <span className="text-[9px] text-slate-600 font-bold">SEM IMAGEM</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Peça / Comprovante
                      </span>
                      {(m as any).foto_peca_url ? (
                        <img src={(m as any).foto_peca_url} alt="Peça" className="w-full h-32 object-cover rounded-2xl border border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer" />
                      ) : (
                        <div className="h-32 bg-slate-800/30 rounded-2xl flex items-center justify-center border border-dashed border-slate-700 text-center px-4">
                          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Aguardando comprovação</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Funil de Crescimento (O Pulo do Gato) */}
        <section className="mt-16 bg-gradient-to-br from-primary/20 to-blue-600/10 border border-primary/20 p-8 rounded-[2.5rem] text-center shadow-2xl">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Tenha este selo no seu carro</h3>
          <p className="text-sm text-slate-300 mb-6">A única plataforma que garante o valor de revenda através da transparência digital imutável.</p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-6 rounded-2xl text-lg group"
          >
            CRIAR MINHA FICHA GRÁTIS
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </section>

        {/* Footer de Autoridade */}
        <footer className="mt-12 text-center pb-8">
          <div className="inline-block p-4 bg-slate-900/50 border border-slate-800 rounded-3xl mb-4">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mb-1 italic">Security Protocol Active</p>
            <p className="text-[11px] text-primary/80 font-bold">Certificação descentralizada com timestamp oficial.</p>
          </div>
          <p className="text-[10px] text-slate-600 font-medium">© 2026 FICHA DO CARRO • INFRAESTRUTURA DIGITAL VEICULAR</p>
        </footer>
      </main>

      {/* Botão Flutuante Home */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white/10 z-[60]"
      >
        <Home className="w-6 h-6" />
      </button>
    </div>
  );
}
