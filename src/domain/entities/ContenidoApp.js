class ContenidoApp {
    constructor({
        id,
        gradientStart,
        gradientEnd,
        fontFamily,
        mainTitle,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // MongoDB Content
        howItWorksKey,
        howItWorksTitle,
        howItWorksContent,
        missionKey,
        missionTitle,
        missionContent,
        visionKey,
        visionTitle,
        visionContent,
        logoApp
    }) {
        this.id = id;
        this.gradientStart = gradientStart;
        this.gradientEnd = gradientEnd;
        this.fontFamily = fontFamily;
        this.mainTitle = mainTitle;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;

        // Mongo Fields
        this.howItWorksKey = howItWorksKey;
        this.howItWorksTitle = howItWorksTitle;
        this.howItWorksContent = howItWorksContent;
        this.missionKey = missionKey;
        this.missionTitle = missionTitle;
        this.missionContent = missionContent;
        this.visionKey = visionKey;
        this.visionTitle = visionTitle;
        this.visionContent = visionContent;
        this.logoApp = logoApp;
    }
}

module.exports = ContenidoApp;
