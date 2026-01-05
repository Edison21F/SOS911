const SecurityService = require('../../../infrastructure/adapters/secondary/security/SecurityService');
const securityService = new SecurityService();

class LoginCliente {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(correo, contrasena, dispositivoData) {
        if (!correo || !contrasena) throw new Error('Correo y contraseña son requeridos.');

        const cliente = await this.clienteRepository.findByEmail(correo);
        if (!cliente) throw new Error('Credenciales incorrectas or cliente inactivo.');

        // Verify password
        const decryptedPass = securityService.decrypt(cliente.contrasena_hash);
        if (decryptedPass !== contrasena) {
            throw new Error('Credenciales incorrectas.');
        }

        // Handle Device
        if (dispositivoData && dispositivoData.deviceId) {
            await this.clienteRepository.registerOrUpdateDevice(cliente.id, dispositivoData);
        }

        return cliente;
    }
}
module.exports = LoginCliente;
