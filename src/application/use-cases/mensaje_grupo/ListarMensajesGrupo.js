class ListarMensajesGrupo {
    constructor(mensajeGrupoRepository) {
        this.mensajeGrupoRepository = mensajeGrupoRepository;
    }

    async execute(grupoId) {
        if (!grupoId) throw new Error('El grupoId es requerido.');
        return await this.mensajeGrupoRepository.findByGroup(grupoId);
    }
}

module.exports = ListarMensajesGrupo;
