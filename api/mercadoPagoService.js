const axios = require('axios');
const { Pool } = require('pg');
const getFechaArgentina = require('./helpers/getFechaArgentina');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Definir en Vercel
    ssl: { rejectUnauthorized: false }, // Necesario si usas PostgreSQL en la nube
});

async function crearPreferenciaConToken(access_token, userId) {

    // DEFINO A QUE URL VOY A RECIBIR LA RESPUESTA DE MP
    let backUrl = 'https://centro24.vercel.app';

    if (process.env.ENV != 'prod') {
        backUrl = 'https://centro24-git-feature-pagosclientes-raices-projects-a29c0585.vercel.app';
    }

    try {

        const response = await axios.post(
            "https://api.mercadopago.com/checkout/preferences",
            {
                items: [{
                    "title": "Suscripción Gestión ERP",
                    "description": "Acceso por 1 mes al sistema Gestión ERP",
                    "currency_id": "ARS",
                    "quantity": 1,
                    "unit_price": 1.00
                }],
                back_urls: {
                    success: backUrl,
                    failure: backUrl,
                    pending: backUrl,
                },
                // Seteo a donde se va a recibir la respuesta
                notification_url: backUrl + '/api/mercadopago/callback',
                auto_return: "approved",
                external_reference: userId.toString(),
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }
        );

        return response.data.init_point;
    } catch (error) {
        console.log("DATA ERROR =>", error.response);
    }
}

async function crearPreferencia(datosMp, userId) {
    const access_token = await getAccessTokenValido(datosMp);
    const initPoint = await crearPreferenciaConToken(access_token, userId);
    return { initPoint };
}

// 🔹 1. Generar un nuevo access_token con client_id y client_secret
async function generarNuevoToken(client_id, client_secret) {
    const response = await axios.post('https://api.mercadopago.com/oauth/token', {
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret
    }, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    return {
        access_token: response.data.access_token,
        user_id: response.data.user_id,
        expires_at: new Date(new Date(getFechaArgentina()).getTime() + response.data.expires_in * 1000) // ahora + segundos
    };
}

// 🔹 2. Guardar token en la DB
async function actualizarToken(access_token, expires_at, user_id) {
    await pool.query(
        "UPDATE mercado_pago SET mp_access_token=$1, mp_expires_at=$2, mp_client_id=$3",
        [access_token, expires_at, user_id]
    );
}

async function getAccessTokenValido(usuario) {

    // Si no hay token o está vencido → genero uno nuevo
    if (!usuario.mp_access_token || new Date(usuario.mp_expires_at) < new Date()) {
        const nuevo = await generarNuevoToken(usuario.mp_client_id, usuario.mp_client_secret);
        await actualizarToken(nuevo.access_token, nuevo.expires_at, nuevo.user_id);
        return nuevo.access_token;
    }

    return usuario.mp_access_token;
}


///////////////////////

module.exports = {
    crearPreferencia,

};
