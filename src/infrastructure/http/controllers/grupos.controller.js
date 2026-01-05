// --- Hexagonal Imports ---
const MysqlMongoGrupoRepository = require('../../adapters/secondary/database/MysqlMongoGrupoRepository');
const MysqlClienteGrupoRepository = require('../../adapters/secondary/database/MysqlClienteGrupoRepository');

const CrearGrupo = require('../../../../application/use-cases/grupo/CrearGrupo');
const ListarGrupos = require('../../../../application/use-cases/grupo/ListarGrupos');
const ObtenerGrupo = require('../../../../application/use-cases/grupo/ObtenerGrupo');
const ActualizarGrupo = require('../../../../application/use-cases/grupo/ActualizarGrupo');
const EliminarGrupo = require('../../../../application/use-cases/grupo/EliminarGrupo');
const UnirseAGrupo = require('../../../../application/use-cases/grupo/UnirseAGrupo');
const ListarClientesGrupos = require('../../../../application/use-cases/cliente_grupo/ListarClientesGrupos'); // For getMembers

// --- Dependency Injection ---
const grupoRepository = new MysqlMongoGrupoRepository();
const clienteGrupoRepository = new MysqlClienteGrupoRepository(); // Needed for creation and joining

const crearGrupoUseCase = new CrearGrupo(grupoRepository, clienteGrupoRepository);
const listarGruposUseCase = new ListarGrupos(grupoRepository);
const obtenerGrupoUseCase = new ObtenerGrupo(grupoRepository);
const actualizarGrupoUseCase = new ActualizarGrupo(grupoRepository);
const eliminarGrupoUseCase = new EliminarGrupo(grupoRepository);
const unirseAGrupoUseCase = new UnirseAGrupo(grupoRepository, clienteGrupoRepository);
const listarMiembrosUseCase = new ListarClientesGrupos(clienteGrupoRepository);

const gruposCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR GRUPO
gruposCtl.createGroup = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, nombre } = req.body;
    logger.info(`[GRUPOS] Solicitud de creación de grupo (Hexagonal): nombre=${nombre}, clienteId=${clienteId}`);

    try {
        const nuevoGrupo = await crearGrupoUseCase.execute(req.body);
        logger.info(`[GRUPOS] Grupo creado: id=${nuevoGrupo.id}, codigo=${nuevoGrupo.codigo_acceso}`);

        res.status(201).json({
            message: 'Grupo creado exitosamente.',
            grupoId: nuevoGrupo.id,
            codigo: nuevoGrupo.codigo_acceso
        });
    } catch (error) {
        console.error(`[GRUPOS] Error al crear: ${error.message}`);
        if (error.message.includes('obligatorios')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear el grupo.' });
    }
};

// 2. LISTAR GRUPOS
gruposCtl.getAllGroups = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId } = req.query;
    logger.info(`[GRUPOS] Listar grupos (Hexagonal)${clienteId ? ' clienteId=' + clienteId : ''}`);

    try {
        const filters = clienteId ? { clienteId } : {};
        const grupos = await listarGruposUseCase.execute(filters);
        res.status(200).json(grupos);
    } catch (error) {
        console.error(`[GRUPOS] Error al listar: ${error.message}`);
        res.status(500).json({ error: 'Error interno al listar grupos.' });
    }
};

// 3. OBTENER GRUPO POR ID
gruposCtl.getGroupById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[GRUPOS] Obtener grupo por ID (Hexagonal): ${id}`);

    try {
        const grupo = await obtenerGrupoUseCase.execute(id);

        if (!grupo) {
            return res.status(404).json({ error: 'Grupo no encontrado o eliminado.' });
        }

        res.status(200).json(grupo);
    } catch (error) {
        console.error(`[GRUPOS] Error al obtener: ${error.message}`);
        res.status(500).json({ error: 'Error interno del servidor al obtener el grupo.' });
    }
};

// 4. ACTUALIZAR GRUPO
gruposCtl.updateGroup = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[GRUPOS] Actualizar grupo (Hexagonal): id=${id}`);

    try {
        await actualizarGrupoUseCase.execute(id, req.body);
        res.status(200).json({ message: 'Grupo actualizado correctamente.' });
    } catch (error) {
        console.error(`[GRUPOS] Error al actualizar: ${error.message}`);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al actualizar grupo.' });
    }
};

