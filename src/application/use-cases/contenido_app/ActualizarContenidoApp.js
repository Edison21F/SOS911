class ActualizarContenidoApp {
    constructor(contenidoAppRepository) {
        this.contenidoAppRepository = contenidoAppRepository;
    }

    async execute(data) {
        const existing = await this.contenidoAppRepository.findActive();
        if (!existing) {
            throw new Error('Contenido no encontrado para actualizar.');
        }

        return await this.contenidoAppRepository.update(existing.id, data);
    }
}

module.exports = ActualizarContenidoApp;
