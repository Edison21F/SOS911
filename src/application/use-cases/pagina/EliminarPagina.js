class EliminarPagina {
    constructor(paginaRepository) {
        this.paginaRepository = paginaRepository;
    }

    async execute(id) {
        const pagina = await this.paginaRepository.findById(id);
        if (!pagina) {
            throw new Error('Configuración de página no encontrada.');
        }

        await this.paginaRepository.delete(id);
    }
}

module.exports = EliminarPagina;
