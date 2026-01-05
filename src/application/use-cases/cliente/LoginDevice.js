class LoginDevice {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(deviceId) {
        if (!deviceId) throw new Error('deviceId es requerido.');

        const cliente = await this.clienteRepository.findByDeviceToken(deviceId);
        if (!cliente) throw new Error('Dispositivo no autorizado o inactivo.');

        return cliente;
    }
}
module.exports = LoginDevice;
