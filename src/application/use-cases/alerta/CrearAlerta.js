const Alerta = require('../../../domain/entities/Alerta');

class CrearAlerta {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(data) {
        const { clienteId, ubicacionesClienteId, estado } = data;

        if (!clienteId || !ubicacionesClienteId) {
            throw new Error('Los campos clienteId y ubicacionesClienteId son requeridos.');
        }

        // Ideally we should verify existence here via a ClienteRepository, 
        // but for now we rely on the Repository to throw or validate.
        // I will add a validation method to the repo to maintain the 404 behavior.

        const exists = await this.alertaRepository.validateDependencies(clienteId, ubicacionesClienteId);
        if (!exists.cliente) throw new Error('Cliente no encontrado o inactivo.');
        if (!exists.ubicacion) throw new Error('Ubicación no encontrada o inactiva.');

        const nuevaAlerta = new Alerta({
            clienteId,
            ubicacionesClienteId,
            estado
        });

        return await this.alertaRepository.save(nuevaAlerta);
    }
}
module.exports = CrearAlerta;
