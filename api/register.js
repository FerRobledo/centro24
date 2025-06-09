const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Definir en Vercel
    ssl: { rejectUnauthorized: false }, // Necesario si usas PostgreSQL en la nube
});

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*'; // Usa * si no hay origen

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Manejo de preflight (CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try{

            const { username, password } = req.body;
            console.log(req.body)
            
            // Verificar si el usuario ya existe
            const result = await pool.query('SELECT * FROM users WHERE nombre = $1', [username]);
            if (result.rows.length > 0) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }
            
            // Hashear la contraseña
            const passwordHash = await bcrypt.hash(password, 10);
            
            // Insertar el nuevo usuario en la base de datos
            await pool.query('INSERT INTO users (nombre, password_hash, created_at) VALUES ($1, $2, now())', [username, passwordHash]);
            
            return res.status(201).json({ message: 'Usuario creado con éxito' });
        } catch (error){
            console.log(error)
            return res.status(500).json({ message: 'Error al crear usuario'});
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};
