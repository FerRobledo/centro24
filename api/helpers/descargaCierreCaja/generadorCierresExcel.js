import ExcelJS from "exceljs";

export async function generateCierreExcel({ cierre, detalle }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Cierre de Caja");

  // =====================
  // Estilos reutilizables
  // =====================
  const headerStyle = {
    font: { bold: true },
    alignment: { vertical: "middle" }
  };

  const moneyStyle = {
    numFmt: '$ #,##0.00;[Red]-$ #,##0.00'
  };

  const egresoStyle = {
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFC7CE" } // rojo claro
    }
  };

  // =====================
  // Encabezado
  // =====================
  sheet.addRow(["Cierre de Caja"]).font = { bold: true, size: 14 };
  sheet.addRow([]);
  sheet.addRow(["Usuario", cierre.nombre_usuario]).font = headerStyle.font;
  sheet.addRow(["Fecha", cierre.fecha]);
  sheet.addRow(["Total", cierre.total]).getCell(2).numFmt = moneyStyle.numFmt;
  sheet.addRow([]);

  // =====================
  // Separar datos
  // =====================
  const ingresos = detalle.filter(d => d.monto >= 0);
  const egresos = detalle.filter(d => d.monto < 0);

  // =====================
  // Tabla Ingresos
  // =====================
  sheet.addRow(["INGRESOS"]).font = { bold: true };
  sheet.addRow(["Fuente", "ID Origen", "Monto"]).eachCell(c => c.font = { bold: true });

  let subtotales = {};

  ingresos.forEach(d => {
    sheet.addRow([d.fuente, d.id_origen, d.monto])
      .getCell(3).numFmt = moneyStyle.numFmt;

    subtotales[d.fuente] = (subtotales[d.fuente] || 0) + Number(d.monto);
  });

  // =====================
  // Subtotales
  // =====================
  sheet.addRow([]);
  sheet.addRow(["SUBTOTALES"]).font = { bold: true };

  Object.entries(subtotales).forEach(([fuente, total]) => {
    sheet.addRow([fuente, "", total])
      .getCell(3).numFmt = moneyStyle.numFmt;
  });

  // =====================
  // Egresos
  // =====================
  if (egresos.length > 0) {
    sheet.addRow([]);
    sheet.addRow(["EGRESOS"]).font = { bold: true };

    sheet.addRow(["Fuente", "ID Origen", "Monto"])
      .eachCell(c => c.font = { bold: true });

    egresos.forEach(d => {
      const row = sheet.addRow([d.fuente, d.id_origen, d.monto]);
      row.eachCell(cell => cell.style = egresoStyle);
      row.getCell(3).numFmt = moneyStyle.numFmt;
    });
  }

  // =====================
  // Ajustes visuales
  // =====================
  sheet.columns = [
    { width: 20 },
    { width: 15 },
    { width: 18 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    fileName: `cierre_${cierre.id_cierre}_${new Date(cierre.fecha).toISOString().slice(0,16)}.xlsx`
  };
}
