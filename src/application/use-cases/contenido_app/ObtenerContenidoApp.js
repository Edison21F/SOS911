class ObtenerContenidoApp {
    constructor(contenidoAppRepository) {
        this.contenidoAppRepository = contenidoAppRepository;
    }

    async execute() {
        let contenido = await this.contenidoAppRepository.findActive();

        if (!contenido) {
            // Create default (Controller logic moved here)
            contenido = await this.contenidoAppRepository.save({}); // Defaults handled in repo
        } else {
            // Ensure mongo exists if SQL found (Corner case handling from controller)
            const created = await this.contenidoAppRepository.ensureMongoExists(contenido.id);
            if (created) {
                contenido = await this.contenidoAppRepository.findById(contenido.id);
            }
        }

        return contenido;
    }
}

module.exports = ObtenerContenidoApp;
