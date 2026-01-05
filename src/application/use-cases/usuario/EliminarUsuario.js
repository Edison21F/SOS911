/**
 * Use Case: Delete User
 */
class EliminarUsuario {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(id) {
        const user = await this.usuarioRepository.findById(id);
        if (!user) throw new Error('Usuario no encontrado.');

        return await this.usuarioRepository.delete(id);
    }
}
module.exports = EliminarUsuario;
