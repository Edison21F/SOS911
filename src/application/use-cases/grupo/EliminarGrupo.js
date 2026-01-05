class EliminarGrupo {
    constructor(grupoRepository) {
        this.grupoRepository = grupoRepository;
    }

    async execute(id) {
        const grupo = await this.grupoRepository.findById(id);
        if (!grupo || grupo.estado === 'eliminado') {
            throw new Error('Grupo no encontrado o ya eliminado.');
        }

        const eliminado = await this.grupoRepository.delete(id);
        if (!eliminado) {
            throw new Error('No se pudo eliminar el grupo.');
        }
        return true;
    }
}

module.exports = EliminarGrupo;
