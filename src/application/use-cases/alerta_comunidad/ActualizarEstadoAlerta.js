class ActualizarEstadoAlerta {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(id, { estado, comentario, ubicacion }) {
        // Since we need to push to history, we'll construct the update object manually
        // or retrieve, modify, save logic if the repository supported strict domain save.
        // Using the flexible 'update' with Mongoose operators:

        const updatePayload = {
            $set: { estado: estado },
            $push: {
                historial_estados: {
                    estado: estado,
                    comentario: comentario || 'Actualización de estado',
                    fecha: new Date()
                }
            }
        };

        if (ubicacion) {
            updatePayload.$set.ubicacion = ubicacion;
            updatePayload.$set.location = {
                type: 'Point',
                coordinates: [ubicacion.longitud, ubicacion.latitud]
            };
        }

        if (estado === 'CERRADA' || estado === 'CANCELADA') {
            updatePayload.$set.fecha_cierre = new Date();
        }

        return await this.alertaRepository.update(id, updatePayload);
    }
}

module.exports = ActualizarEstadoAlerta;
