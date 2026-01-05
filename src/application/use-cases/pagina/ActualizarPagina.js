class ActualizarPagina {
    constructor(paginaRepository) {
        this.paginaRepository = paginaRepository;
    }

    async execute(id, data) {
        const pagina = await this.paginaRepository.findById(id);
        if (!pagina) {
            throw new Error('Configuración de página no encontrada.');
        }

        if (data.nombrePagina && data.nombrePagina !== pagina.nombrePagina) {
            const existingName = await this.paginaRepository.findByNombre(data.nombrePagina);
            if (existingName && existingName.id !== id) {
                throw new Error('El nombre de página ya está registrado por otra configuración.');
            }
        }

        // Update fields
        if (data.nombrePagina) pagina.nombrePagina = data.nombrePagina;
        if (data.descripcionPagina) pagina.descripcionPagina = data.descripcionPagina;
        if (data.mision) pagina.mision = data.mision;
        if (data.vision) pagina.vision = data.vision;
        if (data.logoUrl) pagina.logoUrl = data.logoUrl;
        if (data.estado) pagina.estado = data.estado;

        return await this.paginaRepository.update(pagina);
    }
}

module.exports = ActualizarPagina;
