const IAlertaComunidadRepository = require('../../../../domain/repositories/IAlertaComunidadRepository');

const AlertaComunidad = require('../../../../domain/entities/AlertaComunidad');

const AlertaModel = require('../../../../domain/models/alertas.model');

class MongoAlertaComunidadRepository extends IAlertaComunidadRepository {
    constructor() {
        super();
    }

    _toDomain(doc) {
        if (!doc) return null;
        return new AlertaComunidad({
            id: doc._id.toString(),
            idUsuarioSql: doc.idUsuarioSql,
            tipo: doc.tipo,
            prioridad: doc.prioridad,
            estado: doc.estado,
            emitida_offline: doc.emitida_offline,
            respuestas: doc.respuestas,
            location: doc.location,
            ubicacion: doc.ubicacion,
            detalles: doc.detalles,
            contactos_notificados: doc.contactos_notificados,
            fecha_creacion: doc.fecha_creacion,
            fecha_cierre: doc.fecha_cierre,
            historial_estados: doc.historial_estados
        });
    }

    async save(alertaData) {
        // Handle creation via Mongoose
        // alertaData structure matches what Mongoose expects, except for 'id' which Mongo generates
        const nuevaAlerta = new AlertaModel(alertaData);
        const saved = await nuevaAlerta.save();
        return this._toDomain(saved);
    }

    async findById(id) {
        const doc = await AlertaModel.findById(id);
        return this._toDomain(doc);
    }

    async update(id, data) {
        // Mongoose update logic
        // We can use findById, modify, and save to trigger Mongoose middleware if necessary,
        // or findByIdAndUpdate for efficiency. The controller logic was specific (push to history, etc.)
        // Ideally, domain logic should handle state transitions, but here repositories persist state.
        // We will accept a partial object 'data' to update fields.

        // However, the controller did specific complex updates (pushing history).
        // The simple generic 'update' might be too simple.
        // Let's implement a generic update that takes an object of fields to set.
        // Special array operations (push) strictly speaking belong to specific methods or prepared data.
        // For Hexagonal, the Use Case prepares the data. If the use case prepares the 'historial_estados' array (full new array or push operation), it's complex with Mongoose's $push.
        // Simplest approach: Use Case fetches entity, modifies it, and passes FULL updated object or specific fields to save.
        // OR: Repository exposes "update" that takes a simple $set object. Use Case handles logic.

        // Wait, Mongoose findByIdAndUpdate works well for $set. For array pushes like 'respuestas' or 'historial', standard is specialized methods or retrieving/saving.
        // I will stick to retrieving via Mongoose model inside 'save' if id exists? No, standard is explicit 'update'.
        // I'll assume 'data' contains keys that map to Mongoose update operators or direct fields.
        // Limitation: If Use Case passes { historial_estados: [...] } it will replace the array unless we use $push.
        // To be safe and compatible with the previous controller logic which did manual updates:

        // Implementation:
        // The Use Case will retrieve the entity, modify it, and pass the specific fields to update.
        // OR simpler: Repository helps with specific updates if needed.
        // I will implement a flexible update that accepts a Mongoose-like update object or flattened fields.
        // ACTUALLY, checking previous implementations, I often did 'findByPk' update 'fields' save.

        // Let's try to be consistent with Mongoose usage.

        const doc = await AlertaModel.findByIdAndUpdate(id, data, { new: true });
        return this._toDomain(doc);
    }

    // Specifically for adding an item to an array field (history, responses) implementation helper?
    // Not strictly needed if we just do: doc = find, doc.field.push(), doc.save().
    // But 'save' in this repo creates new.
    // I'll add a 'saveExisting' or just let 'save' handle it?
    // Actually, persistence in Hexagonal usually implies `save(entity)`.
    // If I pass a domain entity to `save`, I should update it.
    // But existing `save` is tied to `create`.

    // Let's refine `save` to upsert or separate `create` and `update`.
    // I created `save` (create) and `update` (partial).
    // I'll keep `update` handling specific object updates.

    // Special method for adding response/history? 
    // No, I'll let Use Case define the update payload, potentially using $push if I allow it, 
    // or typically I just fetch, modify in memory, and save back if I had a full ODM mapper.
    // Given the hybrid nature, I will allow 'update' to take direct Mongoose update objects if needed, 
    // OR just simple fields.
    // The previous controller used: alerta.estado = x; alerta.save();
    // So finding and saving the Mongoose document is fine.

    async saveDocument(mongooseDoc) {
        const saved = await mongooseDoc.save();
        return this._toDomain(saved);
    }

    async findByUsuario(idUsuarioSql) {
        const docs = await AlertaModel.find({
            idUsuarioSql: idUsuarioSql,
            fecha_cierre: { $exists: false } // Active alerts
        });
        return docs.map(d => this._toDomain(d));
    }

    async findHistoryByUsuario(idUsuarioSql) {
        const docs = await AlertaModel.find({
            idUsuarioSql: idUsuarioSql
        }).sort({ fecha_creacion: -1 });
        return docs.map(d => this._toDomain(d));
    }

    async findNearby(lat, lng, maxDistance = 5000) {
        const docs = await AlertaModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: maxDistance
                }
            },
            estado: { $in: ['CREADA', 'NOTIFICADA', 'ATENDIDA'] }
        });
        return docs.map(d => this._toDomain(d));
    }

    async findRecentExcludingUser(idUsuarioSql, limit = 20) {
        const docs = await AlertaModel.find({
            idUsuarioSql: { $ne: idUsuarioSql }
        })
            .sort({ fecha_creacion: -1 })
            .limit(limit);
        return docs.map(d => this._toDomain(d));
    }
}

module.exports = MongoAlertaComunidadRepository;
