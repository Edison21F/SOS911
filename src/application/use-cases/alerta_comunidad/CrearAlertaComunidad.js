class CrearAlertaComunidad {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(data) {
        // Data prep
        const fecha_creacion = data.fecha_creacion || new Date();
        const emitida_offline = data.emitida_offline || false;

        const nuevaAlertaData = {
            idUsuarioSql: data.idUsuarioSql,
            tipo: data.tipo,
            prioridad: data.prioridad,
            ubicacion: data.ubicacion,
            location: {
                type: 'Point',
                coordinates: [data.ubicacion.longitud, data.ubicacion.latitud]
            },
            detalles: data.detalles,
            emitida_offline: emitida_offline,
            fecha_creacion: fecha_creacion,
            estado: 'CREADA',
            historial_estados: [{
                estado: 'CREADA',
                comentario: emitida_offline ? 'Sincronización alerta offline' : 'Inicio de emergencia',
                fecha: fecha_creacion
            }]
        };

        return await this.alertaRepository.save(nuevaAlertaData);
    }
}

module.exports = CrearAlertaComunidad;
