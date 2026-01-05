class ObtenerInformeEstadistica {
    constructor(informeRepository) {
        this.informeRepository = informeRepository;
    }

    async execute(id) {
        const informe = await this.informeRepository.findById(id);
        if (!informe || informe.estado !== 'activo') {
            return null;
        }
        return informe;
    }
}

module.exports = ObtenerInformeEstadistica;
