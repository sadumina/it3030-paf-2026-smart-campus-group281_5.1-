import jsPDF from 'jspdf';
import Papa from 'papaparse';

export const reportExport = {
  exportToCSV: (data, filename = 'report.csv') => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToPDF: (title, data, columns, filename = 'report.pdf') => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
    
    // Prepare table data
    const tableData = data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        return typeof value === 'number' ? value.toFixed(2) : value;
      })
    );
    
    // Add table
    doc.autoTable({
      head: [columns.map((col) => col.label)],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [241, 245, 250], // slate-100
      },
      margin: { top: 35 },
    });
    
    doc.save(filename);
  },

  exportDashboardReport: (kpis, filename = 'dashboard-report.pdf') => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('CleverCampus Dashboard Report', 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);
    
    // KPI Summary
    doc.setFontSize(12);
    doc.text('KPI Summary', 14, 35);
    
    let yPos = 45;
    kpis.forEach((kpi) => {
      doc.setFontSize(10);
      doc.text(`${kpi.label}: ${kpi.value}`, 20, yPos);
      doc.setFontSize(9);
      doc.text(`Change: ${kpi.change}`, 30, yPos + 6);
      yPos += 15;
    });
    
    doc.save(filename);
  },
};

