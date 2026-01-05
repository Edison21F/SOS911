class EvaluacionSituacion {
    constructor({
        id,
        notificacioneId,
        evaluacion,
        detalle,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Joined Info
        notificacion_info,
        presion_info,
        cliente_info
    }) {
        this.id = id;
        this.notificacioneId = notificacioneId;
        this.evaluacion = evaluacion;
        this.detalle = detalle;
        this.estado = estado;
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.notificacion_info = notificacion_info;
        this.presion_info = presion_info;
        this.cliente_info = cliente_info;
    }
}

module.exports = EvaluacionSituacion;
