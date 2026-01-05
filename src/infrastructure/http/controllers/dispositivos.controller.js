// --- Hexagonal Imports ---
const MysqlDispositivoRepository = require('../../adapters/secondary/database/MysqlDispositivoRepository');
const CrearDispositivo = require('../../../../application/use-cases/dispositivo/CrearDispositivo');
const ListarDispositivos = require('../../../../application/use-cases/dispositivo/ListarDispositivos');
const ObtenerDispositivo = require('../../../../application/use-cases/dispositivo/ObtenerDispositivo');
const ActualizarDispositivo = require('../../../../application/use-cases/dispositivo/ActualizarDispositivo');
const EliminarDispositivo = require('../../../../application/use-cases/dispositivo/EliminarDispositivo');

// --- Dependency Injection ---
const dispositivoRepository = new MysqlDispositivoRepository();
const crearDispositivoUseCase = new CrearDispositivo(dispositivoRepository);
const listarDispositivosUseCase = new ListarDispositivos(dispositivoRepository);
const obtenerDispositivoUseCase = new ObtenerDispositivo(dispositivoRepository);
const actualizarDispositivoUseCase = new ActualizarDispositivo(dispositivoRepository);
const eliminarDispositivoUseCase = new EliminarDispositivo(dispositivoRepository);

const dispositivosCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UN NUEVO DISPOSITIVO
dispositivosCtl.createDevice = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId } = req.body;
    logger.info(`[DISPOSITIVO] Solicitud de creación (Hexagonal): clienteId=${clienteId}`);

    try {
        const dispositivoCreado = await crearDispositivoUseCase.execute(req.body);
        logger.info(`[DISPOSITIVO] Dispositivo creado exitosamente con ID: ${dispositivoCreado.id}`);

        res.status(201).json({
            message: 'Dispositivo registrado exitosamente.',
            dispositivo: dispositivoCreado
        });
    } catch (error) {
        console.error(`[DISPOSITIVO] Error al crear el dispositivo: ${error.message}`);

        if (error.message.includes('requeridos')) {
            return res.status(400).json({ message: error.message }); // Keep 'message' key for compatibility if frontend expects it
        }
        if (error.message.includes('ya está registrado')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear el dispositivo.' });
    }
};

// 2. OBTENER TODOS LOS DISPOSITIVOS
dispositivosCtl.getAllDevices = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[DISPOSITIVO] Solicitud de obtención de todos los dispositivos (incluirEliminados: ${incluirEliminados}) (Hexagonal)`);

    try {
        const dispositivos = await listarDispositivosUseCase.execute(incluirEliminados === 'true');
        logger.info(`[DISPOSITIVO] Se devolvieron ${dispositivos.length} dispositivos.`);
        res.status(200).json(dispositivos);
    } catch (error) {
        console.error('Error al obtener los dispositivos:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los dispositivos.' });
    }
};

// 3. OBTENER UN DISPOSITIVO POR ID
dispositivosCtl.getDeviceById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[DISPOSITIVO] Solicitud de obtención de dispositivo por ID (Hexagonal): ${id}`);

    try {
        const dispositivo = await obtenerDispositivoUseCase.execute(id);

        if (!dispositivo) {
            logger.warn(`[DISPOSITIVO] Dispositivo no encontrado o inactivo con ID: ${id}`);
            return res.status(404).json({ error: 'Dispositivo no encontrado o inactivo.' });
        }

        logger.info(`[DISPOSITIVO] Dispositivo encontrado con ID: ${id}.`);
        res.status(200).json(dispositivo);
    } catch (error) {
        console.error('Error al obtener el dispositivo:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener el dispositivo.' });
    }
};

// 4. ACTUALIZAR UN DISPOSITIVO POR ID
dispositivosCtl.updateDevice = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[DISPOSITIVO] Solicitud de actualización de dispositivo con ID (Hexagonal): ${id}`);

    try {
        const dispositivoActualizado = await actualizarDispositivoUseCase.execute(id, req.body);
        logger.info(`[DISPOSITIVO] Dispositivo actualizado con ID: ${id}`);

        res.status(200).json({
            message: 'Dispositivo actualizado correctamente.',
            dispositivo: dispositivoActualizado
        });

    } catch (error) {
        console.error('Error al actualizar el dispositivo:', error.message);
        if (error.message.includes('No se proporcionaron campos')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('Dispositivo no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar el dispositivo.' });
    }
};

// 5. ELIMINAR UN DISPOSITIVO
dispositivosCtl.deleteDevice = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[DISPOSITIVO] Solicitud de eliminación lógica de dispositivo con ID (Hexagonal): ${id}`);

    try {
        await eliminarDispositivoUseCase.execute(id);
        logger.info(`[DISPOSITIVO] Dispositivo marcado como eliminado con ID: ${id}.`);
        res.status(200).json({ message: 'Dispositivo marcado como eliminado correctamente.' });
    } catch (error) {
        console.error('Error al borrar el dispositivo:', error.message);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al borrar el dispositivo.' });
    }
};

module.exports = dispositivosCtl;

