import { useState } from 'react';
import { toast } from 'sonner';

export interface PlateAutoCompleteData {
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
}

// Since no reliable free public Brazilian plate API is available,
// this hook provides a placeholder for future integration.
// It currently returns null and allows manual entry as fallback.
export function usePlateAutoComplete() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PlateAutoCompleteData | null>(null);

  const fetchByPlate = async (placa: string): Promise<PlateAutoCompleteData | null> => {
    if (!placa || placa.length < 7) {
      return null;
    }

    const placaFormatada = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    setIsLoading(true);
    setData(null);

    try {
      // Attempt to use a public API (placeholder - can be replaced with real API)
      // Most free plate APIs require authentication or are rate-limited
      // For now, we gracefully fail and allow manual entry
      
      // Example integration point for future:
      // const response = await fetch(`https://api-example.com/placa/${placaFormatada}`);
      // if (response.ok) {
      //   const result = await response.json();
      //   const autoData = {
      //     marca: result.marca || '',
      //     modelo: result.modelo || '',
      //     ano: result.ano?.toString() || '',
      //     cor: result.cor || '',
      //   };
      //   setData(autoData);
      //   return autoData;
      // }

      // Currently no public API available - return null for manual entry
      return null;
    } catch (error) {
      // Silent fail - user can enter data manually
      console.log('Auto-complete not available, manual entry required');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setData(null);
  };

  return {
    fetchByPlate,
    isLoading,
    data,
    clearData,
  };
}
