class SubirFotoPerfilCliente {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(id, filename) {
        const success = await this.clienteRepository.updateProfilePicture(id, filename);
        if (!success) throw new Error('Cliente no encontrado.');

        return `/uploads/profiles/${filename}`;
    }
}
module.exports = SubirFotoPerfilCliente;
