class ObtenerAlertasActivas {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(idUsuarioSql) {
        return await this.alertaRepository.findByUsuario(idUsuarioSql);
    }
}

module.exports = ObtenerAlertasActivas;
