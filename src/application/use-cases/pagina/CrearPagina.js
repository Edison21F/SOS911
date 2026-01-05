const Pagina = require('../../../domain/entities/Pagina');

class CrearPagina {
    constructor(paginaRepository) {
        this.paginaRepository = paginaRepository;
    }

    async execute(data) {
        const { nombrePagina, descripcionPagina, mision, vision, logoUrl } = data;

        // Validation
        if (!nombrePagina || !descripcionPagina) {
            throw new Error('Nombre y descripción de la página son requeridos.');
        }

        // Check Unique Active Config (Singleton check equivalent)
        const activePage = await this.paginaRepository.findActive();
        if (activePage) {
            throw new Error('Ya existe una configuración de página activa. Utilice actualizar.');
        }

        // Check Name Uniqueness (though singleton check usually covers this context, explicit name check was in controller)
        const existingName = await this.paginaRepository.findByNombre(nombrePagina);
        if (existingName) {
            throw new Error('El nombre de página ya está registrado.');
        }

        const nuevaPagina = new Pagina({
            nombrePagina,
            descripcionPagina,
            mision,
            vision,
            logoUrl
        });

        return await this.paginaRepository.save(nuevaPagina);
    }
}

module.exports = CrearPagina;
