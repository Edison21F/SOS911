import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/Navigator';
import { styles } from './AddContactStyles';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Commented out
// import axios from 'axios'; // Commented out


type AddContactProps = StackScreenProps<RootStackParamList, 'AddContact'>;

const AddContact = ({ navigation, route }: AddContactProps) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSave = async () => {
    if (!nombre.trim() || !telefono.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      // Simulate getting clienteId, generating a unique ID
      // const clienteId = await AsyncStorage.getItem('clienteId'); // Commented out
      const clienteId = 'mock_cliente_id_123'; // Hardcoded client ID for simulation
      
      if (!clienteId) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario (simulado)');
        return;
      }

      // Simulate API call delay
      setTimeout(() => {
        // No actual axios call
        // const csrfResponse = await axios.get('http://192.168.1.31:9000/csrf-token');
        // const csrfToken = csrfResponse.data.csrfToken;

        const newContact = {
          id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Generate a unique ID
          // cliente_id: clienteId, // Not needed for display in this component
          nombre,
          telefono,
          descripcion: descripcion || 'Contacto', // Default description if empty
        };

        // Simulate successful response
        Alert.alert('Éxito', 'Contacto guardado correctamente.', [
          {
            text: 'OK',
            onPress: () => {
              // Call the passed function to add the new contact to the list
              if (route.params && route.params.updateContacts) { // Check if route.params and updateContacts exist
                route.params.updateContacts(newContact, 'add');
              }
              navigation.goBack();
            }
          }
        ]);
      }, 1000); // Simulate network delay

    } catch (error: any) {
      console.error('Error al guardar contacto (simulado):', error);
      Alert.alert('Error', 'No se pudo guardar el contacto (simulado)');
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return 'CO';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <LinearGradient
      colors={["#026b6b", "#2D353C"]}
      style={styles.backgroundImage}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView style={styles.container}>
            <View style={styles.form}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>

              <View style={styles.imagePickerContainer}>
                <View style={styles.initialsContainer}>
                  <Feather name="user" size={40} color="#fff" />
                </View>
                <Text style={styles.imageLabel}>Contacto</Text>
              </View>

              <Text style={styles.label}>Nombre:</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej. Juan Pérez" 
                value={nombre} 
                onChangeText={setNombre} 
              />

              <Text style={styles.label}>Teléfono:</Text>
              <TextInput
                style={styles.input}
                placeholder="+593 987 654 321"
                keyboardType="phone-pad"
                value={telefono}
                onChangeText={setTelefono}
              />

              <Text style={styles.label}>Relación:</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej. Amigo cercano" 
                value={descripcion} 
                onChangeText={setDescripcion} 
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Feather name="save" size={24} color="white" />
                <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
     </LinearGradient>
  );
};

export default AddContact;