class ActualizarMensajeGrupo {
    constructor(mensajeGrupoRepository) {
        this.mensajeGrupoRepository = mensajeGrupoRepository;
    }

    async execute(id, datos) {
        if (!datos.mensaje && datos.estado === undefined && datos.tipo_mensaje === undefined) {
            throw new Error('Se requiere el campo "mensaje", "estado" o "tipo_mensaje" para actualizar.');
        }

        const mensajeActualizado = await this.mensajeGrupoRepository.update(id, datos);
        if (!mensajeActualizado) {
            throw new Error('Mensaje no encontrado o inactivo.');
        }
        return mensajeActualizado;
    }
}

module.exports = ActualizarMensajeGrupo;
