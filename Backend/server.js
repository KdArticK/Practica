const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors()); 
app.use(bodyParser.json()); 

app.use(express.static(path.join(__dirname, '../')));

const dbConfig = {
    user: 'KD',        
    password: '123456789',  
    server: '127.0.0.1',      
    database: 'libreria',
    options: {
        encrypt: false,         
        trustServerCertificate: false
    }
};

let poolPromise;

async function connectToDb() {
    try {
        poolPromise = await sql.connect(dbConfig);
        console.log('Conectado a SQL Server');
    } catch (err) {
        console.error('Error de conexión:', err);
        process.exit(1);
    }
}

connectToDb();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Rutas para Autores
app.get('/autores', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Autores');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error en la consulta de autores');
    }
});

app.post('/autores', [
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('apellido').notEmpty().withMessage('Apellido es requerido'),
    body('fecha_nacimiento').isDate().withMessage('Fecha de nacimiento debe ser una fecha válida')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { nombre, apellido, fecha_nacimiento } = req.body;
    try {
        await sql.query`INSERT INTO Autores (nombre, apellido, fecha_nacimiento) VALUES (${nombre}, ${apellido}, ${fecha_nacimiento})`;
        res.status(201).send('Autor añadido');
    } catch (err) {
        res.status(500).send('Error al añadir autor');
    }
});

app.put('/autores/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, fecha_nacimiento } = req.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.VarChar, nombre)
            .input('apellido', sql.VarChar, apellido)
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
            .query('UPDATE Autores SET nombre = @nombre, apellido = @apellido, fecha_nacimiento = @fecha_nacimiento WHERE id = @id');

        res.sendStatus(200);
    } catch (err) {
        console.error('Error al actualizar autor:', err);
        res.status(500).send('Error al actualizar autor');
    }
});

app.delete('/autores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`DELETE FROM Autores WHERE id = ${id}`;
        res.send('Autor eliminado');
    } catch (err) {
        res.status(500).send('Error al eliminar autor');
    }
});

// Rutas para Libros
app.get('/libros', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Libros');
        res.render('libros', { libros: result.recordset });
    } catch (err) {
        console.error('Error al obtener libros:', err);
        res.status(500).send('Error al obtener libros');
    }
});

app.post('/libros', async (req, res) => {
    const { titulo, autor, fecha_publicacion } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('titulo', sql.NVarChar, titulo)
            .input('autor', sql.NVarChar, autor)
            .input('fecha_publicacion', sql.Date, fecha_publicacion)
            .query('INSERT INTO Libros (titulo, autor, fecha_publicacion) VALUES (@titulo, @autor, @fecha_publicacion)');
        res.status(201).send('Libro añadido');
    } catch (err) {
        console.error('Error al añadir libro:', err);
        res.status(500).send('Error al añadir libro');
    }
});

app.post('/libros/editar/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, autor, fecha_publicacion } = req.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('titulo', sql.NVarChar, titulo)
            .input('autor', sql.NVarChar, autor)
            .input('fecha_publicacion', sql.Date, fecha_publicacion)
            .query('UPDATE Libros SET titulo = @titulo, autor = @autor, fecha_publicacion = @fecha_publicacion WHERE id = @id');

        res.redirect('/libros');
    } catch (err) {
        console.error('Error al editar libro:', err);
        res.status(500).send('Error al editar libro');
    }
});

app.post('/libros/eliminar/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Libros WHERE id = @id');

        res.redirect('/libros');
    } catch (err) {
        console.error('Error al eliminar libro:', err);
        res.status(500).send('Error al eliminar libro');
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
