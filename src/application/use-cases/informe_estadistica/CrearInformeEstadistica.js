class CrearInformeEstadistica {
    constructor(informeRepository) {
        this.informeRepository = informeRepository;
    }

    async execute(data) {
        // Validation handled in Controller currently, but could be here
        // Basic repo validation:
        if (!data.presionesBotonPanicoId) {
            throw new Error('El campo presionesBotonPanicoId es requerido.');
        }

        // Logic to check if presionesBotonPanicoId exists is often done here by injecting 
        // PresionBotonPanicoRepository, but existing logic used direct SQL query.
        // We will assume valid ID or let DB/client constraints handle it for now to avoid circular deps
        // or add a check if we inject the repo later.

        return await this.informeRepository.save(data);
    }
}

module.exports = CrearInformeEstadistica;
