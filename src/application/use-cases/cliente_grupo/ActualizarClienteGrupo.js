class ActualizarClienteGrupo {
    constructor(clienteGrupoRepository) {
        this.clienteGrupoRepository = clienteGrupoRepository;
    }

    async execute(id, datos) {
        const existente = await this.clienteGrupoRepository.findById(id);
        if (!existente || existente.estado !== 'activo') {
            throw new Error('Relación no encontrada o inactiva.');
        }

        // Usually only status is updated here. 
        // Changing clienteId or grupoId would be a new relationship or severe change not typical for simple update endpoint.
        // We allow what repository allows.

        return await this.clienteGrupoRepository.update(id, datos);
    }
}

module.exports = ActualizarClienteGrupo;
