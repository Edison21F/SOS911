class EliminarMensajeGrupo {
    constructor(mensajeGrupoRepository) {
        this.mensajeGrupoRepository = mensajeGrupoRepository;
    }

    async execute(id) {
        const eliminado = await this.mensajeGrupoRepository.delete(id);
        if (!eliminado) {
            throw new Error('Mensaje no encontrado o ya estaba eliminado.');
        }
        return true;
    }
}

module.exports = EliminarMensajeGrupo;
