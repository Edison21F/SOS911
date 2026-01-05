const ContactoEmergencia = require('../../../domain/entities/ContactoEmergencia');

class ResponderVinculacionContacto {
    constructor(contactoEmergenciaRepository, clienteRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
        this.clienteRepository = clienteRepository;
    }

    async execute(id, respuesta) {
        // id is the ContactoEmergencia ID (the request)
        const nuevoEstado = respuesta === 'ACEPTAR' ? 'VINCULADO' : 'RECHAZADO';

        const solicitud = await this.contactoEmergenciaRepository.findById(id);
        if (!solicitud) throw new Error('Solicitud no encontrada.');

        const requesterId = solicitud.clienteId;
        const accepterId = solicitud.idUsuarioContactoSql;

        // Update status
        solicitud.estado = nuevoEstado;
        await this.contactoEmergenciaRepository.update(solicitud);

        if (respuesta === 'ACEPTAR') {
            // Create inverse link
            const existingInverse = await this.contactoEmergenciaRepository.findInverseVinculation(accepterId, requesterId);

            if (!existingInverse) {
                const requester = await this.clienteRepository.findById(requesterId);
                const requesterName = requester ? requester.nombre : 'Usuario';
                const requesterPhone = await this.clienteRepository.findPhoneByClienteId(requesterId);

                const inverseContact = new ContactoEmergencia({
                    clienteId: accepterId,
                    idUsuarioContactoSql: requesterId,
                    nombre: requesterName,
                    telefono: requesterPhone,
                    descripcion: 'Contacto vinculado',
                    estado: 'VINCULADO'
                });

                await this.contactoEmergenciaRepository.save(inverseContact);
            }
        }

        return nuevoEstado;
    }
}
module.exports = ResponderVinculacionContacto;
