import pool from '../db.js';
import { requireAuth } from '../protected/requireAuth.js';

export default async function handler(req, res) {
    const origin = req.headers.origin || '*';

    //seteo los encabzados para http
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    //le pregunto al back si puedo usar PUT,POST,... con el OPTIONS
    //retorno si, los podes usar
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
    }
    const id = req.user.idAdmin

    if (req.method === 'GET') {
        const { idCierre } = req.query;
        
        try {

            const { rows } = await pool.query(`
                    SELECT dc.fuente, dc.id_origen 
                    FROM detalle_cierre dc
                    JOIN historial_cierres hc on dc.id_cierre = hc.id
                    WHERE dc.id_cierre = $2 AND hc.user_admin = $1
                    `, [id, idCierre])

            const mapeo = Object.values(
                rows.reduce((acc, { fuente, id_origen }) => {
                    if (!acc[fuente]) {
                        acc[fuente] = { fuente, id: [] };
                    }
                    acc[fuente].id.push(id_origen);
                    return acc;
                }, {})
            );

            let data = [];

            for (const { fuente, id } of mapeo) {
                let sql;
                if (fuente === "pagos_mensuales") {
                    sql = `SELECT f.monto, f.fecha_pago AS fecha, cm.cliente as detalle, f.metodo_pago
                            FROM ${fuente} f
                            JOIN clientes_mensuales cm ON f.id_client = cm.id_client
                            WHERE f.id IN (${id.join(", ")});`;
                } else {
                    sql = `SELECT * FROM ${fuente} WHERE id IN (${id.join(", ")});`;
                }

                let resultSQL = await pool.query(sql);

                // 🔹 Agrego la fuente a cada registro antes de acumular
                resultSQL = resultSQL.rows.map(row => ({
                    ...row,
                    fuente
                }));

                // Acumulo resultados en data
                data.push(...resultSQL);
            }

            // 🔹 Ordenar resultados por fecha (ajustá el campo de fecha real, por ej. "fecha")
            data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));


            return res.status(200).json({ data });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo obtener detalles', details: error.message });
        }
    }

    res.status(405).json({ message: 'Método no permitido' });

}
