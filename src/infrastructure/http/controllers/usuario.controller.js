// Importa los modelos de ambas bases de datos y las utilidades
// const orm = require('../../database/connection/dataBase.orm'); // Para Sequelize (SQL) - Moved to preferences section
// const sql = require('../../database/connection/dataBase.sql'); // MySQL directo - Moved to preferences section
// const mongo = require('../../database/connection/dataBase.mongo'); // Para Mongoose (MongoDB) - Moved to preferences section
// const { cifrarDato, descifrarDato } = require('../../../application/controller/encrypDates'); // Moved to preferences section

// const usersCtl = {};

// --- Utilidad para Descifrado Seguro ---
// function safeDecrypt(data) { // Removed, handled by Use Cases
//     try {
//         return data ? descifrarDato(data) : '';
//     } catch (error) {
//         console.error('Error al descifrar datos:', error.message);
//         return '';
//     }
// }

// Función para formatear una fecha a 'YYYY-MM-DD HH:mm:ss'
// function formatLocalDateTime(date) { // Moved to preferences section
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-index
//     const day = String(date.getDate()).padStart(2, '0');
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const seconds = String(date.getSeconds()).padStart(2, '0');
//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// }

// --- Hexagonal Imports ---
const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../../../../');
const MysqlMongoUsuarioRepository = require(path.join(BASE_PATH, 'src/infrastructure/adapters/secondary/database/MysqlMongoUsuarioRepository'));
const RegistrarUsuario = require(path.join(BASE_PATH, 'src/application/use-cases/usuario/RegistrarUsuario'));
const LoginUsuario = require(path.join(BASE_PATH, 'src/application/use-cases/usuario/LoginUsuario'));
const ObtenerUsuario = require(path.join(BASE_PATH, 'src/application/use-cases/usuario/ObtenerUsuario'));
const ActualizarUsuario = require(path.join(BASE_PATH, 'src/application/use-cases/usuario/ActualizarUsuario'));
const EliminarUsuario = require(path.join(BASE_PATH, 'src/application/use-cases/usuario/EliminarUsuario'));

const usersCtl = {};

// --- Dependency Injection Wiring (Manual for now) ---
const usuarioRepository = new MysqlMongoUsuarioRepository();
const registrarUsuarioUseCase = new RegistrarUsuario(usuarioRepository);
const loginUsuarioUseCase = new LoginUsuario(usuarioRepository);
const obtenerUsuarioUseCase = new ObtenerUsuario(usuarioRepository);
const actualizarUsuarioUseCase = new ActualizarUsuario(usuarioRepository);
const eliminarUsuarioUseCase = new EliminarUsuario(usuarioRepository);

