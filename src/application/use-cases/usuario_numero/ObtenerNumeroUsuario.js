class ObtenerNumeroUsuario {
    constructor(usuarioNumeroRepository) {
        this.usuarioNumeroRepository = usuarioNumeroRepository;
    }

    async execute(id) {
        const numero = await this.usuarioNumeroRepository.findById(id);
        if (!numero || numero.estado !== 'activo') {
            return null;
        }
        return numero;
    }
}

module.exports = ObtenerNumeroUsuario;
