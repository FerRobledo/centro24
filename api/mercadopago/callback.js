export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

import axios from "axios";
import { getAccessTokenValido } from "../mercadoPagoService.js";

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

    console.log("Detalle del pago:", payment);

    const estadoPago = payment.status;
    const referencia = payment.external_reference;

    console.log(`Pago ${payment.id} | Estado: ${estadoPago} | Ref: ${referencia}`);

  } catch (error) {
    console.error("Error en webhook:", error?.response?.data || error);
  }

  return res.status(200).send("OK");
};
