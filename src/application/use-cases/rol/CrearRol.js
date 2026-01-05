class CrearRol {
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }

    async execute(datos) {
        if (!datos.nombre) {
            throw new Error('El campo "nombre" es obligatorio para crear un rol.');
        }

        const existing = await this.rolRepository.findByName(datos.nombre);
        if (existing) {
            throw new Error('El nombre de rol ya está registrado.');
        }

        return await this.rolRepository.save(datos);
    }
}

module.exports = CrearRol;
