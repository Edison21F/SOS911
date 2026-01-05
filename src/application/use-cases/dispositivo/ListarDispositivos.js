class ListarDispositivos {
    constructor(dispositivoRepository) {
        this.dispositivoRepository = dispositivoRepository;
    }

    async execute(incluirEliminados = false) {
        return await this.dispositivoRepository.findAll(incluirEliminados);
    }
}

module.exports = ListarDispositivos;
