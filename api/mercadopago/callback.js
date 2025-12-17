export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

import axios from "axios";
import { getAccessTokenValido } from "../mercadoPagoService.js";
import pool from '../db.js'

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    console.log("Webhook recibido:", req.body || {});

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      console.log("No llegó data.id en el webhook");
      return res.status(200).send("OK");
    }

    const usuario = {
      mp_client_id: "6573400378868183",
      mp_client_secret: "oKo3UVU5L7jJvqMvfBiIrEJW6eyNfw9Z",
    };

    const token = await getAccessTokenValido(usuario);

    const { data: payment } = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const estadoPago = payment.status;
    const referencia = payment.external_reference;

    if (estadoPago === 'approved') {
      const user = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [referencia]
      )

      const fechaUltimoPago = user.rows[0].fecha_ultimo_pago // 

      // Convertir a Date
      const fecha = new Date(fechaUltimoPago)

      // Sumar 1 mes (javascript maneja automaticamente el cambio de año)
      fecha.setMonth(fecha.getMonth() + 1)

      // Volver a formato YYYY-MM-DD
      const nuevaFecha = fecha.toISOString().split('T')[0]

      console.log(nuevaFecha)

      // Guardar en BD
      await pool.query(
        'UPDATE users SET fecha_ultimo_pago = $1 WHERE id = $2',
        [nuevaFecha, referencia]
      )
    }

  } catch (error) {
    console.error("Error en webhook:", error?.response?.data || error);
  }

  return res.status(200).send("OK");
};
