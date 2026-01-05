class ListarEvaluacionesSituaciones {
    constructor(evaluacionRepository) {
        this.evaluacionRepository = evaluacionRepository;
    }

    async execute(incluirEliminados = false) {
        return await this.evaluacionRepository.findAll(incluirEliminados);
    }
}

module.exports = ListarEvaluacionesSituaciones;
