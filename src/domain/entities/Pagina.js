class Pagina {
    constructor({
        id,
        nombrePagina,
        descripcionPagina,
        mision,
        vision,
        logoUrl,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Meta fields
        idPaginaSql,
        estado_sql,
        fecha_creacion_sql,
        fecha_modificacion_sql,
        estado_mongo,
        fecha_creacion_mongo
    }) {
        this.id = id;
        this.nombrePagina = nombrePagina;
        this.descripcionPagina = descripcionPagina;
        this.mision = mision;
        this.vision = vision;
        this.logoUrl = logoUrl;
        this.estado = estado;
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
    }
}

module.exports = Pagina;
