const IContenidoAppRepository = require('../../../../../domain/repositories/IContenidoAppRepository');
const ContenidoApp = require('../../../../../domain/entities/ContenidoApp');
const orm = require('../../../database/connection/dataBase.orm');
const sql = require('../../../database/connection/dataBase.sql');
const mongo = require('../../../database/connection/dataBase.mongo');

class MysqlMongoContenidoAppRepository extends IContenidoAppRepository {
    constructor() {
        super();
    }

    _formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    async findActive() {
        const [rows] = await sql.promise().query("SELECT * FROM contenido_apps WHERE estado = 'activo' LIMIT 1");
        if (rows.length === 0) return null;

        const contenidoSql = rows[0];
        const contenidoMongo = await mongo.ContenidoApp.findOne({ idContenidoAppSql: String(contenidoSql.id) });

        // Even if mongo is missing, we might return partial, but ideally we sync logic in Use Case
        // Here we just map what we have
        return new ContenidoApp({
            id: contenidoSql.id,
            gradientStart: contenidoSql.gradientStart,
            gradientEnd: contenidoSql.gradientEnd,
            fontFamily: contenidoSql.fontFamily,
            mainTitle: contenidoSql.mainTitle,
            estado: contenidoSql.estado,
            fecha_creacion: contenidoSql.fecha_creacion,
            fecha_modificacion: contenidoSql.fecha_modificacion,

            howItWorksKey: contenidoMongo?.howItWorksKey,
            howItWorksTitle: contenidoMongo?.howItWorksTitle,
            howItWorksContent: contenidoMongo?.howItWorksContent,
            missionKey: contenidoMongo?.missionKey,
            missionTitle: contenidoMongo?.missionTitle,
            missionContent: contenidoMongo?.missionContent,
            visionKey: contenidoMongo?.visionKey,
            visionTitle: contenidoMongo?.visionTitle,
            visionContent: contenidoMongo?.visionContent,
            logoApp: contenidoMongo?.logoApp,
        });
    }

    async save(data) {
        const formattedDate = this._formatDate(new Date());

        // Create SQL
        const nuevoContenidoSQL = await orm.contenido_app.create({
            gradientStart: data.gradientStart || '#026b6b',
            gradientEnd: data.gradientEnd || '#2D353C',
            fontFamily: data.fontFamily || 'Open Sans',
            mainTitle: data.mainTitle || 'Un toque para tu seguridad',
            estado: data.estado || 'activo',
            fecha_creacion: formattedDate
        });

        // Create Mongo
        await mongo.ContenidoApp.create({
            idContenidoAppSql: String(nuevoContenidoSQL.id),
            howItWorksKey: data.howItWorksKey || 'howItWorks',
            howItWorksTitle: data.howItWorksTitle || '¿Cómo funciona?',
            howItWorksContent: data.howItWorksContent || 'Contenido por defecto de cómo funciona.',
            missionKey: data.missionKey || 'mission',
            missionTitle: data.missionTitle || 'Misión',
            missionContent: data.missionContent || 'Contenido por defecto de misión.',
            visionKey: data.visionKey || 'vision',
            visionTitle: data.visionTitle || 'Visión',
            visionContent: data.visionContent || 'Contenido por defecto de visión.',
            logoApp: data.logoApp || 'https://placehold.co/150x50/cccccc/ffffff?text=LogoApp',
            estado: data.estado || 'activo',
            fecha_creacion: formattedDate
        });

        return await this.findById(nuevoContenidoSQL.id); // Helper needed
    }

    // Helper to find by specific ID, active or inactive
    async findById(id) {
        const [rows] = await sql.promise().query("SELECT * FROM contenido_apps WHERE id = ?", [id]);
        if (rows.length === 0) return null;
        const contenidoSql = rows[0];
        const contenidoMongo = await mongo.ContenidoApp.findOne({ idContenidoAppSql: String(contenidoSql.id) });

        return new ContenidoApp({
            id: contenidoSql.id,
            gradientStart: contenidoSql.gradientStart,
            gradientEnd: contenidoSql.gradientEnd,
            fontFamily: contenidoSql.fontFamily,
            mainTitle: contenidoSql.mainTitle,
            estado: contenidoSql.estado,
            fecha_creacion: contenidoSql.fecha_creacion,
            fecha_modificacion: contenidoSql.fecha_modificacion,

            howItWorksKey: contenidoMongo?.howItWorksKey,
            howItWorksTitle: contenidoMongo?.howItWorksTitle,
            howItWorksContent: contenidoMongo?.howItWorksContent,
            missionKey: contenidoMongo?.missionKey,
            missionTitle: contenidoMongo?.missionTitle,
            missionContent: contenidoMongo?.missionContent,
            visionKey: contenidoMongo?.visionKey,
            visionTitle: contenidoMongo?.visionTitle,
            visionContent: contenidoMongo?.visionContent,
            logoApp: contenidoMongo?.logoApp,
        });
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());

