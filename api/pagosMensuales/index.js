import pool from '../db.js';
import { requireAuth } from '../protected/requireAuth.js'

export default async function handler(req, res) {
    const origin = req.headers.origin || '*';

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const idAdmin = req.user.idAdmin

    // GET
    if (req.method === 'GET') {
        const { page = 1, pageSize = 10, search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);

        try {
            // WHERE POR DEFECTO
            let where = 'WHERE pm.id_admin = $1 AND pm.activo = true';

            // array de params dinamico en caso de tener varios filtros
            const params = [idAdmin];
            let paramIndex = 2;

            // Si escribimos algo en el input entra aca, dentro de los () van las columnas por las que va a filtrar el buscador
            if (search) {
                where += ` AND (
                CAST(pm.id AS TEXT) ILIKE $${paramIndex}
                    OR cm.cliente ILIKE $${paramIndex}
                    )
            `;
                // Pushear parametros y aumentar el index
                // El index sirve para agregar en la consulta $1, $2, $3, segun la cantidad de params
                params.push(`%${search}%`);
                paramIndex++;
            }

            // --- Total ---
            // Obtener la totalidad de los pagos (este dato es para el paginado)
            const totalQuery = `
                SELECT 
                    count(*)
                FROM pagos_mensuales pm
                LEFT JOIN clientes_mensuales cm ON pm.id_client = cm.id_client
                ${where}
            `;

            const totalResult = await pool.query(totalQuery, params);
            console.log(totalResult.rows);
            const total = parseInt(totalResult.rows[0].count);
            // Consulta principal (se le agrega LIMIT Y OFFSET)


            const dataQuery = `
                SELECT 
                    pm.*,
                    cm.cliente as cliente_nombre
                FROM pagos_mensuales pm
                LEFT JOIN clientes_mensuales cm ON pm.id_client = cm.id_client
                ${where}
                ORDER BY pm.fecha_pago DESC
                LIMIT $${params.length + 1}
                OFFSET $${params.length + 2}
            `

            const dataParams = [...params, pageSize, offset];
            const dataResult = await pool.query(dataQuery, dataParams);

            // Enviar datos por separado pagos y total
            return res.status(200).json({ pagos: dataResult.rows, total });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: 'Error al obtener datos',
                details: error.message
            });
        }
    }
    // POST
    if (req.method === 'POST') {
        const { client, fechaDesde, fechaHasta, monto, metodoPago } = req.body;

        try {
            // Validar método de pago conocido
            const allowedMetodos = ['Efectivo', 'Debito', 'Credito', 'Transferencia', 'Cheque'];

            if (!allowedMetodos.includes(metodoPago)) {
                return res.status(400).json({ error: 'Método de pago inválido' });
            }

            await pool.query(
                `
                INSERT INTO pagos_mensuales
                (id_client, fecha_pago, monto, periodo_desde, periodo_hasta, id_admin, activo, metodo_pago)
            VALUES($1, now(), $2, $3, $4, $5, $6, $7)
                `, [client, monto, fechaDesde, fechaHasta, idAdmin, true, metodoPago]
            );
            return res.status(201).json({ success: true });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo insertar el pago', details: error.message });
        }
    }
}

