class ObtenerNotificacion {
    constructor(notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    async execute(id) {
        const notificacion = await this.notificacionRepository.findById(id);

        // Check for soft deleted if needed, but repo usually returns it if found.
        // However, repository method `findById` did filtering?
        // Let's check: "WHERE n.id = ?" (No status filter in findById implementation in adapter).
        // The original controller check: "WHERE id = ? AND n.estado != 'eliminado'".

        if (!notificacion || notificacion.estado === 'eliminado') {
            return null;
        }
        return notificacion;
    }
}

module.exports = ObtenerNotificacion;
