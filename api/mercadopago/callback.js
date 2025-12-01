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
    const { type, data } = req.body;
    if (type === "payment") {
        try{

            const paymentId = data.id;
            console.log(req.body);
            //Obtener usuario del pago para obtener token
            const { rows } = await pool.query('SELECT * FROM mercado_pago');
            const usuario = rows[0];
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            Consultar a MercadoPago para obtener detalles del pago
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
                
            }
        } catch (error){
            console.log(error);
            return res.status(500).json(error);
        }
    }
    // Responder 200 a MercadoPago (OBLIGATORIO)
    res.status(200).end();
};
