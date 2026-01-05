class ActualizarCliente {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(id, data) {
        const cliente = await this.clienteRepository.findById(id);
        if (!cliente) throw new Error('Cliente no encontrado o eliminado para actualizar.');

        // Uniqueness checks if changing sensitive fields
        if (data.cedula_identidad && data.cedula_identidad !== cliente.cedula_identidad) {
            const exist = await this.clienteRepository.findByCedula(data.cedula_identidad);
            if (exist && exist.id !== id) throw new Error('La nueva cédula de identidad ya está registrada por otro cliente.');
            cliente.cedula_identidad = data.cedula_identidad;
        }

        if (data.correo_electronico && data.correo_electronico !== cliente.correo_electronico) {
            const exist = await this.clienteRepository.findByEmail(data.correo_electronico);
            if (exist && exist.id !== id) throw new Error('El nuevo correo electrónico ya está registrado por otro cliente.');
            cliente.correo_electronico = data.correo_electronico;
        }

        // Apply updates
        if (data.nombre) cliente.nombre = data.nombre;
        if (data.contrasena) cliente.contrasena_hash = data.contrasena;
        if (data.direccion) cliente.direccion = data.direccion;
        if (data.fecha_nacimiento) cliente.fecha_nacimiento = data.fecha_nacimiento;
        if (data.estado) cliente.estado = data.estado;
        if (data.numero_ayudas !== undefined) cliente.numero_ayudas = data.numero_ayudas;
        if (data.ficha_medica) cliente.ficha_medica = data.ficha_medica;

        return await this.clienteRepository.update(cliente);
    }
}
module.exports = ActualizarCliente;
