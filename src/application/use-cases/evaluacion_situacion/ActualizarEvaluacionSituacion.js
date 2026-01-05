class ActualizarEvaluacionSituacion {
    constructor(evaluacionRepository) {
        this.evaluacionRepository = evaluacionRepository;
    }

    async execute(id, data) {
        const existing = await this.evaluacionRepository.findById(id);
        if (!existing || existing.estado !== 'activo') {
            throw new Error('Evaluación no encontrada o inactiva para actualizar.');
        }

        return await this.evaluacionRepository.update(id, data);
    }
}

module.exports = ActualizarEvaluacionSituacion;
