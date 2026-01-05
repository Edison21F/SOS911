class CambiarEstadoContenidoApp {
    constructor(contenidoAppRepository) {
        this.contenidoAppRepository = contenidoAppRepository;
    }

    async execute(estado) {
        if (!['activo', 'eliminado'].includes(estado)) {
            throw new Error('Estado inválido. Debe ser "activo" o "eliminado".');
        }

        const existing = await this.contenidoAppRepository.findActive();
        if (!existing) {
            throw new Error('Contenido no encontrado.');
        }

        return await this.contenidoAppRepository.changeStatus(existing.id, estado);
    }
}

module.exports = CambiarEstadoContenidoApp;
