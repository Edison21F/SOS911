import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/Navigator';
import { styles } from './ContactDetailsStyles';
import { Feather } from '@expo/vector-icons';
import Header from '../../../components/Header/Header';
import { LinearGradient } from 'expo-linear-gradient';
// import axios from 'axios'; // Commented out

type ContactDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ContactDetails'>;
type ContactDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ContactDetails'>;

type ContactDetailsProps = {
  route: ContactDetailsScreenRouteProp;
  navigation: ContactDetailsScreenNavigationProp;
};

const ContactDetailsScreen: React.FC<ContactDetailsProps> = ({ route, navigation }) => {
  const { contact, updateContacts } = route.params; // Destructure updateContacts
  const [modalVisible, setModalVisible] = useState(false);
  const [editedContact, setEditedContact] = useState(contact);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // This seems unused in this component, but keeping it for consistency.
  const [loading, setLoading] = useState(false);

  // Update editedContact if route.params.contact changes (e.g., after an update)
  useEffect(() => {
    setEditedContact(contact);
  }, [contact]);

  const handleEdit = () => setModalVisible(true);
  
  const handleSave = async () => {
    if (!editedContact.nombre.trim() || !editedContact.telefono.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // No actual axios call
        // const csrfResponse = await axios.get('http://192.168.1.31:9000/csrf-token');
        // const csrfToken = csrfResponse.data.csrfToken;
        
        const updatedData = {
          ...contact,
          nombre: editedContact.nombre,
          telefono: editedContact.telefono,
          descripcion: editedContact.descripcion,
        };
        
        // Simulate successful update
        setEditedContact(updatedData);
        
        // Call the passed function to update contacts in the parent (EmergencyContactsScreen)
        if (updateContacts) {
          updateContacts(updatedData, 'edit');
        }

        setModalVisible(false);
        Alert.alert('Éxito', 'Contacto actualizado correctamente');
        
        // Regresar a la pantalla anterior automáticamente
        navigation.goBack();
        setLoading(false);
      }, 1000); // Simulate network delay
      
    } catch (error: any) {
      console.error('Error al actualizar contacto (simulado):', error);
      Alert.alert('Error', 'No se pudo actualizar el contacto (simulado)');
      setLoading(false);
    }
  };

  const getInitials = (nombre: string) => {
    if (!nombre.trim()) return 'CO';
    return nombre
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

      <SafeAreaView style={styles.container}>
        <Header
          onMenuPress={() => setSidebarOpen(true)}
          showBackButton
          onBackPress={() => navigation.goBack()}
          customTitle="Detalles de Contacto"
        />

        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>{getInitials(editedContact.nombre)}</Text>
            </View>
            <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
              <Feather name="edit" size={22} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{editedContact.nombre}</Text>
          <Text style={styles.phone}>{editedContact.telefono}</Text>
          <Text style={styles.relation}>{editedContact.descripcion}</Text>
        </View>
      </SafeAreaView>

      {/* Modal de Edición */}
      <Modal visible={modalVisible} animationType="slide">
        <LinearGradient
             colors={["#026b6b", "#2D353C"]}
             style={styles.backgroundImage}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 1 }}
           >
          <SafeAreaView style={styles.modalContainer}>

            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setModalVisible(false)}
              >
                <Feather name="arrow-left" size={24} color="#000" />
              </TouchableOpacity>

              <View style={styles.imageContainer}>
                <View style={styles.initialsContainer}>
                  <Text style={styles.initialsText}>{getInitials(editedContact.nombre)}</Text>
                </View>
              </View>

              <TextInput
                style={styles.input}
                value={editedContact.nombre}
                onChangeText={(text) => setEditedContact({ ...editedContact, nombre: text })}
                placeholder="Nombre"
              />
              <TextInput
                style={styles.input}
                value={editedContact.telefono}
                onChangeText={(text) => setEditedContact({ ...editedContact, telefono: text })}
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                value={editedContact.descripcion}
                onChangeText={(text) => setEditedContact({ ...editedContact, descripcion: text })}
                placeholder="Descripción"
              />

              <TouchableOpacity 
                style={[styles.saveButton, loading && { opacity: 0.7 }]} 
                onPress={handleSave}
                disabled={loading}
              >
                <Feather name="save" size={24} color="white" />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>

            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
      </LinearGradient>
  );
};

export default ContactDetailsScreen;