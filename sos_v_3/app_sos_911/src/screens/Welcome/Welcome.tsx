import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/Navigator';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LoginStyles as styles } from '../Auth/Login/LoginStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import api from '../../api/api';

const getDeviceId = async () => {
  if (Platform.OS === 'android') {
    return await Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    return await Application.getIosIdForVendorAsync();
  }
  return null;
};

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [csrfToken, setCsrfToken] = useState('');

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Obtener el token CSRF al montar el componente
  React.useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // Limpiar tokens antiguos antes de obtener uno nuevo
        await AsyncStorage.removeItem('csrfToken');
        await AsyncStorage.removeItem('sessionCookie');

        // Usar la instancia api configurada
        const response = await api.get('/csrf-token');
        const token = response.data.csrfToken;

        if (token) {
          setCsrfToken(token);
          await AsyncStorage.setItem('csrfToken', token);

          // Capturar y guardar la cookie de sesión (SOLO nombre=valor)
          const setCookieHeader = response.headers['set-cookie'];
          if (setCookieHeader) {
            let cookieValue = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
            // Extraer solo la parte nombre=valor (antes del primer punto y coma)
            if (cookieValue) {
              cookieValue = cookieValue.split(';')[0];
            }
            await AsyncStorage.setItem('sessionCookie', cookieValue);
            console.log('Cookie de sesión guardada (limpia):', cookieValue);
          }
        }
      } catch (error) {
        console.error('Error obteniendo CSRF token:', error);
        setCsrfToken('');
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSosPress = () => {
    Alert.alert('Atención', 'Por favor, regístrate o inicia sesión para usar la alerta SOS');
  };

  const handleLoginPress = async () => {
    // Si el inicio automático está activado en Home, deja pasar directo a Home sin conexión ni validación
    // Puedes obtener el valor de autoLoginEnabled desde AsyncStorage
    const autoLoginEnabled = await AsyncStorage.getItem('autoLoginEnabled');
    if (autoLoginEnabled === 'true') {
      // Navega directo a Home, sin pedir usuario ni contraseña
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      return;
    }
    // Si no está activado, navega al Login normal
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#026b6b', '#2D353C']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.backgroundGradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={{ ...styles.logoContainer, marginTop: 60, marginBottom: 40 }}>
          <Image
            source={require('../../assets/logo/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={{ ...styles.title, marginTop: 10 }}>
            <Text style={styles.sosText}>Sos</Text>
            <Text style={styles.nineElevenText}>911</Text>
          </Text>
          <Text style={{ ...styles.subtitle, marginTop: 8 }}>Tu app de ayuda de emergencia</Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 0, marginBottom: 0, marginTop: -20 }}>
          <Animated.View style={{
            transform: [{ scale: pulseAnim }],
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Borde blanco externo */}
            <View style={{
              width: 259,
              height: 260,
              borderRadius: 130,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              zIndex: 1,
            }} />
            {/* Botón SOS encima del borde */}
            <TouchableOpacity
              onPress={handleSosPress}
              activeOpacity={0.8}
              style={{
                width: 220,
                height: 220,
                borderRadius: 110,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <LinearGradient
                colors={['#FF4D4D', '#FF4D4D']}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 110,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 70, letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>SOS</Text>
                  <Text style={{ color: 'white', fontSize: 18, marginTop: 8, textShadowColor: 'rgba(0,0,0,0.10)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>Presionar 1 vez</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={{ ...styles.inputContainer, marginTop: 40, marginBottom: 10 }}>
          <TouchableOpacity
            onPress={handleLoginPress}
            style={styles.loginButton}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="login" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={[styles.loginButton, { backgroundColor: '#2D353C', borderWidth: 1, borderColor: '#fff', marginTop: 10 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="account-plus" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={[styles.loginButtonText, { color: '#fff' }]}>Registrarse</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
