class ObtenerGrupo {
    constructor(grupoRepository) {
        this.grupoRepository = grupoRepository;
    }

    async execute(id) {
        const grupo = await this.grupoRepository.findById(id);
        if (!grupo || grupo.estado !== 'activo') {
            if (!grupo) return null;
            if (grupo.estado !== 'activo') return null;
        }
        return grupo;
    }
}

module.exports = ObtenerGrupo;
