class SyncOfflineAlertas {
    constructor(crearAlertaUseCase) {
        this.crearAlertaUseCase = crearAlertaUseCase;
    }

    async execute(alertas) {
        const resultados = [];
        for (const alertaData of alertas) {
            try {
                // Ensure offline flag is true
                alertaData.emitida_offline = true;
                const nuevaAlerta = await this.crearAlertaUseCase.execute(alertaData);
                resultados.push({ idOriginal: alertaData.id_local, idBackend: nuevaAlerta.id, status: 'synced' });
            } catch (err) {
                console.error('[SYNC_USECASE] Error:', err);
                resultados.push({ idOriginal: alertaData.id_local, error: 'Error al guardar', status: 'failed' });
            }
        }
        return resultados;
    }
}

module.exports = SyncOfflineAlertas;
