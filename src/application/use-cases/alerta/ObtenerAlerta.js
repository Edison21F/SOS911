class ObtenerAlerta {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(id) {
        return await this.alertaRepository.findById(id);
    }
}
module.exports = ObtenerAlerta;
