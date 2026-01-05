class CrearMensajeGrupo {
    constructor(mensajeGrupoRepository) {
        this.mensajeGrupoRepository = mensajeGrupoRepository;
    }

    async execute(datos) {
        // Validation could go here (e.g. check message length)
        if (!datos.grupoId || !datos.clienteId || !datos.mensaje) {
            throw new Error('Los campos grupoId, clienteId y mensaje son requeridos.');
        }

        const nuevoMensaje = await this.mensajeGrupoRepository.save(datos);
        return nuevoMensaje;
    }
}

module.exports = CrearMensajeGrupo;
