// Importamos las librerías y componentes necesarios
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  Alert,
  ImageBackground,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { ShieldAlert, Siren, Bell, XCircle, MapPin } from 'lucide-react-native'; // Íconos para las acciones
import CustomSidebar from '../../components/Sidebar/Sidebar'; // Sidebar personalizado
import Header from '../../components/Header/Header'; // Encabezado de la pantalla
import { styles } from './NotificationsStyles'; // Estilos de la pantalla
import { Notification, NotificationsProps } from './types'; // Tipos de datos
import { normalize } from '../../utils/dimensions'; // Función para normalizar tamaños en distintas pantallas
import MapView, { Marker } from 'react-native-maps'; // Agrega esto si tienes react-native-maps instalado
import { LinearGradient } from 'expo-linear-gradient';

// Cambiar el orden de las notificaciones y el texto de Pablo Vargas
const initialNotifications: Notification[] = [
  {
    id: '2',
    title: 'Alerta recibida',
    description: 'Contacto emergencia: Pablo Vargas - Ayuda urgente.',
    time: 'Hace 1 hora',
    type: 'clientes',
    alertType: undefined, // No calificada
    status: 'pending',
    location: { latitude: -0.181, longitude: -78.468 },
    responseComment: '',
  },
  {
    id: '1',
    title: 'Alerta recibida',
    description: 'Familia: Me caí de la moto.',
    time: 'Hace 30 minutos',
    type: 'grupo',
    group: 'Comunidad San Jose',
    alertType: undefined, // No calificada
    status: 'pending',
    location: { latitude: -0.180653, longitude: -78.467834 },
    responseComment: '',
  },
  {
    id: '3',
    title: 'Alerta recibida',
    description: 'Leo Perez: Apreté mal el botón.',
    time: 'Hace 1 hora',
    type: 'grupo',
    group: 'Comunidad San Jose',
    alertType: undefined, // No calificada
    status: 'pending',
    location: { latitude: -0.182, longitude: -78.469 },
    responseComment: '',
  },
];

// Colores suaves y adaptados al fondo
const alertConfig = {
  sos: {
    icon: <Siren size={normalize(24)} color="#fff" />,
    color: { backgroundColor: '#FFB26B' },
    textColor: { color: '#FFB26B', fontWeight: 'bold' as 'bold' },
    buttonColor: { backgroundColor: '#E09A4F' },
    label: 'SOS',
  },
  '911': {
    icon: <ShieldAlert size={normalize(24)} color="#fff" />,
    color: { backgroundColor: '#FF6B6B' },
    textColor: { color: '#FF6B6B', fontWeight: 'bold' as 'bold' },
    buttonColor: { backgroundColor: '#D94A4A' },
    label: '911',
  },
  unnecessary: {
    icon: <Bell size={normalize(24)} color="#fff" />,
    color: { backgroundColor: '#4EC9B0' },
    textColor: { color: '#4EC9B0', fontWeight: 'bold' as 'bold' },
    buttonColor: { backgroundColor: '#399E8A' },
    label: 'Innecesaria',
  },
  pending: {
    icon: <Bell size={normalize(24)} color="#888" />,
    color: { backgroundColor: '#e5e7eb' },
    textColor: { color: '#333', fontWeight: 'bold' as 'bold' },
    buttonColor: { backgroundColor: '#888' },
    label: 'Sin calificar',
  },
};

