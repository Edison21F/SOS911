class ObtenerPagina {
    constructor(paginaRepository) {
        this.paginaRepository = paginaRepository;
    }

    async execute(id = null) {
        let pagina;
        if (id) {
            pagina = await this.paginaRepository.findById(id);
        } else {
            // Get active default
            pagina = await this.paginaRepository.findActive();
        }

        if (!pagina) {
            throw new Error('Configuración de página no encontrada.');
        }

        return pagina;
    }
}

module.exports = ObtenerPagina;
