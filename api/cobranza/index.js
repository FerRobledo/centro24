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

    const { idAdmin } = req.user;
    const id = idAdmin;

    if (req.method === 'GET') {

        if (!id) {
            return res.status(400).json({ error: 'Error falta id para obtener los clientes del dia' });
        }
        try {

            const { rows } = await pool.query(`
            SELECT * FROM caja WHERE user_admin = $1 AND activo=true ORDER BY fecha DESC, id DESC`, [id]);
            return res.status(200).json(rows);
        } catch {
            return res.status(500).json({ error: 'Error al obtener venta' })
        }

    }


    //POST
    if (req.method === 'POST') {
        const payload = req.body;

        if (!id) {
            return res.status(400).json({
                error: 'Falta id para insertar usuario',
                details: 'No se recibió el ID en la petición',
            });
        }

        try {
            // 1. Defino mapping de tipos → columnas
            const columnasPagos = {
                Efectivo: "efectivo",
                Debito: "debito",
                Credito: "credito",
                Transferencia: "transferencia",
                Cheque: "cheque",
                Gasto: "gasto",
            };

            // 2. Inicializo todas en 0
            const valoresPagos = {};
            Object.values(columnasPagos).forEach((col) => (valoresPagos[col] = 0));

            // 3. Cargo lo que vino en payload.pagos
            if (Array.isArray(payload.pagos)) {
                payload.pagos.forEach((p) => {
                    const columna = columnasPagos[p.tipo];
                    if (columna) {
                        valoresPagos[columna] = p.monto;
                    }
                });
            }

            // 4. Query con todas las columnas
            const query = `
                INSERT INTO public.caja
                    (fecha, detalle, observacion, efectivo, debito, credito, transferencia, cheque, gasto, user_admin)
                VALUES
                    (now(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *;
                `;

            // 5. Armado de parámetros
            const values = [
                payload.detalle || null,
                payload.observacion || null,
                valoresPagos.efectivo,
                valoresPagos.debito,
                valoresPagos.credito,
                valoresPagos.transferencia,
                valoresPagos.cheque,
                valoresPagos.gasto,
                id,
            ];
            const { rows } = await pool.query(query, values);
            return res.status(201).json(rows[0]);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Error al insertar en caja",
                details: error.message,
            });
        }
    }
    //PUT
    if (req.method === 'PUT') {
        const idClient = req.body;
        const payload = req.body; //sin {} porque es un objeto, los objetos se toman completos

        if (!idClient) {
            return res.status(500).json({ error: 'Error falta id para actualizar usuario', details: 'No se recibió el ID en el cuerpo de la petición' });
        } try {
            const { rows } = await pool.query(
                "UPDATE public.caja" +
                " SET detalle=$1, efectivo=$2, debito=$3, credito=$4, transferencia=$5, cheque=$6, observacion=$7, gasto=$8, user_admin=$9" +
                " WHERE id=$10;", [payload.detalle, payload.efectivo, payload.debito, payload.credito, payload.transferencia, payload.cheque, payload.observacion, payload.gasto, idAdmin, idClient]
            );

            return res.status(200).json(rows);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo actualizar el cliente', details: error.message });
        }
    }

    // DELETE 
    if (req.method === 'DELETE') {
        const { idClient } = req.body;

        if (!idAdmin || !idClient) {
            return res.status(400).json({ error: 'Falta idAdmin o idAdmin' });
        }

        try {
            const { rows } = await pool.query(
                `UPDATE public.caja
                SET activo = false
                WHERE id = $1 AND user_admin = $2
                RETURNING id, user_admin, activo`,
                [idClient, idAdmin]
            );

            if (rows.length > 0) {
                return res.status(200).json({ success: true, deletedId: rows[0].id });
            } else {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado o no autorizado' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la eliminación', detail: error.message });
        }
    }

    res.status(405).json({ message: 'Método no permitido' });

}