// Definimos el componente principal de la pantalla de notificaciones
const NotificationsScreen: React.FC<NotificationsProps> = ({ navigation }) => {
  // Estado que almacena las notificaciones
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  // Estado que controla la apertura del menú lateral
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  // Estados para el flujo de calificación
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [calificacionStep, setCalificacionStep] = useState<'select' | 'input'>('select');
  const [calificacionTipo, setCalificacionTipo] = useState<'sos' | '911' | 'unnecessary' | null>(null);
  const [mapLocation, setMapLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  // Estado para el mensaje personalizado
  const [calificacionMensaje, setCalificacionMensaje] = useState('');

  // Función para confirmar la eliminación de una notificación
  const confirmDelete = (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Seguro que deseas eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' }, // Opción para cancelar
        { text: 'Eliminar', onPress: () => handleDelete(id), style: 'destructive' }, // Opción para eliminar
      ]
    );
  };

  // Función para eliminar una notificación del estado
  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleCalificar = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowCalificarModal(true);
    setCalificacionMensaje('');
    setCalificacionStep('select');
    setCalificacionTipo(null);
  };

  const handleSelectTipo = (tipo: 'sos' | '911' | 'unnecessary') => {
    setCalificacionTipo(tipo);
    setCalificacionStep('input');
  };

  const handleEnviarCalificacion = () => {
    if (!selectedNotification || !calificacionTipo) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === selectedNotification.id
          ? {
              ...n,
              status: calificacionTipo,
              alertType: calificacionTipo,
              title: `Alerta : ${calificacionTipo === 'unnecessary' ? 'Innecesaria' : calificacionTipo.toUpperCase()}`,
              responseComment: calificacionMensaje || `Respondido: ${calificacionTipo === 'unnecessary' ? 'Innecesaria' : calificacionTipo.toUpperCase()}`,
            }
          : n
      )
    );
    setShowCalificarModal(false);
    setSelectedNotification(null);
    setCalificacionMensaje('');
    setCalificacionTipo(null);
    setCalificacionStep('select');
  };

  // Función que renderiza cada tarjeta de notificación
  const renderNotificationCard = (notification: Notification) => {
    const config = alertConfig[notification.status || 'pending'];
    const headerText = notification.type === 'grupo' ? notification.group || 'Comunidad' : 'Contacto: Pablo Vargas';

    // Animación pulse para toda la tarjeta si está pendiente
    const pulseAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
      if (notification.status === 'pending') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.009, // Más sutil aún (0.9% más grande)
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notification.status]);

    return (
      <TouchableWithoutFeedback
        key={notification.id}
        onLongPress={() => confirmDelete(notification.id)}
      >
        {notification.status === 'pending' ? (
          <Animated.View style={[styles.cardContainer, { transform: [{ scale: pulseAnim }] }]}> 
            {/* Barra lateral de color e ícono */}
            <View style={[styles.sideBar, config.color]}>{config.icon}</View>
            {/* Cuerpo de la tarjeta */}
            <View style={styles.cardContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.communityText}>{headerText}</Text>
                <Text style={styles.timeText}>{notification.time}</Text>
              </View>
              <View style={styles.notificationContentWeb}>
                <View style={styles.notificationInfo}>
                  <Text style={[styles.notificationTitle, config.textColor]}>{notification.title}</Text>
                  <Text style={styles.notificationDescription}>{notification.description}</Text>
                  {/* Comentario de respuesta si ya fue calificada */}
                  {notification.responseComment && (
                    <Text style={{ marginTop: 6, color: '#888', fontStyle: 'italic' }}>{notification.responseComment}</Text>
                  )}
                </View>
                <Image
                  source={require('../../assets/noti.jpg')}
                  style={styles.profileImage}
                />
              </View>
              <View style={[styles.notificationActions, { flexDirection: 'row', gap: 8 }]}> 
                {/* Siempre mostrar los botones para ver ubicación y calificar */}
                <TouchableOpacity
                  style={[styles['actionButton'], { backgroundColor: '#00ACAC', flex: 1 }]}
                  onPress={() => setMapLocation(notification.location)}
                >
                  <MapPin size={normalize(18)} color="#fff" style={{ marginRight: normalize(6) }} />
                  <Text style={styles.actionButtonText}>Ver ubicación</Text>
                </TouchableOpacity>
                {notification.status === 'pending' ? (
                  <TouchableOpacity
                    style={[styles['actionButton'], config.buttonColor, { flex: 1 }]}
                    onPress={() => handleCalificar(notification)}
                  >
                    <Text style={styles.actionButtonText}>Calificar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.cardContainer}>
            {/* Barra lateral de color e ícono */}
            <View style={[styles.sideBar, config.color]}>{config.icon}</View>
            {/* Cuerpo de la tarjeta */}
            <View style={styles.cardContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.communityText}>{headerText}</Text>
                <Text style={styles.timeText}>{notification.time}</Text>
              </View>
              <View style={styles.notificationContentWeb}>
                <View style={styles.notificationInfo}>
                  <Text style={[styles.notificationTitle, config.textColor]}>{notification.title}</Text>
                  <Text style={styles.notificationDescription}>{notification.description}</Text>
                  {notification.responseComment && (
                    <Text style={{ marginTop: 6, color: '#888', fontStyle: 'italic' }}>{notification.responseComment}</Text>
                  )}
                </View>
                <Image
                  source={require('../../assets/noti.jpg')}
                  style={styles.profileImage}
                />
              </View>
              <View style={[styles.notificationActions, { flexDirection: 'row', gap: 8 }]}> 
                <TouchableOpacity
                  style={[styles['actionButton'], { backgroundColor: '#00ACAC', flex: 1 }]}
                  onPress={() => setMapLocation(notification.location)}
                >
                  <MapPin size={normalize(18)} color="#fff" style={{ marginRight: normalize(6) }} />
                  <Text style={styles.actionButtonText}>Ver ubicación</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableWithoutFeedback>
    );
  };

  return (
     <LinearGradient
     colors={['#026b6b', '#2D353C']} // Updated colors
     style={styles.backgroundImage}
     start={{ x: 0, y: 0 }} // Updated start point
     end={{ x: 1, y: 1 }}   // Updated end point
   >
      <SafeAreaView style={styles.container}>
        
        {/* Encabezado de la pantalla con botón para abrir el menú lateral */}
        <Header onMenuPress={() => setSidebarOpen(true)} customTitle="Notificaciones" />

        {/* Listado de notificaciones */}
        <ScrollView style={styles.content}>
          {notifications.length > 0 ? (
            notifications.map(renderNotificationCard) // Renderiza cada tarjeta de notificación
          ) : (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No hay notificaciones</Text> // Mensaje si no hay notificaciones
          )}
        </ScrollView>

        {/* Menú lateral de navegación */}
        <CustomSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Modal para mostrar el mapa con la ubicación de la alerta */}
        <Modal visible={!!mapLocation} transparent animationType="slide" onRequestClose={() => setMapLocation(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '90%', height: 300, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }}>
              <Text style={{ textAlign: 'center', marginTop: 10, fontWeight: 'bold' }}>Ubicación de la alerta</Text>
              <MapView
                style={{ flex: 1, width: '100%' }}
                initialRegion={{
                  latitude: mapLocation?.latitude || 0,
                  longitude: mapLocation?.longitude || 0,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={mapLocation || { latitude: 0, longitude: 0 }} />
              </MapView>
              <Text style={{ textAlign: 'center', marginBottom: 10, color: '#00ACAC' }} onPress={() => setMapLocation(null)}>
                Cerrar
              </Text>
            </View>
          </View>
        </Modal>

        {/* Modal para calificar alerta con input personalizado */}
        <Modal visible={showCalificarModal} transparent animationType="fade" onRequestClose={() => setShowCalificarModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 28, width: '85%', alignItems: 'center' }}>
              {calificacionStep === 'select' ? (
                <>
                  <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 18, textAlign: 'center' }}>
                    ¿Cómo quieres calificar esta alerta?
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.sosButton, { marginBottom: 10, width: '100%' }]}
                    onPress={() => handleSelectTipo('sos')}
                  >
                    <Siren size={normalize(22)} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.actionButtonText}>SOS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.alert911Button, { marginBottom: 10, width: '100%' }]}
                    onPress={() => handleSelectTipo('911')}
                  >
                    <ShieldAlert size={normalize(22)} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.actionButtonText}>911</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.unnecessaryButton, { width: '100%' }]}
                    onPress={() => handleSelectTipo('unnecessary')}
                  >
                    <Bell size={normalize(22)} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.actionButtonText}>Innecesaria</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowCalificarModal(false)} style={{ marginTop: 18 }}>
                    <Text style={{ color: '#888', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 18, textAlign: 'center' }}>
                    ¿Cómo quieres responder a esta alerta?
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 8,
                      padding: 10,
                      width: '100%',
                      marginBottom: 14,
                      fontSize: 16,
                    }}
                    placeholder="Escribe un mensaje personalizado..."
                    value={calificacionMensaje}
                    onChangeText={setCalificacionMensaje}
                    multiline
                    maxLength={120}
                  />
                  <TouchableOpacity
                    style={[styles.actionButton, calificacionTipo === 'sos' ? styles.sosButton : calificacionTipo === '911' ? styles.alert911Button : styles.unnecessaryButton, { width: '100%' }]}
                    onPress={handleEnviarCalificacion}
                  >
                    {calificacionTipo === 'sos' && <Siren size={normalize(22)} color="#fff" style={{ marginRight: 10 }} />}
                    {calificacionTipo === '911' && <ShieldAlert size={normalize(22)} color="#fff" style={{ marginRight: 10 }} />}
                    {calificacionTipo === 'unnecessary' && <Bell size={normalize(22)} color="#fff" style={{ marginRight: 10 }} />}
                    <Text style={styles.actionButtonText}>Enviar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowCalificarModal(false)} style={{ marginTop: 18 }}>
                    <Text style={{ color: '#888', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

      </SafeAreaView>
     </LinearGradient>
  );
};

export default NotificationsScreen;
