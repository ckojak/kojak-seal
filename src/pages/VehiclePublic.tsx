import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, CheckCircle2, Calendar, Gauge, Car, AlertCircle, Home, Image as ImageIcon, FileText } from 'lucide-react';
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
      return (data ?? []) as unknown as Manutencao[];
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
        <Button onClick={() => navigate('/')} className="mt-6 bg-primary">Voltar ao Início</Button>
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

      <main className="max-w-lg mx-auto px-6 pt-8 pb-24">
        {/* Card Principal de Identificação */}
        <section className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-800 border border-slate-700 mb-4">
            <Car className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase mb-1">{veiculo.placa}</h1>
          <p className="text-slate-400 font-medium">{veiculo.marca} {veiculo.modelo} • {veiculo.ano}</p>
        </section>

        {/* Health Score de Bilionário */}
        <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Score de Integridade</h3>
            <span className={`text-2xl font-black ${healthScore > 80 ? 'text-green-400' : 'text-amber-400'}`}>
              {healthScore}%
            </span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-1000" 
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 text-center">Baseado em {manutencoes.length} registros selados e verificados.</p>
        </section>

        {/* Linha do Tempo de Manutenções */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Histórico de Manutenções
          </h3>

          {manutencoes.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
              <p className="text-sm text-slate-500">Sem registros selados para este veículo.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {manutencoes.map((m) => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-primary/30 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{m.oficina}</h4>
                      <p className="text-xs text-slate-500">
                        {format(new Date(m.data_selada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    {m.verificado && (
                      <div className="bg-green-500/10 text-green-400 text-[10px] font-black px-2 py-1 rounded-md border border-green-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> SELADO
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 mb-6 leading-relaxed italic">"{m.descricao}"</p>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
                      <Gauge className="w-3.5 h-3.5" /> {m.km_atual.toLocaleString()} KM
                    </div>
                  </div>

                  {/* Galeria de Evidências (2 Fotos) */}
                  <div className="grid grid-cols-2 gap-3">
                    {m.foto_url ? (
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Serviço
                        </span>
                        <img src={m.foto_url} alt="Serviço" className="w-full h-32 object-cover rounded-2xl border border-slate-800 hover:scale-105 transition-transform" />
                      </div>
                    ) : (
                      <div className="h-32 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-800">
                        <span className="text-[10px] text-slate-600">Sem foto 1</span>
                      </div>
                    )}

                                        {m.foto_peca_url ? (
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Peça/Nota
                        </span>
                        <img src={m.foto_peca_url} alt="Peça ou Nota Fiscal" className="w-full h-32 object-cover rounded-2xl border border-slate-800 hover:scale-105 transition-transform" />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Peça/Nota
                        </span>
                        <div className="h-32 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-800">
                          <span className="text-[10px] text-slate-600">Sem foto</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer de Autoridade Imutável */}
        <footer className="mt-16 text-center space-y-4">
          <div className="inline-block p-4 bg-slate-900 border border-slate-800 rounded-3xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">Certificação Blockchain-Style</p>
            <p className="text-[11px] text-primary font-medium">Registros imutáveis com timestamp oficial do servidor.</p>
          </div>
          <p className="text-[10px] text-slate-600">© 2026 Ficha do Carro • Seu Mecânico Online</p>
        </footer>
      </main>

      {/* Botão Flutuante Home (Se o usuário estiver logado) */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <Home className="w-6 h-6" />
      </button>
    </div>
  );
}
