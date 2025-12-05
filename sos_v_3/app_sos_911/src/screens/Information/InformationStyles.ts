import { StyleSheet, Platform, StatusBar } from "react-native";
import { normalize } from "../../utils/dimensions";

export const theme = {
    colors: {
        background: '#026b6b',
        backgroundAlt: '#2D353C',
        card: 'rgba(45, 53, 60, 0.6)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        primary: '#38bdf8',
        accent: '#2dd4bf',
        accentPurple: '#a78bfa',
        border: 'rgba(100, 116, 139, 0.3)',
    },
};

export const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    contentContainer: {
        flexGrow: 1,
        padding: normalize(20),
    },
    header: {
        alignItems: 'center',
        marginBottom: normalize(30),
    },
    headerTitle: {
        fontSize: normalize(22),
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: normalize(8),
    },
    // Estilo para cada tarjeta de información
    infoCard: {
        backgroundColor: theme.colors.card,
        borderRadius: normalize(20),
        padding: normalize(20),
        marginBottom: normalize(20),
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(12),
    },
    iconContainer: {
        padding: normalize(8),
        borderRadius: normalize(12),
        marginRight: normalize(12),
    },
    cardTitle: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    cardText: {
        fontSize: normalize(15),
        color: theme.colors.textSecondary,
        lineHeight: normalize(22),
    },
    highlightText: {
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
});