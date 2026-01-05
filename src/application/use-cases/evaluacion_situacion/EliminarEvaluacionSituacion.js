class EliminarEvaluacionSituacion {
    constructor(evaluacionRepository) {
        this.evaluacionRepository = evaluacionRepository;
    }

    async execute(id) {
        const existing = await this.evaluacionRepository.findById(id);
        if (!existing || existing.estado !== 'activo') { // Assuming standard logic checks active
            throw new Error('Evaluación no encontrada o ya estaba eliminada.');
        }

        return await this.evaluacionRepository.delete(id);
    }
}

module.exports = EliminarEvaluacionSituacion;
