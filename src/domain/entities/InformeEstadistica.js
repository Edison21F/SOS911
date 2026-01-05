class InformeEstadistica {
    constructor({
        id,
        presionesBotonPanicoId,
        numero_notificaciones,
        numero_respuestas,
        evaluaciones_SOS,
        evaluaciones_911,
        evaluaciones_innecesaria,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Joined Info
        presion_info,
        cliente_info
    }) {
        this.id = id;
        this.presionesBotonPanicoId = presionesBotonPanicoId;
        this.numero_notificaciones = numero_notificaciones || 0;
        this.numero_respuestas = numero_respuestas || 0;
        this.evaluaciones_SOS = evaluaciones_SOS || 0;
        this.evaluaciones_911 = evaluaciones_911 || 0;
        this.evaluaciones_innecesaria = evaluaciones_innecesaria || 0;
        this.estado = estado;
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.presion_info = presion_info;
        this.cliente_info = cliente_info;
    }
}

module.exports = InformeEstadistica;
