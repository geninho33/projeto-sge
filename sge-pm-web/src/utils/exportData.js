import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToExcel({ filename, sheetName, columns, rows }) {
  const data = rows.map((row) => {
    const obj = {};
    for (const col of columns) {
      obj[col.label] = col.format ? col.format(row) : (row[col.key] ?? "");
    }
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || "Dados");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPdf({ filename, title, subtitle, columns, rows, totals }) {
  const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait", unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 18;
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(subtitle, margin, y);
    y += 14;
  }
  doc.setTextColor(0);

  autoTable(doc, {
    startY: y + 6,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => {
      const val = c.format ? c.format(row) : (row[c.key] ?? "");
      return String(val ?? "");
    })),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [30, 111, 217] },
    margin: { left: margin, right: margin },
  });

  if (totals?.length) {
    const finalY = doc.lastAutoTable.finalY + 16;
    doc.setFontSize(10);
    doc.text("Totalizadores", margin, finalY);
    autoTable(doc, {
      startY: finalY + 6,
      head: [["Indicador", "Valor"]],
      body: totals.map((t) => [t.label, t.value]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: margin, right: margin },
    });
  }

  doc.save(`${filename}.pdf`);
}
