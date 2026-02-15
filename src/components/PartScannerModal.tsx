import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, ShoppingCart, Loader2, AlertCircle, Copy, Search } from 'lucide-react';
import { toast } from 'sonner';

interface PartScannerModalProps {
  open: boolean;
  onClose: () => void;
}

const AFFILIATE_URL = 'https://mercadolivre.com/sec/2D5ijG9';

export function PartScannerModal({ open, onClose }: PartScannerModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [partName, setPartName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrFailed, setOcrFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setImage(null);
    setPartName('');
    setIsProcessing(false);
    setOcrFailed(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processImageWithOCR = async (file: File) => {
    setIsProcessing(true);
    setOcrFailed(false);

    try {
      // Dynamic import to avoid breaking the build if Tesseract isn't available
      const Tesseract = await Promise.race([
        import('tesseract.js'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OCR timeout')), 10000)
        ),
      ]);

      const worker = await (Tesseract as any).createWorker('por');
      const { data } = await Promise.race([
        worker.recognize(file),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OCR timeout')), 10000)
        ),
      ]);
      await worker.terminate();

      const text = data?.text?.trim();
      if (text && text.length > 2) {
        // Take first meaningful line
        const firstLine = text.split('\n').find((l: string) => l.trim().length > 2) || text;
        setPartName(firstLine.trim().slice(0, 100));
        toast.success('Texto detectado na imagem!');
      } else {
        setOcrFailed(true);
        toast.info('Não foi possível ler o texto. Digite o nome da peça manualmente.');
      }
    } catch (error) {
      console.warn('OCR failed:', error);
      setOcrFailed(true);
      toast.info('Não foi possível ler a imagem. Digite o nome da peça manualmente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);

    // OCR
    processImageWithOCR(file);
  };

  const handleBuyClick = async () => {
    const text = partName.trim();
    if (!text) {
      toast.error('Digite ou escaneie o nome da peça primeiro.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success('✅ Nome copiado! Cole na barra de busca do site.');
    } catch {
      // Fallback for browsers without clipboard API
      toast.info(`Copie manualmente: "${text}"`);
    }

    // Open affiliate link
    window.open(AFFILIATE_URL, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Escanear Peça
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Camera input - HTML5 native for iOS/Android compatibility */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {!image ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-secondary/50 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  📸 Tirar foto da peça
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O sistema tentará ler o nome automaticamente
                </p>
              </div>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-secondary">
              <img src={image} alt="Peça" className="w-full h-44 object-cover" />
              <button
                type="button"
                onClick={resetState}
                className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-background/80 text-xs text-foreground hover:bg-background"
              >
                Nova foto
              </button>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-sm text-primary">Lendo imagem...</p>
            </div>
          )}

          {/* OCR failed notice */}
          {ocrFailed && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-xs text-muted-foreground">
                Não foi possível ler automaticamente. Digite o nome da peça abaixo.
              </p>
            </div>
          )}

          {/* Part name input */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Nome da Peça</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="Ex: Pastilha de freio dianteira"
                className="pl-10 h-12 bg-secondary border-border rounded-xl"
                maxLength={100}
              />
            </div>
          </div>

          {/* Buy button */}
          <Button
            onClick={handleBuyClick}
            disabled={!partName.trim()}
            variant="seal"
            size="lg"
            className="w-full gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            🛒 Comprar no Mercado Livre
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            O nome será copiado automaticamente. Cole na busca do Mercado Livre.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
