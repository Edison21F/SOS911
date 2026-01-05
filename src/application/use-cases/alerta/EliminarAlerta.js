class EliminarAlerta {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(id) {
        const alerta = await this.alertaRepository.findById(id);
        if (!alerta) throw new Error('Presión del botón de pánico no encontrada.');

        return await this.alertaRepository.delete(id);
    }
}
module.exports = EliminarAlerta;
