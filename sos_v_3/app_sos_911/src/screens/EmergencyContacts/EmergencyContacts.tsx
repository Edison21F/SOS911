import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, Trash2, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Commented out
// import axios from 'axios'; // Commented out
import { useFocusEffect } from '@react-navigation/native';
import CustomSidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { styles, theme } from './EmergencyContactsStyles';
import { normalize } from '../../utils/dimensions';

interface Contact {
  id: string;
  nombre: string;
  telefono: string;
  descripcion: string;
}

// Hardcoded initial contacts
const initialContacts: Contact[] = [
  { id: '1', nombre: 'Juan Pérez', telefono: '+593991234567', descripcion: 'Amigo Cercano' },
  { id: '2', nombre: 'María García', telefono: '+593987654321', descripcion: 'Madre' },
  { id: '3', nombre: 'Carlos López', telefono: '+593965432109', descripcion: 'Hermano' },
];

const EmergencyContactsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [loading, setLoading] = useState(false); // Set to false for hardcoded data
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate fetching contacts
    setLoading(true);
    setTimeout(() => {
      // In a real app, you might load from local storage or a mock backend here
      setLoading(false);
    }, 1000);
  }, []);

  // Recargar contactos cuando la pantalla se enfoca (regresa de otras pantallas)
  useFocusEffect(
    React.useCallback(() => {
      // In a real app, you would re-fetch or update state from a shared source
      // For hardcoded, we can just ensure the state is consistent if changes happen elsewhere
      console.log("EmergencyContactsScreen focused, contacts updated if any changes from Add/Edit");
      // If ContactDetails or AddContact modify a global state, you'd reflect it here.
      // For this example, we'll rely on navigation.navigate's params or direct state manipulation.
    }, [])
  );

  // This function will now be passed to AddContact and ContactDetails
  // to update the contacts array in this component
  const updateContacts = (updatedContact: Contact | null, type: 'add' | 'edit' | 'delete') => {
    if (type === 'add' && updatedContact) {
      setContacts(prevContacts => [...prevContacts, updatedContact]);
    } else if (type === 'edit' && updatedContact) {
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === updatedContact.id ? updatedContact : contact
        )
      );
    } else if (type === 'delete' && updatedContact) {
      setContacts(prevContacts => prevContacts.filter(contact => contact.id !== updatedContact.id));
    }
  };

  const handleDelete = (contactToDelete: Contact) => {
    Alert.alert(
      `Eliminar a ${contactToDelete.nombre}`,
      '¿Estás seguro de que quieres eliminar este contacto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              updateContacts(contactToDelete, 'delete');
              Alert.alert('Éxito', 'Contacto eliminado correctamente');
              setLoading(false);
            }, 500); // Simulate network delay
          },
        },
      ],
    );
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

  const renderContactCard = (contact: Contact) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ContactDetails', { contact, updateContacts })}
    >
      <View style={styles.contactImageContainer}>
        <View style={styles.initialsContainer}>
          <Text style={styles.initialsText}>{getInitials(contact.nombre)}</Text>
        </View>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.nombre}</Text>
        <Text style={styles.contactRelation}>{contact.descripcion}</Text>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity onPress={() => handleDelete(contact)} style={styles.deleteButton}>
          <Trash2 size={normalize(20)} color={theme.colors.danger} />
        </TouchableOpacity>
        <ChevronRight size={normalize(22)} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#026b6b', '#2D353C']}
        style={styles.backgroundImage}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header onMenuPress={() => setSidebarOpen(true)} customTitle="Contactos de Emergencia" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0891b2" />
            <Text style={styles.loadingText}>Cargando contactos...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
   <LinearGradient
  colors={['#026b6b', '#2D353C']} // Updated colors
  style={styles.backgroundImage}
  start={{ x: 0, y: 0 }} // Updated start point
  end={{ x: 1, y: 1 }}   // Updated end point
>
      <SafeAreaView style={styles.safeArea}>
        <Header onMenuPress={() => setSidebarOpen(true)} customTitle="Contactos de Emergencia" />
        <ScrollView contentContainerStyle={styles.content}>
          {contacts.map(renderContactCard)}
        </ScrollView>
        <TouchableOpacity
          style={styles.addButtonContainer}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AddContact', { updateContacts })}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryAlt]}
            style={styles.addButton}
          >
            <Plus size={normalize(28)} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        <CustomSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default EmergencyContactsScreen;