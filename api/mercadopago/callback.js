export const config = {
    api: {
        bodyParser: false
    }
};

const axios = require('axios');
const { Pool } = require('pg');
const { getAccessTokenValido } = require('../mercadoPagoService');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {

    // CORS
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // 🔥 1. LEER RAW BODY (Vercel lo necesita)
    const rawBody = await new Promise(resolve => {
        let data = "";
        req.on("data", chunk => (data += chunk));
        req.on("end", () => resolve(data));
    });

    let body;
    try {
        body = JSON.parse(rawBody);
    } catch (e) {
        console.error("Error al parsear JSON de webhook:", rawBody);
        return res.status(400).end();
    }

    console.log("Webhook recibido:", JSON.stringify(body, null, 2));

    const { type, data } = body;

    // Aseguramos que sea de pagos
    if (type === "payment" && data?.id) {

        try {
            const paymentId = data.id;

            // Obtener usuario de la tabla
            const { rows } = await pool.query('SELECT * FROM mercado_pago');
            const usuario = rows[0];

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Consultar pago a Mercado Pago
            const { data: payment } = await axios.get(
                `https://api.mercadopago.com/v1/payments/${paymentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${await getAccessTokenValido(usuario)}`
                    }
                }
            );

            console.log("Detalle del pago:", payment);

            const estadoPago = payment.status;
            const referencia = payment.external_reference;

            console.log(`Pago ${payment.id} | Estado: ${estadoPago} | Ref: ${referencia}`);

            // Acá actúas según estado
            if (estadoPago === "approved") {
                console.log("Pago aprobado 🎉");
                // TODO: actualizar DB
            }

        } catch (error) {
            console.error("ERROR en callback:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    // MP REQUIERE RESPONDER SIEMPRE 200
    return res.status(200).end();
};
