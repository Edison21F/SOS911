// Register.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RegisterStyles } from './RegisterStyles';
import { RegisterScreenNavigationProp } from '../../../navigation/Navigator';
import api from '../../../api/api'; // Importar instancia API centralizada
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... (imports)

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [formData, setFormData] = useState({
    nombre: '',
    correo_electronico: '',
    cedula_identidad: '',
    direccion: '',
    contrasena: '',
    fecha_nacimiento: '',
    estado: 'activo' as 'activo' | 'inactivo',
    numero_ayudas: 0,
    estado_eliminado: 'activo' as 'activo' | 'eliminado',
  });

  const [showPassword, setShowPassword] = useState(false);

  // El token CSRF ya es manejado automáticamente por el interceptor de api.ts
  // No es necesario obtenerlo aquí explícitamente a menos que se quiera validar conexión

  // Obtener datos del dispositivo
  const getDeviceInfo = async () => {
    let deviceId = null;
    let modelo_dispositivo = '';
    if (Platform.OS === 'android') {
      deviceId = await Application.getAndroidId();
      modelo_dispositivo = Device.modelName || 'Android';
    } else if (Platform.OS === 'ios') {
      deviceId = await Application.getIosIdForVendorAsync();
      modelo_dispositivo = Device.modelName || 'iPhone';
    }
    return { deviceId, modelo_dispositivo };
  };

  const handleRegister = async () => {
    try {
      // ... (validaciones sin cambios)

      await AsyncStorage.removeItem('deviceId');
      await AsyncStorage.removeItem('clienteId');
      await AsyncStorage.removeItem('autoLoginEnabled');

      const { deviceId, modelo_dispositivo } = await getDeviceInfo();
      if (!deviceId || !modelo_dispositivo) {
        Alert.alert('Error', 'No se pudo obtener la información del dispositivo.');
        return;
      }
      const tipo_dispositivo = Platform.OS === 'android' ? 'Android' : 'iOS';
      const dataToSend = {
        ...formData,
        contrasena: formData.contrasena,
        deviceId,
        tipo_dispositivo,
        modelo_dispositivo,
      };

      console.log('Datos completos a enviar:', dataToSend);

      // Usar api.post en lugar de axios.post
      // La URL base y el token CSRF se manejan automáticamente
      const response = await api.post('/clientes/registro', dataToSend);

      Alert.alert('Éxito', 'Cliente registrado exitosamente.');
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Error al registrar:', error);
      const message = error.response?.data?.message || 'Error al registrar cliente';
      Alert.alert('Error', message);
    }
  };

  return (
    <LinearGradient
      colors={['#026b6b', '#2D353C']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={RegisterStyles.gradientBackground}
    >
      <SafeAreaView style={RegisterStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00ACAC" />

        <TouchableOpacity
          style={RegisterStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={RegisterStyles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={RegisterStyles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={RegisterStyles.headerContainer}>
                <Text style={RegisterStyles.title}>Crear Cuenta</Text>
                <Text style={RegisterStyles.subtitle}>
                  Completa tus datos para comenzar
                </Text>
              </View>

              <View style={RegisterStyles.formContainer}>
                <View style={RegisterStyles.inputGroup}>
                  <Text style={RegisterStyles.label}>Nombre completo *</Text>
                  <View style={RegisterStyles.inputWithIcon}>
                    <Icon name="account" size={20} color="#999" style={RegisterStyles.icon} />
                    <TextInput
                      style={RegisterStyles.inputField}
                      placeholder="Nombre"
                      placeholderTextColor="#999"
                      value={formData.nombre}
                      onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                      returnKeyType="next"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={RegisterStyles.inputGroup}>
                  <Text style={RegisterStyles.label}>Correo electrónico *</Text>
                  <View style={RegisterStyles.inputWithIcon}>
                    <Icon name="email" size={20} color="#999" style={RegisterStyles.icon} />
                    <TextInput
                      style={RegisterStyles.inputField}
                      placeholder="Correo"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={formData.correo_electronico}
                      onChangeText={(text) =>
                        setFormData({ ...formData, correo_electronico: text })
                      }
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={RegisterStyles.inputGroup}>
                  <Text style={RegisterStyles.label}>Cédula *</Text>
                  <View style={RegisterStyles.inputWithIcon}>
                    <Icon name="credit-card-outline" size={20} color="#999" style={RegisterStyles.icon} />
                    <TextInput
                      style={RegisterStyles.inputField}
                      placeholder="Cédula"
                      placeholderTextColor="#999"
                      value={formData.cedula_identidad}
                      onChangeText={(text) =>
                        setFormData({ ...formData, cedula_identidad: text })
                      }
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={RegisterStyles.inputGroup}>
                  <Text style={RegisterStyles.label}>Dirección *</Text>
                  <View style={RegisterStyles.inputWithIcon}>
                    <Icon name="map-marker" size={20} color="#999" style={RegisterStyles.icon} />
                    <TextInput
                      style={RegisterStyles.inputField}
                      placeholder="Dirección"
                      placeholderTextColor="#999"
                      value={formData.direccion}
                      onChangeText={(text) =>
                        setFormData({ ...formData, direccion: text })
                      }
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* NUEVO CAMPO: Fecha de Nacimiento */}
                <View style={RegisterStyles.inputGroup}>
                  <Text style={RegisterStyles.label}>Fecha de Nacimiento *</Text>
                  <View style={RegisterStyles.inputWithIcon}>
                    <Icon name="calendar" size={20} color="#999" style={RegisterStyles.icon} />
                    <TextInput
                      style={RegisterStyles.inputField}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#999"
                      value={formData.fecha_nacimiento}
                      onChangeText={(text) =>
                        setFormData({ ...formData, fecha_nacimiento: text })
                      }
                      returnKeyType="next"
                      keyboardType="numeric" // Sugerir teclado numérico para fechas
                    />
                  </View>
                </View>

                <View style={RegisterStyles.inputGroup}>
                  <Text style={RegisterStyles.label}>Contraseña *</Text>
                  <View style={RegisterStyles.passwordContainer}>
                    <Icon name="lock" size={20} color="#999" style={RegisterStyles.icon} />
                    <TextInput
                      style={RegisterStyles.passwordInput}
                      placeholder="Contraseña"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={formData.contrasena} // Usar 'contrasena'
                      onChangeText={(text) =>
                        setFormData({ ...formData, contrasena: text }) // Usar 'contrasena'
                      }
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={RegisterStyles.passwordToggle}
                    >
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={RegisterStyles.registerButton}
                  onPress={handleRegister}
                  activeOpacity={0.7}
                >
                  <Text style={RegisterStyles.registerButtonText}>Registrarse</Text>
                </TouchableOpacity>

                <View style={RegisterStyles.loginContainer}>
                  <Text style={RegisterStyles.loginText}>¿Ya tienes una cuenta?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={RegisterStyles.loginLink}>Iniciar sesión</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
