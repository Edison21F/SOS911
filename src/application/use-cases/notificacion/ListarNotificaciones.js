class ListarNotificaciones {
    constructor(notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    async execute(incluirEliminados = false) {
        return await this.notificacionRepository.findAll(incluirEliminados);
    }
}

module.exports = ListarNotificaciones;
