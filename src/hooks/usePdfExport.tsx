import { useCallback, useState } from 'react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Veiculo } from './useVeiculos';
import { Manutencao, calculateHealthScore } from './useManutencoes';
import { toast } from 'sonner';

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(async (
    veiculo: Veiculo,
    manutencoes: Manutencao[],
    publicUrl: string
  ) => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const healthScore = calculateHealthScore(manutencoes);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Cores do tema
      const primaryColor: [number, number, number] = [26, 54, 93]; // Azul Marinho
      const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900
      const grayColor: [number, number, number] = [100, 100, 100];

      // Background
      doc.setFillColor(...darkColor);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header
      doc.setTextColor(...primaryColor);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FICHA DO CARRO', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      doc.setTextColor(...grayColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Certificado Digital de Histórico Veicular', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Linha decorativa
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Informações do veículo
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMAÇÕES DO VEÍCULO', margin, yPos);
      yPos += 10;

      // Card do veículo
      doc.setFillColor(18, 18, 18);
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 45, 3, 3, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(veiculo.placa, margin + 10, yPos + 15);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim() || 'Veículo', margin + 10, yPos + 25);
      
      if (veiculo.ano) {
        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.text(`Ano: ${veiculo.ano}`, margin + 10, yPos + 35);
      }

      if (veiculo.cor) {
        doc.text(`Cor: ${veiculo.cor}`, margin + 60, yPos + 35);
      }

      // Stats no lado direito do card
      doc.setTextColor(...primaryColor);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(healthScore.toString(), pageWidth - margin - 40, yPos + 18, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text('Health Score', pageWidth - margin - 40, yPos + 25, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(manutencoes.length.toString(), pageWidth - margin - 40, yPos + 38, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text('Registros', pageWidth - margin - 40, yPos + 45, { align: 'center' });

      yPos += 55;

      // Selo de verificação
      doc.setFillColor(26, 54, 93, 0.1);
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 12, 2, 2, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ HISTÓRICO VERIFICADO E IMUTÁVEL', pageWidth / 2, yPos + 8, { align: 'center' });
      yPos += 20;

      // Linha decorativa
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Histórico de manutenções
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTÓRICO DE MANUTENÇÕES', margin, yPos);
      yPos += 10;

      if (manutencoes.length === 0) {
        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Nenhuma manutenção registrada', margin, yPos);
        yPos += 10;
      } else {
        for (const manutencao of manutencoes) {
          // Verificar se precisa de nova página
          if (yPos > pageHeight - 50) {
            doc.addPage();
            doc.setFillColor(...darkColor);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            yPos = margin;
          }

          // Card da manutenção
          doc.setFillColor(18, 18, 18);
          doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 35, 2, 2, 'F');
          
          // Data e selo
          doc.setTextColor(...primaryColor);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const dataFormatada = format(
            new Date(manutencao.data_selada), 
            "dd/MM/yyyy 'às' HH:mm", 
            { locale: ptBR }
          );
          doc.text(dataFormatada, margin + 5, yPos + 8);
          
          // Badge verificado
          doc.setFillColor(26, 54, 93, 0.2);
          doc.roundedRect(pageWidth - margin - 30, yPos + 3, 25, 8, 1, 1, 'F');
          doc.setFontSize(6);
          doc.text('SELADO', pageWidth - margin - 17.5, yPos + 8.5, { align: 'center' });
          
          // Oficina
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(manutencao.oficina, margin + 5, yPos + 17);
          
          // Descrição
          doc.setTextColor(...grayColor);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const descricao = manutencao.descricao.length > 80 
            ? manutencao.descricao.substring(0, 77) + '...' 
            : manutencao.descricao;
          doc.text(descricao, margin + 5, yPos + 25);
          
          // KM
          doc.setTextColor(...primaryColor);
          doc.setFontSize(9);
          doc.text(`${manutencao.km_atual.toLocaleString()} km`, margin + 5, yPos + 32);

          yPos += 40;
        }
      }

      // Footer
      if (yPos > pageHeight - 40) {
        doc.addPage();
        doc.setFillColor(...darkColor);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        yPos = margin;
      }

      yPos = pageHeight - 30;
      
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      doc.setTextColor(...grayColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Todos os registros são imutáveis e verificados por timestamp do servidor.', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;

      doc.setTextColor(...primaryColor);
      doc.text(`Verificar online: ${publicUrl}`, pageWidth / 2, yPos, { align: 'center' });

      // Salvar PDF
      const fileName = `ficha-do-carro-${veiculo.placa}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToPdf, isExporting };
}