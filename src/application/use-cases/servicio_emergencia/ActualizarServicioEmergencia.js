class ActualizarServicioEmergencia {
    constructor(servicioEmergenciaRepository) {
        this.servicioEmergenciaRepository = servicioEmergenciaRepository;
    }

    async execute(id, datos) {
        const servicio = await this.servicioEmergenciaRepository.findById(id);
        if (!servicio || servicio.estado !== 'activo') {
            throw new Error('Servicio no encontrado o eliminado para actualizar.');
        }

        if (datos.nombre) {
            // Check duplicates excluding current ID
            // Using logic: if user changes, check new user, else check existing user
            const targetUser = datos.usuarioId || servicio.usuarioId;
            const exists = await this.servicioEmergenciaRepository.findByNameAndUser(datos.nombre, targetUser, id);
            if (exists) {
                throw new Error('Ya tienes un servicio con ese nombre registrado para este usuario.|409');
            }
        }

        return await this.servicioEmergenciaRepository.update(id, datos);
    }
}

module.exports = ActualizarServicioEmergencia;
