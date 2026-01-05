/**
 * Use Case: Get User(s)
 */
class ObtenerUsuario {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(id) {
        return await this.usuarioRepository.findById(id);
    }

    async executeAll() {
        return await this.usuarioRepository.findAll();
    }
}
module.exports = ObtenerUsuario;
