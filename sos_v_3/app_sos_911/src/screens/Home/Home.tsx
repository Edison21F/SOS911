// HomeScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Image,
  Easing,
  Linking,
  Alert,
  Modal,
  Switch
} from 'react-native';
import Svg, { Line, Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Shield, Lock } from 'lucide-react-native';
import CustomSidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { styles } from './HomeStyles';
import { normalize } from '../../utils/dimensions';
import { HomeScreenProps } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(true);
  // Nuevos estados para el sistema de alerta
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const buttonScale = new Animated.Value(1);
  const [rotation, setRotation] = useState(0);
  const animationFrameRef = useRef<number>();
  const pulseAnimValue = useRef(new Animated.Value(1)).current;
  const securityButtonFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animar la rotación continuamente
    const animate = () => {
      setRotation(prev => (prev + 0.3) % 360);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Cargar configuración de auto-login al iniciar
  useEffect(() => {
    const loadAutoLoginSetting = async () => {
      try {
        const setting = await AsyncStorage.getItem('autoLoginEnabled');
        if (setting !== null) {
          setAutoLoginEnabled(setting === 'true');
        }
      } catch (error) {
        console.error('Error loading auto-login setting:', error);
      }
    };
    loadAutoLoginSetting();
  }, []);

  // Controlar la visibilidad del botón de seguridad
  useEffect(() => {
    if (isAlertModalOpen || isCooldownActive) {
      Animated.timing(securityButtonFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(securityButtonFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAlertModalOpen, isCooldownActive]);

  // Efecto para manejar el cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCooldownActive && cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setIsCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCooldownActive, cooldownTime]);

  const handleResolvePress = () => {
    setIsButtonActive(false);
  };

  const handleAutoLoginToggle = async () => {
    try {
      const newValue = !autoLoginEnabled;
      setAutoLoginEnabled(newValue);
      await AsyncStorage.setItem('autoLoginEnabled', newValue.toString());
      
      if (!newValue) {
        // Solo mostrar mensaje, NO eliminar clienteId en la sesión actual
        // Los valores se eliminarán cuando la app se reinicie y detecte que auto-login está desactivado
        Alert.alert(
          'Auto-login desactivado',
          'Deberás iniciar sesión manualmente la próxima vez que abras la aplicación. Tu sesión actual permanecerá activa.',
          [{ text: 'Entendido', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Auto-login activado',
          'La aplicación recordará tu sesión para futuros accesos.',
          [{ text: 'Perfecto', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error toggling auto-login:', error);
      Alert.alert('Error', 'No se pudo cambiar la configuración');
    }
  };

  const renderSecurityModal = () => {
    return (
      <Modal
        visible={isSecurityModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSecurityModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Shield size={normalize(32)} color="#00ACAC" />
              <Text style={styles.modalTitle}>Seguridad de Sesión</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Controla cómo inicias sesión en la aplicación
              </Text>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    <Lock size={normalize(20)} color="#666" />
                    <Text style={styles.switchLabel}>Inicio automático</Text>
                  </View>
                  <Switch
                    value={autoLoginEnabled}
                    onValueChange={handleAutoLoginToggle}
                    thumbColor={autoLoginEnabled ? '#00ACAC' : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: '#00ACAC80' }}
                  />
                </View>
                
                <Text style={styles.switchDescription}>
                  {autoLoginEnabled 
                    ? 'La app recordará tu sesión para accesos futuros' 
                    : 'Deberás iniciar sesión manualmente cada vez'}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsSecurityModalOpen(false)}
              >
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderResolveButton = () => {
    if (!isButtonActive) return null;

    return (
      <TouchableOpacity
        style={styles.resolveButton}
        onPress={handleResolvePress}
        activeOpacity={0.8}
      >
        <LinearGradient
           colors={['#2ECC71', '#28B463']} // <--- CAMBIO AQUÍ
          style={styles.resolveGradient}
           start={{ x: 0, y: 0 }} // <--- CAMBIO AQUÍ
           end={{ x: 1, y: 1 }}   // <--- CAMBIO AQUÍ
        >
          <Text style={styles.resolveText}>Resuelto</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const handleEmergencyCall = async () => {
    const phoneNumber = '911';
    const phoneUrl = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);

      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          'Error',
          'Phone calls are not supported on this device',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Could not initiate phone call',
        [{ text: 'OK' }]
      );
    }
  };

  // Función para manejar el botón de emergencia
  const handleEmergencyPress = () => {
    if (isCooldownActive) {
      return; // No hacer nada si está en cooldown
    }

    // Mostrar modal de alerta activa
    setIsAlertModalOpen(true);
    setIsButtonActive(true);
    
    // Cerrar modal después de 3 segundos
    setTimeout(() => {
      setIsAlertModalOpen(false);
      setIsButtonActive(false);
      
      // Activar cooldown de 30 segundos
      setIsCooldownActive(true);
      setCooldownTime(30); // 30 segundos
    }, 3000);
  };

  // Función para formatear el tiempo del cooldown
  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Renderizar modal de alerta activa
  const renderAlertModal = () => {
    return (
      <Modal
        visible={isAlertModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: 'rgba(2, 107, 107, 0.95)', // Fondo similar al de la app
            borderRadius: 20,
            padding: 0,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            width: '90%',
            height: '70%'
          }]}>
            
            {/* Título "Alerta activa" */}
            <Text style={{ 
              color: '#FFFFFF',
              fontSize: 28,
              fontWeight: 'bold',
              marginTop: 30,
              marginBottom: 30,
              textAlign: 'center'
            }}>
              Alerta activa
            </Text>
            
            {/* Contenedor de los contactos con líneas */}
            <View style={{ 
              flex: 1,
              width: '100%',
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              
              {/* Elementos futurísticos similares a la pantalla principal */}
              <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                {/* Círculos concéntricos */}
                {[0.3, 0.5, 0.7, 0.9].map((scale, index) => (
                  <View
                    key={`circle-${index}`}
                    style={{
                      position: 'absolute',
                      width: 200 * scale,
                      height: 200 * scale,
                      borderRadius: 100 * scale,
                      borderWidth: 1.5,
                      borderColor: '#FFFFFF',
                      borderStyle: 'dashed',
                      left: '50%',
                      top: '50%',
                      marginLeft: -100 * scale,
                      marginTop: -100 * scale,
                    }}
                  />
                ))}
              </View>
              
              {/* Contactos posicionados */}
              {people.map((person, index) => {
                const angle = (index * 360) / people.length;
                const angleInRadians = (angle * Math.PI) / 180;
                const radius = 80;
                const x = radius * Math.cos(angleInRadians);
                const y = radius * Math.sin(angleInRadians);
                
                return (
                  <View
                    key={person.id}
                    style={{
                      position: 'absolute',
                      alignItems: 'center',
                      transform: [
                        { translateX: x },
                        { translateY: y }
                      ]
                    }}
                  >
                    <Image 
                      source={person.image} 
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor: '#FFFFFF'
                      }}
                    />
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 12,
                      marginTop: 5,
                      textAlign: 'center'
                    }}>
                      {person.name}
                    </Text>
                  </View>
                );
              })}
              
              {/* Botón SOS central */}
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FF4D4D',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: 'bold'
                }}>
                  SOS
                </Text>
              </View>
              
              {/* Líneas conectando el centro con los contactos */}
              {people.map((person, index) => {
                const angle = (index * 360) / people.length;
                const angleInRadians = (angle * Math.PI) / 180;
                const radius = 80;
                
                return (
                  <View
                    key={`line-${person.id}`}
                    style={{
                      position: 'absolute',
                      width: radius,
                      height: 2,
                      backgroundColor: '#FFFFFF',
                      zIndex: 5,
                      transform: [
                        { rotate: `${angle}deg` },
                        { translateX: radius / 2 }
                      ]
                    }}
                  />
                );
              })}
              
            </View>
            
            {/* Mensaje de confirmación */}
            <Text style={{
              color: '#FFFFFF',
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 30,
              paddingHorizontal: 20
            }}>
              Tus contactos de emergencia han sido notificados con tu ubicación actual
            </Text>
            
          </View>
        </View>
      </Modal>
    );
  };

  const people = [
    { id: 1, name: 'Sister', image: require('../../assets/chica.jpg'), distance: 0.8 },
    { id: 2, name: 'Dad', image: require('../../assets/ismael.jpg'), distance: 1.2 },
    { id: 3, name: 'Albert', image: require('../../assets/erick.jpg'), distance: 0.5 },
    { id: 4, name: 'Emy jackson', image: require('../../assets/carlos.jpg'), distance: 1 },
  ];

  const renderFuturisticElements = () => {
    const centerX = normalize(200);
    const centerY = normalize(200);
    const maxRadius = normalize(190);

    return (
      <Svg style={styles.linesContainer}>
        {/* Common circles that appear in both states */}
        <G transform={`rotate(${rotation} ${centerX} ${centerY})`}>
          {[0.4, 0.6, 0.8, 1].map((scale, index) => (
            <Circle
              key={`circle-${index}`}
              cx={centerX}
              cy={centerY}
              r={maxRadius * scale}
              stroke="#FFFFFF" // Blanco puro
              strokeWidth="1.5" // Un poco más grueso para más visibilidad
              fill="none"
              strokeDasharray={`${normalize(5)},${normalize(15)}`}
            />
          ))}
        </G>

        {/* Active state connections and people */}
        {isButtonActive && (
          <>
            {people.map((person, index) => {
              const angle = (index * 360) / people.length;
              const angleInRadians = (angle * Math.PI) / 180;
              const radius = maxRadius * person.distance;
              const x = centerX + radius * Math.cos(angleInRadians);
              const y = centerY + radius * Math.sin(angleInRadians);
              const opacity = 1; // Máxima visibilidad

              return (
                <G key={`connection-${person.id}`}>
                  <Line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    opacity={opacity}
                  />

                  {[0.3, 0.6, 0.9].map((pos, idx) => {
                    const circleX = centerX + (radius * pos) * Math.cos(angleInRadians);
                    const circleY = centerY + (radius * pos) * Math.sin(angleInRadians);
                    return (
                      <Circle
                        key={`dot-${person.id}-${idx}`}
                        cx={circleX}
                        cy={circleY}
                        r="3.5"
                        fill="#FFFFFF"
                        opacity={opacity}
                      />
                    );
                  })}

                  <Circle
                    cx={x}
                    cy={y}
                    r="7"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    opacity={opacity}
                  />
                </G>
              );
            })}
          </>
        )}

        <Circle
          cx={centerX}
          cy={centerY}
          r={normalize(20)}
          fill="rgba(255,255,255,0.35)" // Más blanco en el centro
        />
      </Svg>
    );
  };

  useEffect(() => {
    let pulseAnimation = null;
    if (!isButtonActive && !isAlertModalOpen && !isCooldownActive) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimValue, {
            toValue: 1.04,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    } else {
      pulseAnimValue.setValue(1);
    }
    return () => {
      if (pulseAnimation) pulseAnimation.stop();
      pulseAnimValue.setValue(1);
    };
  }, [isButtonActive, isAlertModalOpen, isCooldownActive]);

  const renderButton = () => {
    return (
      <TouchableOpacity
        onPress={handleEmergencyPress}
        activeOpacity={isCooldownActive ? 1 : 0.9}
        disabled={isCooldownActive}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnimValue }] }}>
          <LinearGradient
            colors={isCooldownActive ? ['#95A5A6', '#7F8C8D'] : ['#FF4D4D', '#FF4D4D']}
            style={[
              styles.innerButton,
              isButtonActive && styles.innerButtonActive
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isCooldownActive ? (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>SOS</Text>
                <Text style={styles.subtitleText}>
                  Disponible en {formatCooldownTime(cooldownTime)}
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={[
                  styles.buttonText,
                  isButtonActive && styles.buttonTextActive
                ]}>
                  SOS
                </Text>
                {!isButtonActive && (
                  <Text style={styles.subtitleText}>Presionar una vez</Text>
                )}
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderNearbyPeople = () => {
    return isButtonActive && (
      <View style={styles.nearbyPeopleContainer}>
        {people.map((person, index) => {
          const angle = (index * 360) / people.length;
          const angleInRadians = (angle * Math.PI) / 180;
          const radius = normalize(140) * person.distance;
          const translateX = radius * Math.cos(angleInRadians);
          const translateY = radius * Math.sin(angleInRadians);

          return (
            <View
              key={person.id}
              style={[
                styles.personBubble,
                {
                  transform: [
                    { translateX },
                    { translateY }
                  ],
                  opacity: Math.max(0.5, 1 - person.distance / 2)
                }
              ]}
            >
              <Image source={person.image} style={styles.personImage} />
              <Text style={styles.personName}>{person.name}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
  <LinearGradient
  colors={['#026b6b', '#2D353C']} // These are the correct colors
  style={styles.backgroundImage}
  start={{ x: 0, y: 0 }}         // Corrected start point
  end={{ x: 1, y: 1 }}           // Corrected end point
>
      <SafeAreaView style={styles.container}>
        <Header onMenuPress={() => setSidebarOpen(true)} />

        <Text
          style={[
            styles.title,
            isButtonActive && { marginTop: normalize(18) } // Sube el texto cuando la alerta está activa
          ]}
        >
          {isAlertModalOpen
            ? "Alerta activa"
            : isButtonActive
              ? "Alerta activa"
              : isCooldownActive
                ? `Disponible en ${formatCooldownTime(cooldownTime)}`
                : "Un toque para tu seguridad"}
        </Text>

        <View style={styles.content}>
          <View style={styles.buttonContainer}>
            {renderFuturisticElements()}
            <Animated.View style={[
              styles.outerButton,
              isButtonActive && styles.outerButtonActive,
            ]}>
              {renderButton()}
            </Animated.View>
            {renderNearbyPeople()}
          </View>

          {/* Botón "Resuelto" eliminado según solicitud del usuario */}
          <TouchableOpacity
            style={styles.emergencyTag}
            onPress={handleEmergencyCall}
          >
            <Phone size={normalize(26)} color="#FF0000FF" />
            <Text style={styles.emergencyText}>911</Text>
          </TouchableOpacity>
        </View>

        <CustomSidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Botón de seguridad de sesión */}
        <Animated.View style={[
          styles.securityButton,
          { opacity: securityButtonFade }
        ]}>
          <TouchableOpacity
            style={styles.securityButtonContent}
            onPress={() => setIsSecurityModalOpen(true)}
            activeOpacity={0.8}
          >
            <Shield size={normalize(20)} color="#FF8C00" />
            <Text style={styles.securityButtonText}>Seguridad de Sesión</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Modal de configuración de seguridad */}
        {renderSecurityModal()}
        
        {/* Modal de alerta activa */}
        {renderAlertModal()}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;