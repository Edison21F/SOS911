class ObtenerEvaluacionSituacion {
    constructor(evaluacionRepository) {
        this.evaluacionRepository = evaluacionRepository;
    }

    async execute(id) {
        const evaluacion = await this.evaluacionRepository.findById(id);
        if (!evaluacion || evaluacion.estado !== 'activo') {
            return null; // Controller expects 404/null logic
        }
        return evaluacion;
    }
}

module.exports = ObtenerEvaluacionSituacion;
