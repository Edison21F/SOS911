const Cliente = require('../../../domain/entities/Cliente');

class CrearCliente {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(data) {
        const { nombre, correo_electronico, cedula_identidad, contrasena, fecha_nacimiento, direccion, deviceId, tipo_dispositivo, modelo_dispositivo } = data;

        if (!nombre || !correo_electronico || !cedula_identidad || !contrasena || !direccion) {
            throw new Error('Todos los campos obligatorios son requeridos (nombre, correo_electronico, cedula_identidad, contrasena, direccion).');
        }

        // Uniqueness checks
        const existingEmail = await this.clienteRepository.findByEmail(correo_electronico);
        if (existingEmail) throw new Error('El correo electrónico ya está registrado.');

        const existingCedula = await this.clienteRepository.findByCedula(cedula_identidad);
        if (existingCedula) throw new Error('La cédula de identidad ya está registrada.');

        const nuevoCliente = new Cliente({
            nombre,
            correo_electronico,
            cedula_identidad,
            contrasena_hash: contrasena, // Passed to Repo for Encryption
            direccion,
            fecha_nacimiento,
            estado: 'activo'
        });

        const dispositivoData = { deviceId, tipo_dispositivo, modelo_dispositivo };

        return await this.clienteRepository.save(nuevoCliente, dispositivoData);
    }
}
module.exports = CrearCliente;
