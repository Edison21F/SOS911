class CrearNotificacion {
    constructor(notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    async execute(datos) {
        if (!datos.presionesBotonPanicoId || !datos.clienteId) {
            throw new Error('Los campos presionesBotonPanicoId y clienteId son requeridos.');
        }

        const nuevaNotificacion = await this.notificacionRepository.save(datos);
        return nuevaNotificacion;
    }
}

module.exports = CrearNotificacion;
