class EliminarClienteGrupo {
    constructor(clienteGrupoRepository) {
        this.clienteGrupoRepository = clienteGrupoRepository;
    }

    async execute(id) {
        const existente = await this.clienteGrupoRepository.findById(id);
        if (!existente || existente.estado === 'eliminado') {
            throw new Error('Relación no encontrada o ya eliminada.');
        }

        const resultado = await this.clienteGrupoRepository.delete(id);
        if (!resultado) {
            throw new Error('No se pudo eliminar la relación.');
        }
        return true;
    }
}

module.exports = EliminarClienteGrupo;