// --- CRUD de Usuarios (Hexagonal) ---
usersCtl.createUser = async (req, res) => {
    try {
        const usuarioCreado = await registrarUsuarioUseCase.execute(req.body);
        res.status(201).json({ message: 'Usuario registrado exitosamente.', userId: usuarioCreado.id });
    } catch (error) {
        console.error('Error al crear el usuario (Hexagonal):', error);
        // Handle specific domain errors vs generic
        if (error.message.includes('ya está registrado')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 2. OBTENER TODOS LOS USUARIOS (Usando SQL Directo)
usersCtl.getAllUsers = async (req, res) => {
    try {
        const usuarios = await obtenerUsuarioUseCase.executeAll();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios (Hexagonal):', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. OBTENER USUARIO POR ID (Usando SQL Directo)
usersCtl.getUserById = async (req, res) => {
    // Se usa req.user.id si la solicitud viene de un usuario logueado para su propio perfil
    // De lo contrario, se usa req.params.id para buscar por ID (ej. por un administrador)
    const idUsuario = req.user ? req.user.id : req.params.id;

    try {
        const usuario = await obtenerUsuarioUseCase.execute(idUsuario);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario (Hexagonal):', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 4. ACTUALIZAR USUARIO (Usando SQL Directo)
usersCtl.updateUser = async (req, res) => {
    // Se usa req.user.id si la solicitud viene de un usuario logueado para su propio perfil
    // De lo contrario, se usa req.params.id para buscar por ID (ej. por un administrador)
    const idUsuario = req.user ? req.user.id : req.params.id;
    try {
        const usuarioActualizado = await actualizarUsuarioUseCase.execute(idUsuario, req.body);
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        console.error('Error al actualizar usuario (Hexagonal):', error);
        if (error.message === 'Usuario no encontrado.') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 5. ELIMINAR USUARIO (Usando SQL Directo)
usersCtl.deleteUser = async (req, res) => {
    // Se usa req.user.id si la solicitud viene de un usuario logueado para su propio perfil
    // De lo contrario, se usa req.params.id para buscar por ID (ej. por un administrador)
    const idUsuario = req.user ? req.user.id : req.params.id;
    try {
        await eliminarUsuarioUseCase.execute(idUsuario);
        res.status(200).json({ message: 'Usuario marcado como eliminado.' });
    } catch (error) {
        console.error('Error al eliminar usuario (Hexagonal):', error);
        if (error.message === 'Usuario no encontrado.') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 6. LOGIN USUARIO (Usando SQL Directo)
usersCtl.loginUser = async (req, res) => {
    const { correo_electronico, contrasena } = req.body;
    try {
        const user = await loginUsuarioUseCase.execute(correo_electronico, contrasena);

        // Return same structure as before for frontend compatibility
        res.status(200).json({
            message: "Login exitoso",
            userId: user.id,
            nombre: user.nombre,
            correo_electronico: user.correo_electronico
        });
    } catch (error) {
        console.error('Error en login (Hexagonal):', error);
        if (error.message === 'Correo o contraseña incorrectos.') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- CRUD de Preferencias (LEGACY - PENDING MIGRATION) ---
// Kept original imports for preferences logic only
const orm = require('../../database/connection/dataBase.orm');
const sql = require('../../database/connection/dataBase.sql');
const mongo = require('../../database/connection/dataBase.mongo');
const { cifrarDato } = require('../../../application/controller/encrypDates'); // Used in preferences legacy logic

function formatLocalDateTime(date) { // Helper used in legacy preferences
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

usersCtl.registerPreferences = async (req, res) => {
    // Se usa req.user.id si la solicitud viene de un usuario logueado para su propio perfil
    // De lo contrario, se usa req.params.id para buscar por ID (ej. por un administrador)
    const idUsuario = req.user ? req.user.id : req.params.id;
    const { tema, sidebarMinimizado } = req.body;
    try {
        const now = new Date();
        // CAMBIO: Formatear la fecha a string 'YYYY-MM-DD HH:mm:ss' para columnas STRING
        const formattedNow = formatLocalDateTime(now);

        // CORREGIDO: Se usa 'orm.preferencias' en singular y se añaden 'estado' y 'fecha_creacion'
        const nuevaPreferenciaSQL = {
            tema,
            usuarioId: idUsuario,
            estado: 'activo', // Asegurar que el estado se guarde
            fecha_creacion: formattedNow, // Asegurar que la fecha de creación se guarde (hora local formateada)
        };
        const preferenciaGuardadaSQL = await orm.preferencias.create(nuevaPreferenciaSQL);
        const idPreferenciaSql = preferenciaGuardadaSQL.id;

        // CORREGIDO: Se usa 'mongo.Preferencias' con mayúscula
        const nuevaPreferenciaMongo = {
            idPreferenciaSql,
            sidebarMinimizado,
            estado: 'activo', // Asegurar que el estado se guarde en Mongo
            fecha_creacion: formattedNow, // Asegurar que la fecha de creación se guarde en Mongo (hora local formateada)
        };
        await mongo.Preferencias.create(nuevaPreferenciaMongo);

        res.status(201).json({ message: 'Preferencias registradas exitosamente.' });
    } catch (error) {
        console.error('Error al registrar las preferencias:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

usersCtl.getUserWithPreferences = async (req, res) => {
    // Se usa req.user.id si la solicitud viene de un usuario logueado para su propio perfil
    // De lo contrario, se usa req.params.id para buscar por ID (ej. por un administrador)
    const idUsuario = req.user ? req.user.id : req.params.id;
    try {
        // SQL directo para obtener usuario
        const [usuariosSQL] = await sql.promise().query("SELECT * FROM usuarios WHERE id = ? AND estado = 'activo'", [idUsuario]);

        if (usuariosSQL.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const usuarioSQL = usuariosSQL[0];

        // SQL directo para obtener preferencias
        const [preferenciasSQL] = await sql.promise().query("SELECT * FROM preferencias WHERE usuarioId = ?", [idUsuario]);

        let preferenciasMongo = null;
        if (preferenciasSQL.length > 0) {
            // CORREGIDO: Se usa 'mongo.Preferencias' con mayúscula
            preferenciasMongo = await mongo.Preferencias.findOne({ idPreferenciaSql: preferenciasSQL[0].id });
        }

        const resultado = {
            id: usuarioSQL.id,
            // Use SecurityService or simpler manual decryption for Legacy compatibility in this mixed endpoint
            // For now assuming safeDecrypt is needed but it was deleted.
            // Re-implementing a local safeDecrypt since I removed the top-level one.
            nombre: require('../../../application/controller/encrypDates').descifrarDato(usuarioSQL.nombre),
            preferencias: preferenciasSQL.length > 0 ? {
                tema: preferenciasSQL[0].tema,
                sidebarMinimizado: preferenciasMongo?.sidebarMinimizado || false,
                estado: preferenciasSQL[0].estado,
                fecha_creacion: preferenciasSQL[0].fecha_creacion,
                fecha_modificacion: preferenciasSQL[0].fecha_modificacion
            } : null
        };

        res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al obtener usuario con preferencias:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

usersCtl.updatePreferences = async (req, res) => {
    // Se usa req.user.id si la solicitud viene de un usuario logueado para su propio perfil
    // De lo contrario, se usa req.params.id para buscar por ID (ej. por un administrador)
    const idUsuario = req.user ? req.user.id : req.params.id;
    const { tema, sidebarMinimizado } = req.body;
    try {
        // SQL directo para buscar preferencias
        const [preferenciasSQL] = await sql.promise().query("SELECT * FROM preferencias WHERE usuarioId = ?", [idUsuario]);

        if (preferenciasSQL.length === 0) {
            return res.status(404).json({ error: 'Preferencias no encontradas.' });
        }

        const preferenciaSQL = preferenciasSQL[0];
        const now = new Date();
        // CAMBIO: Formatear la fecha a string 'YYYY-MM-DD HH:mm:ss' para columnas STRING
        const formattedNow = formatLocalDateTime(now);

        // SQL directo para actualizar tema
        await sql.promise().query("UPDATE preferencias SET tema = ?, fecha_modificacion = ? WHERE id = ?", [tema, formattedNow, preferenciaSQL.id]);

        // CORREGIDO: Se usa 'mongo.Preferencias' con mayúscula
        await mongo.Preferencias.updateOne(
            { idPreferenciaSql: preferenciaSQL.id },
            { $set: { sidebarMinimizado, fecha_modificacion: formattedNow } }
        );

        res.status(200).json({ message: 'Preferencias actualizadas.' });
    } catch (error) {
        console.error('Error al actualizar preferencias:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

usersCtl.deletePreferences = async (req, res) => {
    // Se usa req.user.id si la solicitud viene de un usuario logueado para su propio perfil
    // De lo contrario, se usa req.params.id para buscar por ID (ej. por un administrador)
    const idUsuario = req.user ? req.user.id : req.params.id;
    try {
        // SQL directo para buscar preferencias
        const [preferenciasSQL] = await sql.promise().query("SELECT * FROM preferencias WHERE usuarioId = ?", [idUsuario]);

        if (preferenciasSQL.length === 0) {
            return res.status(404).json({ error: 'Preferencias no encontradas.' });
        }

        const preferenciaSQL = preferenciasSQL[0];
        const now = new Date();
        // CAMBIO: Formatear la fecha a string 'YYYY-MM-DD HH:mm:ss' para columnas STRING
        const formattedNow = formatLocalDateTime(now);

        // SQL directo para marcar como eliminado
        await sql.promise().query("UPDATE preferencias SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?", [formattedNow, preferenciaSQL.id]);

        // CORREGIDO: Se usa 'mongo.Preferencias' con mayúscula
        await mongo.Preferencias.updateOne(
            { idPreferenciaSql: preferenciaSQL.id },
            { $set: { estado: 'eliminado', fecha_modificacion: formattedNow } }
        );

        res.status(200).json({ message: 'Preferencias marcadas como eliminadas.' });
    } catch (error) {
        console.error('Error al eliminar preferencias:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = usersCtl;

