const ContactoEmergencia = require('../../../domain/entities/ContactoEmergencia');

class SolicitarVinculacionContacto {
    constructor(contactoEmergenciaRepository, clienteRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
        this.clienteRepository = clienteRepository;
    }

    async execute(clienteId, criterio, io) {
        if (!clienteId || !criterio) {
            throw new Error('ClienteId y criterio de búsqueda son requeridos.');
        }

        let usuarioDestino = await this.clienteRepository.findByCedula(criterio);
        let telefonoDestino = 'Sin número registrado';

        if (usuarioDestino) {
            telefonoDestino = await this.clienteRepository.findPhoneByClienteId(usuarioDestino.id);
        } else {
            // Try by phone
            usuarioDestino = await this.clienteRepository.findByPhoneNumber(criterio);
            if (usuarioDestino) {
                telefonoDestino = criterio; // The criteria was the phone
            }
        }

        if (!usuarioDestino) {
            throw new Error('Usuario no encontrado con esa cédula o teléfono.');
        }

        if (usuarioDestino.id == clienteId) {
            throw new Error('No puedes agregarte a ti mismo.');
        }

        const existingLink = await this.contactoEmergenciaRepository.findExistingVinculation(clienteId, usuarioDestino.id);
        if (existingLink) {
            const error = new Error('Ya existe una solicitud o vínculo con este usuario.');
            error.estado = existingLink.estado;
            throw error;
        }

        const nuevoContacto = new ContactoEmergencia({
            clienteId,
            idUsuarioContactoSql: usuarioDestino.id,
            nombre: usuarioDestino.nombre,
            descripcion: 'Solicitud Pendiente',
            telefono: telefonoDestino,
            estado: 'PENDIENTE'
        });

        const created = await this.contactoEmergenciaRepository.save(nuevoContacto);

        // Socket logic (Infra concern leaking slightly into UseCase, but acceptable if io is passed as dependency or abstracted)
        // For now we assume controller passes 'io'
        if (io) {
            io.to(`user_${usuarioDestino.id}`).emit('contact:request', {
                fromId: clienteId,
                mensaje: `El usuario quiere agregarte como contacto de emergencia.`
            });
        }

        return created;
    }
}
module.exports = SolicitarVinculacionContacto;
