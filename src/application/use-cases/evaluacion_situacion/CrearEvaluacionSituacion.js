class CrearEvaluacionSituacion {
    constructor(evaluacionRepository, notificacionRepository) {
        this.evaluacionRepository = evaluacionRepository;
        this.notificacionRepository = notificacionRepository;
    }

    async execute(data) {
        if (!data.notificacioneId || !data.evaluacion) {
            throw new Error('Los campos notificacioneId y evaluacion son requeridos.');
        }

        const notificacion = await this.notificacionRepository.findById(data.notificacioneId);
        if (!notificacion) {
            throw new Error('Notificación no encontrada o eliminada.');
        }

        const nuevaEvaluacion = await this.evaluacionRepository.save(data);

        // Side effect: Increment response counter
        await this.notificacionRepository.incrementRespuesta(data.notificacioneId);

        return nuevaEvaluacion;
    }
}

module.exports = CrearEvaluacionSituacion;
