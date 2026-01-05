class ActualizarInformeEstadistica {
    constructor(informeRepository) {
        this.informeRepository = informeRepository;
    }

    async execute(id, data) {
        const existing = await this.informeRepository.findById(id);
        if (!existing || existing.estado !== 'activo') {
            throw new Error('Informe no encontrado o inactivo para actualizar.');
        }

        return await this.informeRepository.update(id, data);
    }
}

module.exports = ActualizarInformeEstadistica;
