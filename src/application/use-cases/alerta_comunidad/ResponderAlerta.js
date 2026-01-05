class ResponderAlerta {
    constructor(alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    async execute(id, { idUsuarioSql, nombre, respuesta, ubicacion }) {
        const nuevaRespuesta = {
            idUsuarioSql,
            nombre,
            respuesta,
            ubicacion,
            fecha: new Date()
        };

        const updatePayload = {
            $push: { respuestas: nuevaRespuesta }
        };

        const updatedAlerta = await this.alertaRepository.update(id, updatePayload);

        // Return both the updated alert and the specific response object for socket emission
        return { alerta: updatedAlerta, respuestaAgregada: nuevaRespuesta };
    }
}

module.exports = ResponderAlerta;
