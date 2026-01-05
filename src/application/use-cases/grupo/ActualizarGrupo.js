class ActualizarGrupo {
    constructor(grupoRepository) {
        this.grupoRepository = grupoRepository;
    }

    async execute(id, data) {
        const grupo = await this.grupoRepository.findById(id);
        if (!grupo || grupo.estado !== 'activo') {
            throw new Error('Grupo no encontrado o inactivo.');
        }

        return await this.grupoRepository.update(id, data);
    }
}

module.exports = ActualizarGrupo;
