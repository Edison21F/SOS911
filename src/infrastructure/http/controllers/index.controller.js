const passport = require('passport'); // Keep for req.login/logout
const MysqlMongoUsuarioRepository = require('../../adapters/secondary/database/MysqlMongoUsuarioRepository');

// Use Cases
const CheckRegistrationAvailability = require('../../../application/use-cases/usuario/CheckRegistrationAvailability');
const RegistrarUsuario = require('../../../application/use-cases/usuario/RegistrarUsuario');
const LoginUsuario = require('../../../application/use-cases/usuario/LoginUsuario');

// Dependencies
const usuarioRepository = new MysqlMongoUsuarioRepository();
const checkRegistrationAvailabilityUseCase = new CheckRegistrationAvailability(usuarioRepository);
const registrarUsuarioUseCase = new RegistrarUsuario(usuarioRepository);
const loginUsuarioUseCase = new LoginUsuario(usuarioRepository);

const indexCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CSRF Token
indexCtl.mostrar = async (req, res) => {
    const logger = getLogger(req);
    logger.info('[AUTH] Solicitud de token CSRF.');
    try {
        res.json({ csrfToken: req.csrfToken() });
    } catch (error) {
        logger.error(`[AUTH] Error CSRF: ${error.message}`);
        res.status(500).json({ error: 'Error interno.' });
    }
};

// 2. Check Registration Availability
indexCtl.mostrarRegistro = async (req, res) => {
    const logger = getLogger(req);
    logger.info('[AUTH] Verificar disponibilidad de registro.');
    try {
        const result = await checkRegistrationAvailabilityUseCase.execute();

        if (result.available) {
            logger.info(`[AUTH] Registro disponible. Max User ID: ${result.maxUserId}.`);
            res.json({ maxUserId: result.maxUserId, csrfToken: req.csrfToken() });
        } else {
            logger.info('[AUTH] Registro público cerrado (ya existen usuarios).');
            res.json({ redirect: '/', message: 'El registro público no está disponible.' });
        }
    } catch (error) {
        logger.error(`[AUTH] Error verificando disponibilidad: ${error.message}`);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. Register User
indexCtl.registro = async (req, res, next) => {
    const logger = getLogger(req);
    logger.info(`[AUTH] Solicitud de registro de usuario.`);

    try {
        const nuevoUsuario = await registrarUsuarioUseCase.execute(req.body);
        logger.info(`[AUTH] Usuario registrado exitosamente. ID: ${nuevoUsuario.id}`);

        // Manually Log In using Passport's req.login
        req.login(nuevoUsuario, (err) => {
            if (err) {
                logger.error(`[AUTH] Error al iniciar sesión tras registro: ${err.message}`);
                return res.status(500).json({ error: 'Error al iniciar sesión automática.' });
            }
            res.json({ message: 'Registro exitoso', userId: nuevoUsuario.id, redirect: '/' });
        });

    } catch (error) {
        logger.warn(`[AUTH] Fallo en registro: ${error.message}`);
        if (error.message.includes('ya registrado')) {
            return res.status(409).json({ message: error.message });
        }
        if (error.message.includes('requeridos')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error interno en registro.' });
    }
};

// 4. Login User
indexCtl.login = async (req, res, next) => {
    const logger = getLogger(req);
    const { correo_electronico, contrasena } = req.body;
    logger.info(`[AUTH] Intento de login: ${correo_electronico}`);

    try {
        const usuario = await loginUsuarioUseCase.execute(correo_electronico, contrasena);
        logger.info(`[AUTH] Login correcto. Usuario ID: ${usuario.id}`);

        req.login(usuario, (err) => {
            if (err) {
                logger.error(`[AUTH] Error establishing session: ${err.message}`);
                return res.status(500).json({ error: 'Error iniciando sesión.' });
            }
            res.json({ message: 'Inicio de sesión exitoso', userId: usuario.id, redirect: '/dashboard' });
        });

    } catch (error) {
        logger.warn(`[AUTH] Login fallido: ${error.message}`);
        res.status(401).json({ message: 'Credenciales incorrectas.' });
    }
};

// 5. Logout
indexCtl.CerrarSesion = (req, res, next) => {
    const logger = getLogger(req);
    logger.info('[AUTH] Cerrando sesión.');
    req.logout((err) => {
        if (err) {
            logger.error(`[AUTH] Error al cerrar sesión: ${err.message}`);
            return res.status(500).json({ error: 'Error al cerrar sesión.' });
        }
        res.json({ message: 'Sesión cerrada con éxito', redirect: '/' });
    });
};

module.exports = indexCtl;

