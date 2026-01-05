class EliminarNotificacion {
    constructor(notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    async execute(id) {
        const eliminada = await this.notificacionRepository.delete(id);
        if (!eliminada) {
            throw new Error('Notificación no encontrada o ya estaba eliminada.');
        }
        return true;
    }
}

module.exports = EliminarNotificacion;
