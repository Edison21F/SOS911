class ActualizarNotificacion {
    constructor(notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    async execute(id, datos) {
        if (datos.recibido === undefined && datos.respuesta === undefined && datos.estado === undefined) {
            throw new Error('No se proporcionaron campos para actualizar.');
        }

        const notificacionActualizada = await this.notificacionRepository.update(id, datos);
        if (!notificacionActualizada) {
            throw new Error('Notificación no encontrada o eliminada para actualizar.');
        }
        return notificacionActualizada;
    }
}

module.exports = ActualizarNotificacion;
