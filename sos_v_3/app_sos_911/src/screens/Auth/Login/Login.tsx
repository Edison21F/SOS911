// Login.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../../api/api';
import { LoginScreenNavigationProp } from '../../../navigation/Navigator';
import { LoginStyles } from './LoginStyles';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  // Elimina toda la lógica de conexión y solo permite entrar con cualquier usuario/contraseña

  // Obtener un nuevo token CSRF al entrar a la pantalla de Login
  // Esto asegura que si el backend se reinició (y cambió el secreto), obtengamos una nueva sesión válida
  useEffect(() => {
    const refreshSession = async () => {
      try {
        // Limpiar tokens antiguos
        await AsyncStorage.removeItem('csrfToken');
        await AsyncStorage.removeItem('sessionCookie');

        // Solicitar nuevo token
        const response = await api.get('/csrf-token');
        const token = response.data.csrfToken;

        if (token) {
          await AsyncStorage.setItem('csrfToken', token);

          // Capturar y guardar la cookie de sesión
          const setCookieHeader = response.headers['set-cookie'];
          if (setCookieHeader) {
            let cookieValue = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
            if (cookieValue) {
              cookieValue = cookieValue.split(';')[0];
            }
            await AsyncStorage.setItem('sessionCookie', cookieValue);
          }
        }
      } catch (error) {
        console.error('Error refrescando sesión en Login:', error);
      }
    };

    refreshSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingrese email y contraseña');
      return;
    }
    setIsLoading(true);

    try {
      const response = await api.post('/clientes/login', {
        correo_electronico: email,
        contrasena: password
      });

      console.log('Login exitoso:', response.data);

      // Guardar datos de sesión
      if (response.data.userId) {
        await AsyncStorage.setItem('clienteId', response.data.userId.toString());
      }

      Alert.alert('Éxito', 'Inicio de sesión exitoso', [
        {
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
        }
      ]);
    } catch (error: any) {
      console.error('Error en login:', error);
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#026b6b', '#2D353C']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={LoginStyles.backgroundGradient}
    >
      <SafeAreaView style={LoginStyles.container}>
        <View style={LoginStyles.logoContainer}>
          <Image
            source={require('../../../assets/logo/icon.png')}
            style={LoginStyles.logo}
            resizeMode="contain"
          />
          <Text style={LoginStyles.title}>
            <Text style={LoginStyles.sosText}>Sos</Text>
            <Text style={LoginStyles.nineElevenText}>911</Text>
          </Text>
          <Text style={LoginStyles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={LoginStyles.inputContainer}>
          <View style={LoginStyles.inputWrapper}>
            <Icon name="email" size={20} color="#999" style={LoginStyles.icon} />
            <TextInput
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              style={LoginStyles.inputField}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={LoginStyles.inputWrapper}>
            <Icon name="lock" size={20} color="#999" style={LoginStyles.icon} />
            <TextInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={LoginStyles.inputField}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            style={LoginStyles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={LoginStyles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={LoginStyles.registerContainer}>
            <Text style={LoginStyles.registerText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={LoginStyles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
