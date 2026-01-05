class AsignarClienteGrupo {
    constructor(clienteGrupoRepository) {
        this.clienteGrupoRepository = clienteGrupoRepository;
    }

    async execute(datos) {
        if (!datos.clienteId || !datos.grupoId) {
            throw new Error('campos "clienteId" y "grupoId" son obligatorios.');
        }

        const existing = await this.clienteGrupoRepository.findByClientAndGroup(datos.clienteId, datos.grupoId);
        if (existing) {
            if (existing.estado === 'activo') {
                throw new Error('El cliente ya es miembro de este grupo.');
            } else {
                // Reactivation allowed? We could just update state to active
                return await this.clienteGrupoRepository.update(existing.id, { estado: 'activo' });
            }
        }

        return await this.clienteGrupoRepository.save(datos);
    }
}

module.exports = AsignarClienteGrupo;
