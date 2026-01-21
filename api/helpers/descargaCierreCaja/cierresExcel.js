import pool from "../../db";

export async function getCierreCajaDataForExcel({ idAdmin, idCierre }) {

  // =====================
  // 1️⃣ Obtener encabezado del cierre
  // =====================
  const cierreResult = await pool.query(`
    SELECT
      hc.id AS id_cierre,
      hc.user_admin AS id_admin,
      hc.fecha,
      hc.monto AS total,
      hc.nombre_usuario
    FROM historial_cierres hc
    WHERE hc.user_admin = $1
      AND hc.id = $2
  `, [idAdmin, idCierre]);

  if (cierreResult.rowCount === 0) {
    return null; // cierre inexistente o no autorizado
  }

  // =====================
  // 2️⃣ Obtener detalle del cierre
  // =====================
  const detalleResult = await pool.query(`
    SELECT
      dc.fuente,
      dc.id_origen,
      dc.monto
    FROM detalle_cierre dc
    WHERE dc.id_cierre = $2
  `, [idAdmin, idCierre]);

  return {
    cierre: cierreResult.rows[0],
    detalle: detalleResult.rows
  };
}
