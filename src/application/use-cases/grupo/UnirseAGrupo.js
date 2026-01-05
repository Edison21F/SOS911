class UnirseAGrupo {
    constructor(grupoRepository, clienteGrupoRepository) {
        this.grupoRepository = grupoRepository;
        this.clienteGrupoRepository = clienteGrupoRepository;
    }

    async execute(clienteId, codigoAcceso) {
        const grupo = await this.grupoRepository.findByCodigo(codigoAcceso);

        if (!grupo || grupo.estado !== 'activo') {
            throw new Error('Código de acceso inválido o grupo no encontrado.');
        }

        // Check if already member
        const existingMember = await this.clienteGrupoRepository.findByClientAndGroup(clienteId, grupo.id);
        if (existingMember && existingMember.estado === 'activo') {
            throw new Error('Ya eres miembro de este grupo.');
        }

        // Add member
        if (existingMember) {
            // Reactivate
            return await this.clienteGrupoRepository.update(existingMember.id, { estado: 'activo' });
        } else {
            return await this.clienteGrupoRepository.save({
                clienteId,
                grupoId: grupo.id,
                estado: 'activo'
            });
        }
    }
}

module.exports = UnirseAGrupo;
