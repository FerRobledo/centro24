const axios = require('axios');
const { Pool } = require('pg');
const { getAccessTokenValido } = require('../mercadoPagoService');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Definir en Vercel
    ssl: { rejectUnauthorized: false }, // Necesario si usas PostgreSQL en la nube
});

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*'; // Usa * si no hay origen

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log("Webhook recibido:", JSON.stringify(req.body, null, 2));
    // MercadoPago envía el ID del pago en `data.id`
    const { type, data, user_id } = req.body;
    res.status(200).end();
    return;
    if (type === "payment") {
        const paymentId = data.id;

        //Obtener usuario del pago para obtener token
        const { rows } = await pool.query('SELECT * FROM usuario_facturacion WHERE mp_user_id = $1', [user_id]);
        const usuario = rows[0];
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Consultar a MercadoPago para obtener detalles del pago
        const { data: payment } = await axios.get(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: { Authorization: `Bearer ${await getAccessTokenValido(usuario)}` }
            }
        );

        console.log("Detalle del pago:", payment);
        const estadoPago = payment.status; // approved, rejected, pending
        const referencia = payment.external_reference; // tu id_venta
        console.log(`Pago ${payment.id} | Estado: ${estadoPago} | Ref: ${referencia}`);
        if (referencia) {
            await updateEstado(referencia, ((estadoPago === "approved") ? 'Pendiente' : 'Cancelado'));
            await pool.query('UPDATE venta SET id_pago = $1 WHERE id = $2',
                [payment.id, referencia]);

            if (await debeFacturarDB(usuario.id_usuario) && estadoPago === "approved" && referencia) {
                await insertaFacturable(referencia);
            }
        }
    }
    // Responder 200 a MercadoPago (OBLIGATORIO)
    res.status(200).end();
};

async function insertaFacturable(pedido_id) {
    await pool.query(
        `INSERT INTO venta_facturable (venta_id) VALUES ($1)`,
        [pedido_id]
    );
}

// Control persistente en base de datos para facturación parcial (7 de cada 10)
async function debeFacturarDB(id_usuario) {
    await pool.query('INSERT INTO facturacion_control (contador, id_usuario_fact) SELECT 0, $1 WHERE NOT EXISTS (SELECT 1 FROM facturacion_control WHERE id_usuario_fact = $1);', [id_usuario]);
    const { rows } = await pool.query(`UPDATE facturacion_control fc
      SET contador = CASE
        -- suma normalmente, con rollover en 10
        WHEN fc.contador + 1 > 10
          THEN 1
        ELSE fc.contador + 1
      END
    WHERE fc.id_usuario_fact = $1
    RETURNING contador <= 7 AS facturar;`, [id_usuario]);
    return rows[0].facturar;
}