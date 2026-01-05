class CrearNumeroCliente {
    constructor(clienteNumeroRepository) {
        this.clienteNumeroRepository = clienteNumeroRepository;
    }

    async execute(datos) {
        if (!datos.nombre || !datos.numero || !datos.clienteId) {
            throw new Error('Faltan campos obligatorios: nombre, numero y clienteId.');
        }

        const exists = await this.clienteNumeroRepository.findByClientAndNumber(datos.clienteId, datos.numero);
        if (exists) {
            throw new Error('El número de cliente ya está registrado para este cliente.|409');
        }

        // Like in other modules, client existence check depends on DB foreign keys or can be injected if strictly needed.
        // Controller checked explicitly. We'll rely on Repository DB error handling.

        return await this.clienteNumeroRepository.save(datos);
    }
}

module.exports = CrearNumeroCliente;
