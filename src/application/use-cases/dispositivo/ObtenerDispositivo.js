class ObtenerDispositivo {
    constructor(dispositivoRepository) {
        this.dispositivoRepository = dispositivoRepository;
    }

    async execute(id) {
        const dispositivo = await this.dispositivoRepository.findById(id);
        if (!dispositivo) return null;
        return dispositivo;
    }
}

module.exports = ObtenerDispositivo;
