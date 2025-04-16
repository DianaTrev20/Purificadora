const { jsPDF } = require('jspdf');
require('jspdf-autotable');

function generarPDF(compra, historial) {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text(`Detalles de Compra #${compra.id}`, 14, 20);
  
  // Datos de la compra
  doc.setFontSize(12);
  doc.text(`Proveedor: ${compra.nombre_proveedor || 'N/A'}`, 14, 35);
  doc.text(`Producto: ${compra.nombre_producto || 'N/A'}`, 14, 45);
  doc.text(`Cantidad: ${compra.cantidad}`, 14, 55);
  doc.text(`Costo Total: $${compra.costo_total}`, 14, 65);
  doc.text(`Fecha: ${new Date(compra.fecha_compra).toLocaleDateString()}`, 14, 75);
  
  // Historial
  doc.text('Historial de Cambios:', 14, 90);
  
  const historialData = historial.map(item => [
    new Date(item.fecha).toLocaleString(),
    item.usuario || 'Sistema',
    item.accion,
    JSON.stringify(item.cambios)
  ]);
  
  doc.autoTable({
    startY: 95,
    head: [['Fecha', 'Usuario', 'Acción', 'Cambios']],
    body: historialData,
    margin: { left: 14 },
    styles: { fontSize: 8 }
  });
  
  return doc.output();
}

module.exports = { generarPDF };