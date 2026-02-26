import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Car, Wrench, Shield, Building2, Phone, MapPin, Loader2, CheckCircle2, Lock, Scale } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'cliente' | 'oficina' | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyingCnpj, setVerifyingCnpj] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Trava da Receita
  const [acceptedTerms, setAcceptedTerms] = useState(false); // Trava Jurídica
  const [form, setForm] = useState({ cnpj: '', razaoSocial: '', endereco: '', telefone: '' });

  // Monitor de Verificação Automática de CNPJ
  useEffect(() => {
    const cleanCnpj = form.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14 && userType === 'oficina' && !isLocked) {
      handleVerifyCnpj(cleanCnpj);
    }
  }, [form.cnpj]);

  const handleVerifyCnpj = async (cnpj: string) => {
    setVerifyingCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      if (data.situacao === "ATIVA") {
        setForm(prev => ({
          ...prev,
          razaoSocial: data.razao_social || data.nome_fantasia,
          endereco: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio} - ${data.uf}`
        }));
        setIsLocked(true); // TRANCA OS DADOS DA RECEITA
        toast.success("Oficina validada na Receita Federal!");
      } else {
        toast.error("Este CNPJ não está ATIVO na Receita.");
      }
    } catch (err) {
      toast.error("CNPJ não encontrado. Verifique os números.");
    } finally {
      setVerifyingCnpj(false);
    }
  };

  const handleFinalize = async (type: 'cliente' | 'oficina') => {
    if (type === 'oficina' && (!form.cnpj || !form.razaoSocial)) {
      toast.error("Dados da oficina incompletos.");
      return;
    }

    setLoading(true);
    try {
      const updateData = type === 'cliente' 
        ? { user_type: 'cliente', onboarding_completed: true }
        : { 
            user_type: 'oficina', 
            cnpj: form.cnpj.replace(/\D/g, ''),
            razao_social: form.razaoSocial,
            endereco: form.endereco,
            telefone: form.telefone.replace(/\D/g, ''),
            display_name: form.razaoSocial,
            onboarding_completed: true,
            is_verified: true // Selado automaticamente após verificação de CNPJ
          };

      const { error } = await supabase.from('profiles').update(updateData).eq('user_id', user!.id);
      
      if (error) throw error;
      
      toast.success('Perfil imutável criado com sucesso!');
      navigate('/dashboard');
    } catch (error) { 
      toast.error('Erro ao salvar os dados no sistema.'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0F172A]">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo Shield */}
        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20 shadow-2xl">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Ficha do Carro</h1>
          <p className="text-slate-400 mt-2 font-medium">Configuração de Protocolo Inicial</p>
        </div>
        
        {!userType ? (
          <div className="grid gap-4">
            <Button 
              onClick={() => handleFinalize('cliente')} 
              variant="outline" 
              className="h-24 bg-slate-900 border-slate-800 hover:border-primary/50 rounded-[2rem] gap-4 justify-start px-8 group transition-all"
            >
              <Car className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" /> 
              <div className="text-left text-white">
                <p className="font-black uppercase text-sm tracking-tight">Sou Cliente</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Acesso aos meus veículos</p>
              </div>
            </Button>

            <Button 
              onClick={() => setUserType('oficina')} 
              variant="outline" 
              className="h-24 bg-slate-900 border-slate-800 hover:border-primary/50 rounded-[2rem] gap-4 justify-start px-8 group transition-all"
            >
              <Wrench className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" /> 
              <div className="text-left text-white">
                <p className="font-black uppercase text-sm tracking-tight">Sou Oficina</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Emissão de selos e manutenção</p>
              </div>
            </Button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-5 text-left shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CNPJ (Verificação Automática)</Label>
                {verifyingCnpj && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
              </div>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  value={form.cnpj} 
                  onChange={e => !isLocked && setForm({...form, cnpj: e.target.value})} 
                  disabled={isLocked}
                  placeholder="00.000.000/0001-00" 
                  className={`bg-slate-950 border-slate-800 h-14 pl-11 rounded-2xl text-white focus-visible:ring-primary/30 ${isLocked ? 'opacity-60' : ''}`}
                />
                {isLocked && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Nome Fantasia Oficial</Label>
              <Input 
                value={form.razaoSocial} 
                onChange={e => setForm({...form, razaoSocial: e.target.value})} 
                readOnly={isLocked}
                className={`bg-slate-950 border-slate-800 h-14 rounded-2xl text-white ${isLocked ? 'opacity-60' : ''}`}
                placeholder="Carregando da Receita..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Endereço de Atendimento</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  value={form.endereco} 
                  onChange={e => setForm({...form, endereco: e.target.value})} 
                  readOnly={isLocked}
                  className={`bg-slate-950 border-slate-800 h-14 pl-11 rounded-2xl text-white font-medium text-xs ${isLocked ? 'opacity-60' : ''}`}
                  placeholder="Rua, Número, Bairro, Cidade"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">WhatsApp da Oficina</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  value={form.telefone} 
                  onChange={e => setForm({...form, telefone: e.target.value})} 
                  placeholder="(00) 00000-0000"
                  className="bg-slate-950 border-slate-800 h-14 pl-11 rounded-2xl text-white"
                />
              </div>
            </div>

            {/* Trava Jurídica - Só aparece após o CNPJ ser validado */}
            {isLocked && (
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-start gap-3 animate-in fade-in">
                <Checkbox 
                  id="terms" 
                  checked={acceptedTerms} 
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-1 border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="terms" className="text-[10px] font-medium text-slate-400 leading-relaxed cursor-pointer">
                    <span className="text-white font-bold flex items-center gap-1 mb-1"><Scale className="w-3 h-3 text-primary" /> Termo de Responsabilidade Legal</span>
                    Declaro ser o responsável por este CNPJ. Assumo total responsabilidade civil e criminal pela veracidade dos selos e quilometragens emitidos. A plataforma servirá apenas como registro imutável.
                  </label>
                </div>
              </div>
            )}

            <Button 
              onClick={() => handleFinalize('oficina')} 
              className="w-full h-16 rounded-[1.5rem] font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95" 
              disabled={loading || verifyingCnpj || !isLocked || !acceptedTerms}
            >
              {loading ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <span className="flex items-center gap-2">FINALIZAR E BLOQUEAR <CheckCircle2 className="w-5 h-5" /></span>
              )}
            </Button>
            
            <button 
              onClick={() => {
                setUserType(null);
                setIsLocked(false);
                setAcceptedTerms(false);
                setForm({ cnpj: '', razaoSocial: '', endereco: '', telefone: '' });
              }} 
              className="w-full text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] hover:text-slate-400 transition-colors"
            >
              Voltar à escolha
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
