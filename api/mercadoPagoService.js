import axios from 'axios';
import pool from './db.js';
import { getFechaArgentina } from './helpers/getFechaArgentina.js';

async function crearPreferenciaConToken(access_token, userId) {
    let backUrl = 'https://dev.gestionerp.ar';

    if (process.env.ENV !== 'prod') {
        backUrl = 'https://dev.gestionerp.ar';
    }

    const response = await axios.post(
        'https://api.mercadopago.com/checkout/preferences',
        {
            items: [{
                id: 'plan_mensual_erp',
                title: 'Suscripción Gestión ERP',
                description: 'Acceso por 1 mes al sistema Gestión ERP',
                currency_id: 'ARS',
                quantity: 1,
                unit_price: 70000.00,
                category_id: 'services'
            }],
            statement_descriptor: 'GESTION ERP',
            back_urls: {
                success: backUrl,
                failure: backUrl,
                pending: backUrl,
            },
            notification_url: `${backUrl}/api/mercadopago/callback`,
            auto_return: 'approved',
            external_reference: `${userId}`,
        },
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );

    return response.data.init_point;
}

export async function crearPreferencia(datosMp, userId) {
    const access_token = await getAccessTokenValido(datosMp);
    const initPoint = await crearPreferenciaConToken(access_token, userId);
    return { initPoint };
}

// 🔹 1. Generar un nuevo access_token
async function generarNuevoToken(client_id, client_secret) {
    const response = await axios.post(
        'https://api.mercadopago.com/oauth/token',
        new URLSearchParams({
            grant_type: 'client_credentials',
            client_id,
            client_secret,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    return {
        access_token: response.data.access_token,
        user_id: response.data.user_id,
        expires_at: new Date(
            new Date(getFechaArgentina()).getTime() + response.data.expires_in * 1000
        ),
    };
}

// 🔹 2. Guardar token en la DB
async function actualizarToken(access_token, expires_at, user_id) {
    await pool.query(
        'UPDATE mercado_pago SET mp_access_token=$1, mp_expires_at=$2, mp_user_id=$3 WHERE id = 1',
        [access_token, expires_at, user_id]
    );
}

export async function getAccessTokenValido(usuario) {
    if (!usuario.mp_access_token || new Date(usuario.mp_expires_at) < new Date()) {
        const nuevo = await generarNuevoToken(
            usuario.mp_client_id,
            usuario.mp_client_secret
        );
        await actualizarToken(nuevo.access_token, nuevo.expires_at, nuevo.user_id);
        return nuevo.access_token;
    }

    return usuario.mp_access_token;
}
