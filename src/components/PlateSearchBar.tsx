import { useState } from 'react';
import { Search, Car, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
}

export function PlateSearchBar() {
  const [searchPlaca, setSearchPlaca] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchPlaca.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    setNotFound(false);

    try {
      const placaFormatada = searchPlaca.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      const { data, error } = await supabase
        .from('veiculos')
        .select('id, placa, marca, modelo')
        .ilike('placa', `%${placaFormatada}%`)
        .limit(1)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setSearchResult(data);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNavigateToVehicle = () => {
    if (searchResult) {
      navigate(`/v/${searchResult.id}`);
    }
  };

  const handleCadastrar = () => {
    // Navigate to dashboard and trigger the add vehicle modal
    navigate('/dashboard?add=true');
  };

  const handleClear = () => {
    setSearchPlaca('');
    setSearchResult(null);
    setNotFound(false);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          value={searchPlaca}
          onChange={(e) => {
            setSearchPlaca(e.target.value.toUpperCase());
            setSearchResult(null);
            setNotFound(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por placa (ex: ABC1234)"
          className="pl-10 pr-20 bg-secondary/50 border-border rounded-xl h-12 font-mono tracking-wider"
          maxLength={8}
        />
        <Button
          size="sm"
          variant="neon"
          className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-9"
          onClick={handleSearch}
          disabled={isSearching || !searchPlaca.trim()}
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Buscar'
          )}
        </Button>
      </div>

      {/* Search Result - Found */}
      {searchResult && (
        <div 
          className={cn(
            "p-4 rounded-xl bg-primary/10 border border-primary/30",
            "animate-in fade-in-0 slide-in-from-top-2 duration-300"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-mono font-bold text-primary tracking-wider">
                  {searchResult.placa}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchResult.marca} {searchResult.modelo}
                </p>
              </div>
            </div>
            <Button
              variant="neon"
              size="sm"
              className="gap-1"
              onClick={handleNavigateToVehicle}
            >
              Ver <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search Result - Not Found */}
      {notFound && (
        <div 
          className={cn(
            "p-4 rounded-xl bg-secondary/50 border border-border",
            "animate-in fade-in-0 slide-in-from-top-2 duration-300"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground mb-1">
                Veículo não encontrado
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                A placa "{searchPlaca}" não está registrada no Ficha do Carro.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                >
                  Limpar
                </Button>
                <Button
                  variant="neon"
                  size="sm"
                  onClick={handleCadastrar}
                >
                  Cadastrar este carro
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
