class CrearGrupo {
    constructor(grupoRepository, clienteGrupoRepository) {
        this.grupoRepository = grupoRepository;
        this.clienteGrupoRepository = clienteGrupoRepository;
    }

    async execute(datos) {
        if (!datos.clienteId || !datos.nombre) {
            throw new Error('Campos obligatorios faltantes para crear grupo.');
        }

        // Generate Access Code
        // Logic from original controller: 6 digit random number
        let codigo;
        let exists = true;
        while (exists) {
            codigo = Math.floor(100000 + Math.random() * 900000).toString();
            exists = await this.grupoRepository.findByCodigo(codigo);
        }
        datos.codigo_acceso = codigo;

        // Save Group
        const nuevoGrupo = await this.grupoRepository.save(datos);

        // Add creator as member automatically
        if (this.clienteGrupoRepository) {
            await this.clienteGrupoRepository.save({
                clienteId: datos.clienteId,
                grupoId: nuevoGrupo.id,
                estado: 'activo'
            });
        }

        return nuevoGrupo;
    }
}

module.exports = CrearGrupo;
