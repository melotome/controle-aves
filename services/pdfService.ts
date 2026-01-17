
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EggRecord } from '../types';

export const PDFService = {
  generateReport: (records: EggRecord[], dateRange: { start: string, end: string }) => {
    // Criação do documento com tipagem any para facilitar manipulação de plugins
    const doc = new jsPDF() as any;
    
    // Cabeçalho institucional
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // primary green (green-600)
    doc.text('AgroGeral Escolar', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('Relatório de Produção de Ovos', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    const periodText = `Período: ${dateRange.start || 'Início'} até ${dateRange.end || 'Fim'}`;
    doc.text(periodText, 105, 37, { align: 'center' });

    // Resumo Estatístico
    const totalEggs = records.reduce((sum, r) => sum + r.totalEggs, 0);
    const avgBirds = records.length > 0 ? records.reduce((sum, r) => sum + r.birdCount, 0) / records.length : 0;
    const avgPosture = records.length > 0 ? records.reduce((sum, r) => sum + r.postureRate, 0) / records.length : 0;

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Resumo do Período:', 20, 50);
    
    doc.setFontSize(10);
    doc.text(`• Total de Ovos Coletados: ${totalEggs}`, 25, 57);
    doc.text(`• Média do Plantel: ${avgBirds.toFixed(0)} aves`, 25, 63);
    doc.text(`• Taxa Média de Postura: ${avgPosture.toFixed(2)}%`, 25, 69);

    // Preparação dos dados da tabela
    const tableData = records.map(r => [
      new Date(r.date).toLocaleDateString('pt-BR'),
      r.birdCount,
      r.totalEggs,
      r.brokenEggs,
      r.totalFeed.toFixed(2),
      r.postureRate.toFixed(1) + '%',
      r.responsible
    ]);

    // Geração da tabela usando a função autoTable diretamente (mais seguro em ESM)
    autoTable(doc, {
      startY: 75,
      head: [['Data', 'Aves', 'Ovos', 'Perdas', 'Ração (kg)', 'Postura (%)', 'Resp.']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [22, 163, 74],
        fontSize: 10,
        halign: 'center'
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' }
      },
      styles: { fontSize: 9 },
      margin: { top: 75 },
    });

    // Rodapé com timestamp
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const timestamp = `Documento gerado automaticamente em: ${new Date().toLocaleString('pt-BR')}`;
    doc.text(timestamp, 20, finalY);

    // Salvar o arquivo
    const fileName = `Relatorio_AgroGeral_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
};
