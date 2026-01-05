class CrearNumeroUsuario {
    constructor(usuarioNumeroRepository) {
        this.usuarioNumeroRepository = usuarioNumeroRepository;
    }

    async execute(datos) {
        if (!datos.nombre || !datos.numero || !datos.usuarioId) {
            throw new Error('Faltan campos obligatorios: nombre, numero y usuarioId.');
        }

        // Ideally check user existence via DI UserRepo, but skipping as per pattern.

        return await this.usuarioNumeroRepository.save(datos);
    }
}

module.exports = CrearNumeroUsuario;
