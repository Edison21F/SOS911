class ObtenerAlertasCercanas {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(lat, lng, radio) {
        return await this.alertaRepository.findNearby(lat, lng, radio);
    }
}

module.exports = ObtenerAlertasCercanas;
