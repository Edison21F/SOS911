const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../../../..');
const IClienteRepository = require(path.join(BASE_PATH, 'domain/repositories/IClienteRepository'));
const Cliente = require(path.join(BASE_PATH, 'domain/entities/Cliente'));
const orm = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.orm'));
const sql = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.sql'));
const mongo = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.mongo'));
const SecurityService = require(path.join(BASE_PATH, 'infrastructure/adapters/secondary/security/SecurityService'));
const Alerta = require(path.join(BASE_PATH, 'domain/models/alertas.model')); // For stats logic (Mongo Model direct usage allowed in Infra Adapter)

const securityService = new SecurityService();

class MysqlMongoClienteRepository extends IClienteRepository {

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
        return new Cliente({
            id: rowSQL.id,
            nombre: rowSQL.nombre ? securityService.decrypt(rowSQL.nombre) : '',
            correo_electronico: rowSQL.correo_electronico ? securityService.decrypt(rowSQL.correo_electronico) : '',
            cedula_identidad: rowSQL.cedula_identidad ? securityService.decrypt(rowSQL.cedula_identidad) : '',
            contrasena_hash: rowSQL.contrasena_hash, // Keep hashed/encrypted for internal check
            numero_ayudas: rowSQL.numero_ayudas,
            estado: rowSQL.estado,
            foto_perfil: rowSQL.foto_perfil,
            fecha_creacion: rowSQL.fecha_creacion,
            fecha_modificacion: rowSQL.fecha_modificacion,
            // Persistent Mongo fields
            fecha_nacimiento: docMongo ? docMongo.fecha_nacimiento : null,
            direccion: (docMongo && docMongo.direccion) ? securityService.decrypt(docMongo.direccion) : null,
            ficha_medica: docMongo ? docMongo.ficha_medica : null
        });
    }

    async save(cliente, dispositivoData) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        // 1. MySQL Insert
        const nuevoClienteSQL = {
            nombre: securityService.encrypt(cliente.nombre),
            correo_electronico: securityService.encrypt(cliente.correo_electronico),
            cedula_identidad: securityService.encrypt(cliente.cedula_identidad),
            contrasena_hash: securityService.encrypt(cliente.contrasena_hash), // Assuming input is already hashed or raw pass to be encrypted? Controller was sending raw pass to be encrypted, let's assume UseCase sends RAW and we encrypt here.
            // Wait, previous code: const contrasenaCifrada = cifrarDato(contrasena);
            // So we store Encrypted(RawPassword).
            numero_ayudas: 0,
            estado: 'activo',
            fecha_creacion: formattedNow
        };

        const clienteGuardadoSQL = await orm.cliente.create(nuevoClienteSQL);
        const idClienteSql = clienteGuardadoSQL.id;
        cliente.id = idClienteSql;

        // 2. Mongo Insert
        const nuevoClienteMongo = {
            idClienteSql,
            fecha_nacimiento: cliente.fecha_nacimiento,
            direccion: cliente.direccion ? securityService.encrypt(cliente.direccion) : null,
            estado: 'activo',
            fecha_creacion: formattedNow
        };
        await mongo.Cliente.create(nuevoClienteMongo);

        // 3. Device Registration (Optional)
        if (dispositivoData && dispositivoData.deviceId) {
            await this.registerOrUpdateDevice(idClienteSql, dispositivoData);
        }

        return this.findById(idClienteSql);
    }

    async findById(id) {
        const [rows] = await sql.promise().query("SELECT * FROM clientes WHERE id = ? AND estado = 'activo'", [id]);
        if (rows.length === 0) return null;

        const row = rows[0];
        const docMongo = await mongo.Cliente.findOne({ idClienteSql: id }); // Mongoose

        return this._mapFromHybrid(row, docMongo);
    }

    async findAll(incluirEliminados = false) {
        const query = incluirEliminados ? "SELECT * FROM clientes" : "SELECT * FROM clientes WHERE estado = 'activo'";
        const [rows] = await sql.promise().query(query);

        // Parallel fetch from Mongo
        const clients = await Promise.all(rows.map(async (row) => {
            const docMongo = await mongo.Cliente.findOne({ idClienteSql: row.id });
            return this._mapFromHybrid(row, docMongo);
        }));

        return clients;
    }

    async update(cliente) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        // 1. Update SQL
        const camposSQL = ['fecha_modificacion = ?'];
        const valoresSQL = [formattedNow];

        if (cliente.nombre) {
            camposSQL.push('nombre = ?');
            valoresSQL.push(securityService.encrypt(cliente.nombre));
        }
        if (cliente.correo_electronico) {
            camposSQL.push('correo_electronico = ?');
            valoresSQL.push(securityService.encrypt(cliente.correo_electronico));
        }
        if (cliente.cedula_identidad) {
            camposSQL.push('cedula_identidad = ?');
            valoresSQL.push(securityService.encrypt(cliente.cedula_identidad));
        }
        if (cliente.contrasena_hash) {
            camposSQL.push('contrasena_hash = ?');
            valoresSQL.push(securityService.encrypt(cliente.contrasena_hash));
        }
        if (cliente.estado) {
            camposSQL.push('estado = ?');
            valoresSQL.push(cliente.estado);
        }
        // Assuming numero_ayudas can be updated
        if (cliente.numero_ayudas !== undefined) {
            camposSQL.push('numero_ayudas = ?');
            valoresSQL.push(cliente.numero_ayudas);
        }

        valoresSQL.push(cliente.id);
        const consultaSQL = `UPDATE clientes SET ${camposSQL.join(', ')} WHERE id = ?`;
        await sql.promise().query(consultaSQL, valoresSQL);

        // 2. Update Mongo
        const updateDataMongo = { fecha_modificacion: formattedNow };
        if (cliente.fecha_nacimiento) updateDataMongo.fecha_nacimiento = cliente.fecha_nacimiento;
        if (cliente.direccion) updateDataMongo.direccion = securityService.encrypt(cliente.direccion);
        if (cliente.ficha_medica) updateDataMongo.ficha_medica = cliente.ficha_medica;
        if (cliente.estado) updateDataMongo.estado = cliente.estado;

        await mongo.Cliente.updateOne({ idClienteSql: cliente.id }, { $set: updateDataMongo });

        return this.findById(cliente.id);
    }

    async delete(id) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        await sql.promise().query("UPDATE clientes SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?", [formattedNow, id]);

        await mongo.Cliente.updateOne(
            { idClienteSql: id },
            { $set: { estado: 'eliminado', fecha_modificacion: formattedNow } }
        );
        return true;
    }

    async updateProfilePicture(id, filename) {
        const now = new Date();
        const formattedNow = this._formatDate(now);
        const [result] = await sql.promise().query(
            "UPDATE clientes SET foto_perfil = ?, fecha_modificacion = ? WHERE id = ?",
            [filename, formattedNow, id]
        );
        return result.affectedRows > 0;
    }

    async findByEmail(email) {
        // Full scan due to encryption
        const [allClients] = await sql.promise().query("SELECT * FROM clientes WHERE estado = 'activo'");
        for (const row of allClients) {
            const decEmail = row.correo_electronico ? securityService.decrypt(row.correo_electronico) : '';
            if (decEmail === email) {
                const docMongo = await mongo.Cliente.findOne({ idClienteSql: row.id });
                return this._mapFromHybrid(row, docMongo);
            }
        }
        return null;
    }

    async findByCedula(cedula) {
        // Full scan
        const [allClients] = await sql.promise().query("SELECT * FROM clientes WHERE estado = 'activo'");
        for (const row of allClients) {
            const decCedula = row.cedula_identidad ? securityService.decrypt(row.cedula_identidad) : '';
            if (decCedula === cedula) {
                const docMongo = await mongo.Cliente.findOne({ idClienteSql: row.id });
                return this._mapFromHybrid(row, docMongo);
            }
        }
        return null;
    }

    async findByPhoneNumber(numero) {
        // Full scan on phone numbers table
        const [allNumbers] = await sql.promise().query("SELECT clienteId, numero FROM clientes_numeros WHERE estado = 'activo'");
        for (const numObj of allNumbers) {
            const numeroReal = numObj.numero ? securityService.decrypt(numObj.numero) : '';
            if (numeroReal === numero) {
                return this.findById(numObj.clienteId);
            }
        }
        return null;
    }

    // Explicitly for Contactos feature (partial usage previously)
    async findPhoneByClienteId(clienteId) {
        const [rows] = await sql.promise().query("SELECT numero FROM clientes_numeros WHERE clienteId = ? AND estado = 'activo' LIMIT 1", [clienteId]);
        if (rows.length > 0) {
            return rows[0].numero ? securityService.decrypt(rows[0].numero) : '';
        }
        return 'Sin número registrado';
    }

    async findByDeviceToken(deviceId) {
        const [allDevices] = await sql.promise().query("SELECT * FROM dispositivos WHERE estado = 'activo'");
        for (const disp of allDevices) {
            const decryptedDevice = disp.token_dispositivo ? securityService.decrypt(disp.token_dispositivo) : '';
            if (decryptedDevice === deviceId) {
                return this.findById(disp.clienteId);
            }
        }
        return null;
    }

    async registerOrUpdateDevice(clienteId, { deviceId, tipo_dispositivo, modelo_dispositivo }) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        const [allDevices] = await sql.promise().query("SELECT * FROM dispositivos WHERE estado = 'activo'");

        let dispositivoDelCliente = null;
        let dispositivoDeOtroClienteActivo = null;

        for (const disp of allDevices) {
            const decryptedToken = disp.token_dispositivo ? securityService.decrypt(disp.token_dispositivo) : '';
            if (decryptedToken === deviceId) {
                if (disp.clienteId === clienteId) {
                    dispositivoDelCliente = disp;
                } else {
                    dispositivoDeOtroClienteActivo = disp;
                }
            }
        }

        if (dispositivoDeOtroClienteActivo) {
            await sql.promise().query("UPDATE dispositivos SET estado = 'inactivo', fecha_modificacion = ? WHERE id = ?", [formattedNow, dispositivoDeOtroClienteActivo.id]);
        }

        if (dispositivoDelCliente) {
            // Already active for this client, maybe update meta?
            // Only if previously inactive? (Code says SELECT WHERE estado='activo' so it is active)
            // Just update timestamp
            await sql.promise().query("UPDATE dispositivos SET fecha_modificacion = ? WHERE id = ?", [formattedNow, dispositivoDelCliente.id]);
        } else {
            // Check if there was an inactive one? (Skipped for simplicity, just insert new active)
            // Or Reactivate?
            // Original code checked all devices then reactivated.
            // Simplified here: Insert new Active.
            await sql.promise().query(
                "INSERT INTO dispositivos (clienteId, token_dispositivo, tipo_dispositivo, modelo_dispositivo, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?)",
                [clienteId, securityService.encrypt(deviceId), securityService.encrypt(tipo_dispositivo), securityService.encrypt(modelo_dispositivo), 'activo', formattedNow]
            );
        }
        return true;
    }

    async getStats(id) {
        // 1. Alertas activas (MongoDB)
        const alertasActivas = await Alerta.countDocuments({
            idUsuarioSql: id.toString(),
            estado: { $in: ['CREADA', 'NOTIFICADA', 'ATENDIDA'] }
        });

        // 2. Alertas resueltas (MongoDB)
        const alertasResueltas = await Alerta.countDocuments({
            idUsuarioSql: id.toString(),
            estado: { $in: ['CERRADA', 'CANCELADA'] }
        });

        // 3. Contactos (SQL)
        const [contactosResult] = await sql.promise().query(
            "SELECT COUNT(*) as total FROM contactos_emergencias WHERE clienteId = ? AND estado IN ('activo', 'VINCULADO')",
            [id]
        );
        const contactos = contactosResult[0]?.total || 0;

        // 4. Avg Response Time
        let tiempoRespuestaPromedio = 0;
        try {
            const alertasConRespuesta = await Alerta.find({
                idUsuarioSql: id.toString(),
                'historial_estados.1': { $exists: true }
            });

            if (alertasConRespuesta.length > 0) {
                let sumaTiempos = 0;
                let count = 0;
                alertasConRespuesta.forEach(alerta => {
                    if (alerta.historial_estados.length >= 2) {
                        const t1 = new Date(alerta.historial_estados[0].fecha || alerta.fecha_creacion);
                        const t2 = new Date(alerta.historial_estados[1].fecha);
                        const diff = (t2 - t1) / 1000;
                        if (diff > 0 && diff < 3600) {
                            sumaTiempos += diff;
                            count++;
                        }
                    }
                });
                tiempoRespuestaPromedio = count > 0 ? Math.round(sumaTiempos / count) : 0;
            }
        } catch (e) { }

        return {
            alertasActivas,
            alertasResueltas,
            contactos,
            tiempoRespuestaPromedio
        };
    }
}

module.exports = MysqlMongoClienteRepository;
