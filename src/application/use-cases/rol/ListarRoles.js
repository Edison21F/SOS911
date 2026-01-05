class ListarRoles {
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }

    async execute(incluirEliminados = false) {
        return await this.rolRepository.findAll(incluirEliminados);
    }
}

module.exports = ListarRoles;
