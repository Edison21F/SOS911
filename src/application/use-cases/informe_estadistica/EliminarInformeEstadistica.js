class EliminarInformeEstadistica {
    constructor(informeRepository) {
        this.informeRepository = informeRepository;
    }

    async execute(id) {
        const existing = await this.informeRepository.findById(id);
        if (!existing || existing.estado !== 'activo') {
            throw new Error('Informe no encontrado o ya estaba eliminado.');
        }

        return await this.informeRepository.delete(id);
    }
}

module.exports = EliminarInformeEstadistica;
