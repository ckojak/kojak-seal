  const handleWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (suas validações de CNPJ e telefone continuam iguais)

    setLoading(true);
    try {
      const trialExpires = addDays(new Date(), 30); // CEO decidiu: 30 dias de teste!

      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'oficina', // MUDADO: Sincronizado com o resto do app
          cnpj: cnpj.replace(/\D/g, ''),
          razao_social: razaoSocial.trim(),
          endereco: endereco.trim(),
          telefone: telefone.replace(/\D/g, ''),
          display_name: razaoSocial.trim(),
          onboarding_completed: true,
          subscription_status: 'active',
          subscription_expires_at: trialExpires.toISOString(),
          is_verified: false, // Começa como falso até o CEO (você) aprovar no Admin
        } as any)
        .eq('user_id', user!.id);

      if (error) throw error;
      toast.success('Oficina cadastrada! Aguarde a verificação do CEO. 🎉');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error('Erro ao cadastrar oficina');
    } finally {
      setLoading(false);
    }
  };
