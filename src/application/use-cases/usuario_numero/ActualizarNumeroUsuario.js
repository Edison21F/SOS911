class ActualizarNumeroUsuario {
    constructor(usuarioNumeroRepository) {
        this.usuarioNumeroRepository = usuarioNumeroRepository;
    }

    async execute(id, datos) {
        const numero = await this.usuarioNumeroRepository.findById(id);
        if (!numero || numero.estado !== 'activo') {
            throw new Error('Número de usuario no encontrado o inactivo.');
        }

        return await this.usuarioNumeroRepository.update(id, datos);
    }
}

module.exports = ActualizarNumeroUsuario;
