class CrearDispositivo {
    constructor(dispositivoRepository) {
        this.dispositivoRepository = dispositivoRepository;
    }

    async execute(datos) {
        if (!datos.clienteId || !datos.token_dispositivo || !datos.tipo_dispositivo || !datos.modelo_dispositivo) {
            throw new Error('Todos los campos obligatorios son requeridos (clienteId, token_dispositivo, tipo_dispositivo, modelo_dispositivo).');
        }

        // Check if device already exists
        const existing = await this.dispositivoRepository.findByToken(datos.clienteId, datos.token_dispositivo);
        if (existing) {
            throw new Error('El dispositivo ya está registrado para este cliente.');
        }

        return await this.dispositivoRepository.save(datos);
    }
}

module.exports = CrearDispositivo;
