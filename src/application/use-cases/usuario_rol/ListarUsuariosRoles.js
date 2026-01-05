class ListarUsuariosRoles {
    constructor(usuarioRolRepository) {
        this.usuarioRolRepository = usuarioRolRepository;
    }

    async execute(filters = {}, incluirEliminados = false) {
        return await this.usuarioRolRepository.findAll(filters, incluirEliminados);
    }
}

module.exports = ListarUsuariosRoles;
