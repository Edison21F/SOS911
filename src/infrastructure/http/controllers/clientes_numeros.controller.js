// --- Hexagonal Imports ---
const MysqlClienteNumeroRepository = require('../../adapters/secondary/database/MysqlClienteNumeroRepository');
const CrearNumeroCliente = require('../../../../application/use-cases/cliente_numero/CrearNumeroCliente');
const ListarNumerosClientes = require('../../../../application/use-cases/cliente_numero/ListarNumerosClientes');
const ObtenerNumeroCliente = require('../../../../application/use-cases/cliente_numero/ObtenerNumeroCliente');
const ActualizarNumeroCliente = require('../../../../application/use-cases/cliente_numero/ActualizarNumeroCliente');
const EliminarNumeroCliente = require('../../../../application/use-cases/cliente_numero/EliminarNumeroCliente');

// --- Dependency Injection ---
const clienteNumeroRepository = new MysqlClienteNumeroRepository();
const crearNumeroUseCase = new CrearNumeroCliente(clienteNumeroRepository);
const listarNumerosUseCase = new ListarNumerosClientes(clienteNumeroRepository);
const obtenerNumeroUseCase = new ObtenerNumeroCliente(clienteNumeroRepository);
const actualizarNumeroUseCase = new ActualizarNumeroCliente(clienteNumeroRepository);
const eliminarNumeroUseCase = new EliminarNumeroCliente(clienteNumeroRepository);

const clientesNumerosCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR NUMERO DE CLIENTE
clientesNumerosCtl.createClientNumber = async (req, res) => {
    const logger = getLogger(req);
    const { nombre, numero, clienteId } = req.body;
    logger.info(`[CLIENTES_NUMEROS] Registro (Hexagonal): nombre=${nombre}, numero=${numero}, clienteId=${clienteId}`);

    try {
        const nuevoNumero = await crearNumeroUseCase.execute(req.body);

        res.status(201).json({
            message: 'Registro exitoso',
            clienteNumero: nuevoNumero
        });
    } catch (error) {
        logger.error(`[CLIENTES_NUMEROS] Error al crear: ${error.message}`);

        if (error.message.includes('Faltan campos')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('|409')) {
            return res.status(409).json({ message: error.message.replace('|409', '') });
        }
        if (error.message.includes('foreign key') || error.message.includes('cliente no existe')) {
            return res.status(400).json({ message: 'El cliente asociado no existe o no está activo.' });
        }

        res.status(500).json({ error: 'Error interno del servidor al crear el número de cliente.' });
    }
};

// 2. LISTAR NUMEROS DE CLIENTE
clientesNumerosCtl.getAllClientNumbers = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[CLIENTES_NUMEROS] Listar (Hexagonal). incluirEliminados=${incluirEliminados}`);

    try {
        const numeros = await listarNumerosUseCase.execute({}, incluirEliminados === 'true');
        logger.info(`[CLIENTES_NUMEROS] Se devolvieron ${numeros.length} números.`);
        res.status(200).json(numeros);
    } catch (error) {
        logger.error('Error al obtener los números de clientes:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los números de clientes.' });
    }
};

// 3. OBTENER NUMERO POR ID
clientesNumerosCtl.getClientNumberById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CLIENTES_NUMEROS] Obtener por ID (Hexagonal): ${id}`);

    try {
        const numero = await obtenerNumeroUseCase.execute(id);

        if (!numero) {
            return res.status(404).json({ error: 'Número de cliente no encontrado o inactivo.' });
        }

        res.status(200).json(numero);
    } catch (error) {
        logger.error('Error al obtener el número de cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener el número de cliente.' });
    }
};

// 4. ACTUALIZAR NUMERO
clientesNumerosCtl.updateClientNumber = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CLIENTES_NUMEROS] Actualizar (Hexagonal): id=${id}`);

    try {
        const updated = await actualizarNumeroUseCase.execute(id, req.body);

        res.status(200).json({
            message: 'Número de cliente actualizado correctamente.',
            clienteNumero: updated
        });
    } catch (error) {
        logger.error('Error al actualizar el número de cliente:', error.message);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar el número de cliente.' });
    }
};

// 5. ELIMINAR NUMERO
clientesNumerosCtl.deleteClientNumber = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CLIENTES_NUMEROS] Eliminar (Hexagonal): id=${id}`);

    try {
        await eliminarNumeroUseCase.execute(id);
        res.status(200).json({ message: 'Número de cliente marcado como eliminado correctamente.' });
    } catch (error) {
        logger.error('Error al borrar el número de cliente:', error.message);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al borrar el número de cliente.' });
    }
};

// 6. OBTENER POR CLIENT_ID
clientesNumerosCtl.getNumbersByClientId = async (req, res) => {
    const logger = getLogger(req);
    const clienteId = req.params.cliente_id;
    logger.info(`[CLIENTES_NUMEROS] Obtener por Cliente (Hexagonal): clienteId=${clienteId}`);

    try {
        const numeros = await listarNumerosUseCase.execute({ clienteId });
        logger.info(`[CLIENTES_NUMEROS] Se devolvieron ${numeros.length} números.`);
        res.status(200).json(numeros);
    } catch (error) {
        logger.error('Error al obtener los números del cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los números del cliente.' });
    }
};

module.exports = clientesNumerosCtl;