// 5. ELIMINAR GRUPO
gruposCtl.deleteGroup = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[GRUPOS] Eliminar grupo (Hexagonal): id=${id}`);

    try {
        await eliminarGrupoUseCase.execute(id);
        res.status(200).json({ message: 'Grupo eliminado correctamente.' });
    } catch (error) {
        console.error(`[GRUPOS] Error al eliminar: ${error.message}`);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al eliminar grupo.' });
    }
};

// 6. UNIRSE A GRUPO
gruposCtl.joinGroup = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, codigo } = req.body;
    logger.info(`[GRUPOS] Unirse a grupo (Hexagonal): clienteId=${clienteId}, codigo=${codigo}`);

    try {
        const relacion = await unirseAGrupoUseCase.execute(clienteId, codigo);
        // Need to fetch group name for response? 
        // Original controller did: { message: ..., grupoId, nombre: nombreGrupo }
        const grupo = await obtenerGrupoUseCase.execute(relacion.grupoId);

        res.status(200).json({
            message: 'Te has unido al grupo exitosamente.',
            grupoId: relacion.grupoId,
            nombre: grupo.nombre
        });

    } catch (error) {
        console.error(`[GRUPOS] Error al unirse: ${error.message}`);
        if (error.message.includes('inválido')) return res.status(404).json({ message: 'Código de grupo inválido o grupo no existe.' });
        if (error.message.includes('Ya eres miembro')) return res.status(409).json({ message: error.message });

        res.status(500).json({ error: 'Error interno al unirse al grupo.' });
    }
};

// 7. OBTENER MIEMBROS
gruposCtl.getMembers = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[GRUPOS] Obtener miembros de grupo (Hexagonal): id=${id}`);

    try {
        // Reuse ListarClientesGrupos with filtering
        const relaciones = await listarMiembrosUseCase.execute({ grupoId: id });

        // Transform to match simplified response format if needed { id, nombre, foto, estado }
        // The frontend likely expects client info flattened.
        const miembros = relaciones.map(r => ({
            id: r.clienteId,
            nombre: r.cliente_info ? r.cliente_info.nombre : 'Desconocido',
            foto: r.cliente_info ? r.cliente_info.foto : null,
            estado: r.estado
        }));

        res.status(200).json(miembros);
    } catch (error) {
        console.error(`[GRUPOS] Error al obtener miembros: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener miembros.' });
    }
};

// 8. SUBIR FOTO
gruposCtl.uploadPhoto = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[GRUPOS] Subir foto para grupo (Hexagonal): id=${id}`);

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    }

    const archivo = req.files.image;
    const path = require('path');
    const fs = require('fs');

    if (!archivo.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'El archivo debe ser una imagen.' });
    }

    const uploadDir = path.join(__dirname, '../../../../public/uploads/groups');
    const fileName = `group_${id}_${Date.now()}${path.extname(archivo.name)}`;
    const uploadPath = path.join(uploadDir, fileName);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    archivo.mv(uploadPath, async (err) => {
        if (err) {
            console.error(`[GRUPOS] Error al mover archivo: ${err.message}`);
            return res.status(500).json({ error: err });
        }

        const imageUrl = `/uploads/groups/${fileName}`;

        try {
            // Update entity via Use Case
            await actualizarGrupoUseCase.execute(id, { imagen: imageUrl });
            res.status(200).json({ message: 'Foto subida correctamente', url: imageUrl });
        } catch (error) {
            console.error(`[GRUPOS] Error al actualizar imagen en entidad: ${error.message}`);
            res.status(500).json({ error: 'Error al actualizar registro de imagen.' });
        }
    });

};

module.exports = gruposCtl;

