/**
 * Interface for Cliente Repository.
 */
class IClienteRepository {
    // CRUD
    async save(cliente, dispositivoData) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findAll(incluirEliminados) { throw new Error('Method not implemented'); }
    async update(cliente) { throw new Error('Method not implemented'); }
    async delete(id) { throw new Error('Method not implemented'); }
    async updateProfilePicture(id, filename) { throw new Error('Method not implemented'); }

    // Queries
    async findByEmail(email) { throw new Error('Method not implemented'); }
    async findByCedula(cedula) { throw new Error('Method not implemented'); }
    async findByPhoneNumber(numero) { throw new Error('Method not implemented'); }

    // Auth & Devices
    async findByDeviceToken(deviceId) { throw new Error('Method not implemented'); }
    async registerOrUpdateDevice(clienteId, deviceData) { throw new Error('Method not implemented'); }

    // Stats
    async getStats(id) { throw new Error('Method not implemented'); }
}

module.exports = IClienteRepository;
