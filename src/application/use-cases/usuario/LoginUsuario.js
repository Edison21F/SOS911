const SecurityService = require('../../../infrastructure/adapters/secondary/security/SecurityService');

/**
 * Use Case: Login Usuario
 * Orchestrates user authentication.
 */
class LoginUsuario {
    /**
     * @param {IUsuarioRepository} usuarioRepository 
     */
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        // Ideally SecurityService should be injected too, but for parity we might use logic inside entity or service
        this.securityService = new SecurityService();
    }

    /**
     * Execute login logic.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} User data and message
     */
    async execute(email, password) {
        // 1. Find user by Email
        const user = await this.usuarioRepository.findByEmail(email);

        if (!user) {
            throw new Error('Correo o contraseña incorrectos.');
        }

        // 2. Verify Password (Legacy: Decrypt hash and compare)
        // In the legacy code: const contrasena_descifrada = descifrarDato(user.contrasena_hash);
        // My User Entity has 'contrasena' which maps to 'contrasena_hash' in DB.

        const storedAuthData = user.contrasena; // This is the encrypted string from DB
        const decryptedPassword = this.securityService.decrypt(storedAuthData);

        if (password !== decryptedPassword) {
            throw new Error('Correo o contraseña incorrectos.');
        }

        // 3. Return success data
        if (!user.isActive()) {
            // Implicit check in legacy was "WHERE estado = 'activo'"
            // But my findByEmail might return inactive ones if I didn't filter in repo.
            // Let's assume repo should filter or we filter here.
            // Legacy repo code: "SELECT * FROM usuarios" then find. 
            // Legacy login: "SELECT * FROM usuarios WHERE estado = 'activo'"
            throw new Error('Usuario inactivo o no encontrado.');
        }

        return user;
    }
}

module.exports = LoginUsuario;
