class ListarAlertas {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(incluirEliminados) {
        return await this.alertaRepository.findAll(incluirEliminados);
    }
}
module.exports = ListarAlertas;
