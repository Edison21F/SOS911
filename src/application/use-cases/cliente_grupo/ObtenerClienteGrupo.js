class ObtenerClienteGrupo {
    constructor(clienteGrupoRepository) {
        this.clienteGrupoRepository = clienteGrupoRepository;
    }

    async execute(id) {
        const relacion = await this.clienteGrupoRepository.findById(id);
        if (!relacion || relacion.estado !== 'activo') {
            // Basic active check logic similar to others
            if (!relacion) return null;
            if (relacion.estado !== 'activo') return null;
        }
        return relacion;
    }
}

module.exports = ObtenerClienteGrupo;
