class EliminarDispositivo {
    constructor(dispositivoRepository) {
        this.dispositivoRepository = dispositivoRepository;
    }

    async execute(id) {
        const eliminado = await this.dispositivoRepository.delete(id);
        if (!eliminado) {
            throw new Error('Dispositivo no encontrado o ya estaba eliminado.');
        }
        return true;
    }
}

module.exports = EliminarDispositivo;
