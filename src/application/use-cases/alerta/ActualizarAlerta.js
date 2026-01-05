class ActualizarAlerta {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(id, data) {
        const alerta = await this.alertaRepository.findById(id);
        if (!alerta) throw new Error('Presión del botón de pánico no encontrada.');

        if (data.marca_tiempo) alerta.marca_tiempo = data.marca_tiempo;
        if (data.estado) alerta.estado = data.estado;

        return await this.alertaRepository.update(alerta);
    }
}
module.exports = ActualizarAlerta;
