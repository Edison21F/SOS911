class ObtenerHistorialAlertas {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(idUsuarioSql) {
        return await this.alertaRepository.findHistoryByUsuario(idUsuarioSql);
    }
}

module.exports = ObtenerHistorialAlertas;
