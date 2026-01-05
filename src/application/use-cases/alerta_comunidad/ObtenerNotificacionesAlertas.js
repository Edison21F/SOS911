class ObtenerNotificacionesAlertas {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(idUsuarioSql) {
        return await this.alertaRepository.findRecentExcludingUser(idUsuarioSql);
    }
}

module.exports = ObtenerNotificacionesAlertas;
