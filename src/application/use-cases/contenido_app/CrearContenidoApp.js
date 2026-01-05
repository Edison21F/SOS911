class CrearContenidoApp {
    constructor(contenidoAppRepository) {
        this.contenidoAppRepository = contenidoAppRepository;
    }

    async execute(data) {
        const existing = await this.contenidoAppRepository.findActive();
        if (existing) {
            throw new Error('La configuración de contenido global ya existe. Utilice PUT para actualizar.');
        }

        return await this.contenidoAppRepository.save(data);
    }
}

module.exports = CrearContenidoApp;