        // SQL Update
        const camposSql = [];
        const valoresSql = [];
        if (data.gradientStart !== undefined) { camposSql.push('gradientStart = ?'); valoresSql.push(data.gradientStart); }
        if (data.gradientEnd !== undefined) { camposSql.push('gradientEnd = ?'); valoresSql.push(data.gradientEnd); }
        if (data.fontFamily !== undefined) { camposSql.push('fontFamily = ?'); valoresSql.push(data.fontFamily); }
        if (data.mainTitle !== undefined) { camposSql.push('mainTitle = ?'); valoresSql.push(data.mainTitle); }
        if (data.estado !== undefined) { camposSql.push('estado = ?'); valoresSql.push(data.estado); }

        if (camposSql.length > 0) {
            camposSql.push('fecha_modificacion = ?');
            valoresSql.push(formattedDate);
            valoresSql.push(id);
            await sql.promise().query(
                `UPDATE contenido_apps SET ${camposSql.join(', ')} WHERE id = ?`,
                valoresSql
            );
        }

        // Mongo Update
        const updateDataMongo = {};
        if (data.howItWorksKey !== undefined) updateDataMongo.howItWorksKey = data.howItWorksKey;
        if (data.howItWorksTitle !== undefined) updateDataMongo.howItWorksTitle = data.howItWorksTitle;
        if (data.howItWorksContent !== undefined) updateDataMongo.howItWorksContent = data.howItWorksContent;
        if (data.missionKey !== undefined) updateDataMongo.missionKey = data.missionKey;
        if (data.missionTitle !== undefined) updateDataMongo.missionTitle = data.missionTitle;
        if (data.missionContent !== undefined) updateDataMongo.missionContent = data.missionContent;
        if (data.visionKey !== undefined) updateDataMongo.visionKey = data.visionKey;
        if (data.visionTitle !== undefined) updateDataMongo.visionTitle = data.visionTitle;
        if (data.visionContent !== undefined) updateDataMongo.visionContent = data.visionContent;
        if (data.logoApp !== undefined) updateDataMongo.logoApp = data.logoApp;
        if (data.estado !== undefined) updateDataMongo.estado = data.estado;

        updateDataMongo.fecha_modificacion = formattedDate;

        if (Object.keys(updateDataMongo).length > 1) { // 1 because fecha_modificacion is always there
            await mongo.ContenidoApp.findOneAndUpdate(
                { idContenidoAppSql: String(id) },
                { $set: updateDataMongo },
                { upsert: true, new: true, setDefaultsOnInsert: true } // Upsert per controller logic
            );
        }

        return await this.findById(id);
    }

    async changeStatus(id, estado) {
        return await this.update(id, { estado });
    }

    // Needed for Use Case to ensure default mongo exists if sql exists but mongo missing
    async ensureMongoExists(id, data = {}) {
        const existing = await mongo.ContenidoApp.findOne({ idContenidoAppSql: String(id) });
        if (!existing) {
            const formattedDate = this._formatDate(new Date());
            await mongo.ContenidoApp.create({
                idContenidoAppSql: String(id),
                howItWorksKey: data.howItWorksKey || 'howItWorks',
                howItWorksTitle: data.howItWorksTitle || '¿Cómo funciona?',
                howItWorksContent: data.howItWorksContent || 'Contenido por defecto de cómo funciona.',
                missionKey: data.missionKey || 'mission',
                missionTitle: data.missionTitle || 'Misión',
                missionContent: data.missionContent || 'Contenido por defecto de misión.',
                visionKey: data.visionKey || 'vision',
                visionTitle: data.visionTitle || 'Visión',
                visionContent: data.visionContent || 'Contenido por defecto de visión.',
                logoApp: data.logoApp || 'https://placehold.co/150x50/cccccc/ffffff?text=LogoApp',
                estado: 'activo',
                fecha_creacion: formattedDate
            });
            return true;
        }
        return false;
    }
}

module.exports = MysqlMongoContenidoAppRepository;
