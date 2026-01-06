const IPaginaRepository = require('../../../../domain/repositories/IPaginaRepository');
const Pagina = require('../../../../domain/entities/Pagina');
const orm = require('../../../../infrastructure/database/connection/dataBase.orm');
const sql = require('../../../../infrastructure/database/connection/dataBase.sql');
const mongo = require('../../../../infrastructure/database/connection/dataBase.mongo');
const SecurityService = require('../security/SecurityService');

const securityService = new SecurityService();

class MysqlMongoPaginaRepository extends IPaginaRepository {

    _formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    _mapFromHybrid(rowSQL, docMongo) {
        if (!rowSQL) return null;
        return new Pagina({
            id: rowSQL.id,
            nombrePagina: rowSQL.nombrePagina ? securityService.decrypt(rowSQL.nombrePagina) : '',
            descripcionPagina: rowSQL.descripcionPagina ? securityService.decrypt(rowSQL.descripcionPagina) : '',
            estado: rowSQL.estado,
            fecha_creacion: rowSQL.fecha_creacion,
            fecha_modificacion: rowSQL.fecha_modificacion,
            // Mongo fields
            mision: docMongo ? docMongo.mision : null,
            vision: docMongo ? docMongo.vision : null,
            logoUrl: docMongo ? docMongo.logoUrl : null,
            // Meta
            estado_mongo: docMongo ? docMongo.estado : null
        });
    }

    async save(pagina) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        // 1. Save SQL
        const dataSql = {
            nombrePagina: securityService.encrypt(pagina.nombrePagina),
            descripcionPagina: securityService.encrypt(pagina.descripcionPagina),
            estado: 'activo',
            fecha_creacion: formattedNow
        };

        const paginaGuardadaSQL = await orm.pagina.create(dataSql);
        const idPaginaSql = paginaGuardadaSQL.id;

        // 2. Save Mongo
        await mongo.ContenidoPagina.create({
            idPaginaSql: String(idPaginaSql),
            mision: pagina.mision,
            vision: pagina.vision,
            logoUrl: pagina.logoUrl,
            estado: 'activo',
            fecha_creacion: formattedNow
        });

        return this.findById(idPaginaSql);
    }

    async findById(id) {
        const [rows] = await sql.promise().query("SELECT * FROM paginas WHERE id = ? AND estado = 'activo'", [id]);
        if (rows.length === 0) return null;

        const row = rows[0];
        const docMongo = await mongo.ContenidoPagina.findOne({ idPaginaSql: String(id) });

        return this._mapFromHybrid(row, docMongo);
    }

    async findActive() {
        const [rows] = await sql.promise().query("SELECT * FROM paginas WHERE estado = 'activo' LIMIT 1");
        if (rows.length === 0) return null;

        const row = rows[0];
        const docMongo = await mongo.ContenidoPagina.findOne({ idPaginaSql: String(row.id) });

        return this._mapFromHybrid(row, docMongo);
    }

    async update(pagina) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        // 1. Update SQL
        const camposSql = ['fecha_modificacion = ?'];
        const valoresSql = [formattedNow];

        if (pagina.nombrePagina) {
            camposSql.push('nombrePagina = ?');
            valoresSql.push(securityService.encrypt(pagina.nombrePagina));
        }
        if (pagina.descripcionPagina) {
            camposSql.push('descripcionPagina = ?');
            valoresSql.push(securityService.encrypt(pagina.descripcionPagina));
        }
        if (pagina.estado) {
            camposSql.push('estado = ?');
            valoresSql.push(pagina.estado);
        }

        valoresSql.push(pagina.id);
        await sql.promise().query(`UPDATE paginas SET ${camposSql.join(', ')} WHERE id = ?`, valoresSql);

        // 2. Update Mongo
        const datosParaMongo = { fecha_modificacion: formattedNow };
        if (pagina.mision) datosParaMongo.mision = pagina.mision;
        if (pagina.vision) datosParaMongo.vision = pagina.vision;
        if (pagina.logoUrl) datosParaMongo.logoUrl = pagina.logoUrl;
        if (pagina.estado) datosParaMongo.estado = pagina.estado;

        await mongo.ContenidoPagina.findOneAndUpdate(
            { idPaginaSql: String(pagina.id) },
            { $set: datosParaMongo },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return this.findById(pagina.id);
    }

    async delete(id) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        await sql.promise().query("UPDATE paginas SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?", [formattedNow, id]);

        await mongo.ContenidoPagina.updateOne(
            { idPaginaSql: String(id) },
            { $set: { estado: 'eliminado', fecha_modificacion: formattedNow } }
        );
        return true;
    }

    async findByNombre(nombre) {
        // Full scan due to encryption
        const [rows] = await sql.promise().query("SELECT * FROM paginas WHERE estado = 'activo'");
        for (const row of rows) {
            const decodedName = row.nombrePagina ? securityService.decrypt(row.nombrePagina) : '';
            if (decodedName === nombre) {
                return this.findById(row.id);
            }
        }
        return null;
    }
}

module.exports = MysqlMongoPaginaRepository;
