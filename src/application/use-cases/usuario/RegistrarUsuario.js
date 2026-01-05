const Usuario = require('../../../domain/entities/Usuario');

/**
 * Use Case: Registrar Usuario
 * Orchestrates the creation of a new user.
 */
class RegistrarUsuario {
    /**
     * @param {IUsuarioRepository} usuarioRepository 
     */
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Execute the use case.
     * @param {Object} userData - Raw data from controller
     * @returns {Promise<Usuario>} Created user
     */
    async execute(userData) {
        const {
            nombre,
            correo_electronico,
            cedula_identidad,
            contrasena,
            fecha_nacimiento,
            direccion,
            estado
        } = userData;

        // 1. Check if user exists (Email)
        const existingEmail = await this.usuarioRepository.findByEmail(correo_electronico);
        if (existingEmail) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        // 2. Check if user exists (Cedula)
        const existingCedula = await this.usuarioRepository.findByCedula(cedula_identidad);
        if (existingCedula) {
            throw new Error('La cédula de identidad ya está registrada.');
        }

        // 3. Create Domain Entity
        const nuevoUsuario = new Usuario({
            nombre,
            correo_electronico,
            cedula_identidad,
            contrasena,
            fecha_nacimiento,
            direccion,
            estado
        });

        // 4. Save
        return await this.usuarioRepository.save(nuevoUsuario);
    }
}

module.exports = RegistrarUsuario;
