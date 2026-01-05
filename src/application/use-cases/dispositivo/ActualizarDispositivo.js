class ActualizarDispositivo {
    constructor(dispositivoRepository) {
        this.dispositivoRepository = dispositivoRepository;
    }

    async execute(id, datos) {
        if (!datos.token_dispositivo && !datos.tipo_dispositivo && !datos.modelo_dispositivo && !datos.estado) {
            throw new Error('No se proporcionaron campos para actualizar.');
        }

        const dispositivoActualizado = await this.dispositivoRepository.update(id, datos);
        if (!dispositivoActualizado) {
            throw new Error('Dispositivo no encontrado o inactivo para actualizar.');
        }
        return dispositivoActualizado;
    }
}

module.exports = ActualizarDispositivo;
