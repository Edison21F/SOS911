import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { styles } from "./profileStyles";
import { AntDesign } from "@expo/vector-icons";
import Header from "../../components/Header/Header";
import CustomSidebar from "../../components/Sidebar/Sidebar";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
// import axios from 'axios'; // Commented out
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Commented out


// axios.defaults.withCredentials = true; // Commented out

// Hardcoded initial profile data
const HARDCODED_PROFILE_DATA = {
  id: 'cliente_mock_1',
  nombre: 'Ismael Vargas',
  correo_electronico: 'ismael@gmail.com',
  cedula_identidad: '1234567890',
  direccion: 'Calle Ficticia 123, Ciudad Ficticia',
  fecha_nacimiento: '1990-05-15', // Added birth date
};

// Hardcoded initial phone numbers - ONLY PRINCIPAL
const HARDCODED_PHONE_NUMBERS = [
  { id: 101, detalle: 'Principal', numero: '+593991112233' },
  // Removed Trabajo number
];

const ProfileScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState(""); // Para comparar si cambió
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState(""); // Para nueva contraseña
  const [idNumber, setIdNumber] = useState("");
  const [birthDate, setBirthDate] = useState(""); // New state for birth date
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newPhoneDetail, setNewPhoneDetail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneList, setPhoneList] = useState([] as { id: number; detalle: string; numero: string }[]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editPhoneIndex, setEditPhoneIndex] = useState<number | null>(null);
  const [isLoadingPhones, setIsLoadingPhones] = useState(false); // Can keep this true initially if you want to simulate phone loading
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Cargar datos del cliente al inicializar (simulado)
  useEffect(() => {
    const loadClientProfile = async () => {
      try {
        setIsLoading(true);

        // Simulate fetching clienteId from AsyncStorage or similar
        // const storedClienteId = await AsyncStorage.getItem('clienteId');
        const storedClienteId = HARDCODED_PROFILE_DATA.id; // Hardcoded
        if (!storedClienteId) {
          Alert.alert('Error', 'No se encontró el ID del cliente (simulado).');
          return;
        }

        setClienteId(storedClienteId);

        // Simulate getting CSRF token
        // const csrfResponse = await axios.get('http://192.168.1.31:9000/csrf-token');
        // const csrfToken = csrfResponse.data.csrfToken;
        const csrfToken = 'mock-csrf-token'; // Hardcoded

        // Simulate fetching client data
        // const response = await axios.get(...);
        const clienteData = HARDCODED_PROFILE_DATA; // Hardcoded

        if (clienteData) {
          console.log('Datos del cliente cargados (simulado):', clienteData);

          const nombre = clienteData.nombre || '';
          const correo = clienteData.correo_electronico || '';
          const cedula = clienteData.cedula_identidad || '';
          const direccion = clienteData.direccion || '';
          const fechaNacimiento = clienteData.fecha_nacimiento || ''; // Load birth date

          setFullName(nombre);
          setEmail(correo);
          setOriginalEmail(correo);
          setIdNumber(cedula);
          setAddress(direccion);
          setBirthDate(fechaNacimiento); // Set birth date

          console.log('Email cargado (simulado):', correo);
          console.log('Nombre cargado (simulado):', nombre);

          if (!correo.trim()) {
            Alert.alert(
              'Perfil incompleto',
              'Tu perfil no tiene un correo electrónico registrado (simulado). Por favor actualízalo.',
              [{ text: 'OK' }]
            );
          }
        } else {
          console.error('No se recibieron datos del cliente (simulado)');
          Alert.alert('Error', 'No se pudieron cargar los datos del perfil (simulado)');
        }

        // Simulate loading phone numbers
        await loadPhoneNumbers(storedClienteId, csrfToken);

      } catch (error) {
        console.error('Error al cargar perfil del cliente (simulado):', error);
        Alert.alert('Error', 'Error inesperado al cargar el perfil (simulado)');
      } finally {
        setIsLoading(false);
      }
    };

    loadClientProfile();
  }, []);

  // Función para cargar números de teléfono (simulado)
  const loadPhoneNumbers = async (clienteId: string, csrfToken: string) => {
    try {
      setIsLoadingPhones(true);
      // Simulate API call
      // const response = await axios.get(...);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      // const mappedPhones = response.data.map(...);
      setPhoneList(HARDCODED_PHONE_NUMBERS); // Use hardcoded data (now only Principal)
    } catch (error) {
      console.error('Error al cargar números de teléfono (simulado):', error);
      setPhoneList([]);
    } finally {
      setIsLoadingPhones(false);
    }
  };

  // Función para validar el teléfono
  const validatePhone = (phone: string): boolean => {
    // Acepta números con o sin +, de 7 a 15 dígitos
    const phoneRegex = /^[+]?[\d\s\-\(\)]{7,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Limpia espacios, guiones y paréntesis
    return phoneRegex.test(phone) && cleanPhone.length >= 7 && cleanPhone.length <= 15;
  };


  const addPhone = async () => {
    if (!clienteId) {
      Alert.alert('Error', 'No se encontró el ID del cliente (simulado).');
      return;
    }

    if (!newPhone.trim() || !newPhoneDetail.trim()) {
      setPhoneError("Por favor completa todos los campos");
      return;
    }

    if (!validatePhone(newPhone)) {
      setPhoneError("Formato de teléfono inválido");
      return;
    }

    // Verificar si ya existe el número
    const phoneExists = phoneList.some(phone => phone.numero === newPhone.trim());
    if (phoneExists) {
      setPhoneError("Este número ya está registrado");
      return;
    }

    try {
      setIsSavingPhone(true);

      // Simulate API call and delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // const csrfResponse = await axios.get(...);
      // const csrfToken = csrfResponse.data.csrfToken;

      // const phoneData = {...};
      // const response = await axios.post(...);

      // Simulate successful response and update local list
      const newId = Math.floor(Math.random() * 100000) + 200; // Generate a "unique" ID
      const newPhoneEntry = {
        id: newId,
        detalle: newPhoneDetail.trim(),
        numero: newPhone.trim()
      };
      setPhoneList(prev => [...prev, newPhoneEntry]); // Update state directly

      setNewPhone("");
      setNewPhoneDetail("");
      setPhoneError("");
      setShowPhoneModal(false);

      Alert.alert('Éxito', 'Número de teléfono agregado correctamente (simulado).');

    } catch (error) {
      console.error('Error al agregar teléfono (simulado):', error);
      Alert.alert('Error', 'No se pudo agregar el número de teléfono (simulado). Por favor, inténtalo nuevamente.');
    } finally {
      setIsSavingPhone(false);
    }
  };


  const editPhone = async () => {
    if (!clienteId || editPhoneIndex === null) {
      Alert.alert('Error', 'Error en la edición del teléfono (simulado).');
      return;
    }

    if (!newPhone.trim() || !newPhoneDetail.trim()) {
      setPhoneError("Por favor completa todos los campos");
      return;
    }

    if (!validatePhone(newPhone)) {
      setPhoneError("Formato de teléfono inválido");
      return;
    }

    const phoneToEdit = phoneList[editPhoneIndex];

    // Verificar si ya existe el número (excluyendo el que se está editando)
    const phoneExists = phoneList.some((phone, index) =>
      phone.numero === newPhone.trim() && index !== editPhoneIndex
    );
    if (phoneExists) {
      setPhoneError("Este número ya está registrado");
      return;
    }

    try {
      setIsSavingPhone(true);

      // Simulate API call and delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // const csrfResponse = await axios.get(...);
      // const csrfToken = csrfResponse.data.csrfToken;

      // const phoneData = {...};
      // await axios.put(...);

      // Actualizar la lista local
      const updatedPhoneList = [...phoneList];
      updatedPhoneList[editPhoneIndex] = {
        ...phoneToEdit,
        numero: newPhone.trim(),
        detalle: newPhoneDetail.trim()
      };
      setPhoneList(updatedPhoneList);


      setNewPhone("");
      setNewPhoneDetail("");
      setPhoneError("");
      setShowPhoneModal(false);
      setEditPhoneIndex(null);

      Alert.alert('Éxito', 'Número de teléfono actualizado correctamente');

    } catch (error) {
      console.error('Error al actualizar teléfono (simulado):', error);
      Alert.alert('Error', 'No se pudo actualizar el número de teléfono (simulado). Por favor, inténtalo nuevamente.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Función para eliminar un número de teléfono (simulado)
  const deletePhone = (index: number) => {
    const phoneToDelete = phoneList[index];

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el número ${phoneToDelete.numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Simulate API call and delay
              await new Promise(resolve => setTimeout(resolve, 500));

              // const csrfResponse = await axios.get(...);
              // const csrfToken = csrfResponse.data.csrfToken;

              // await axios.delete(...);

              const updatedPhoneList = phoneList.filter((_, i) => i !== index);
              setPhoneList(updatedPhoneList); // Update state directly

              Alert.alert('Éxito', 'Número de teléfono eliminado correctamente (simulado).');

            } catch (error) {
              console.error('Error al eliminar teléfono (simulado):', error);
              Alert.alert('Error', 'No se pudo eliminar el número de teléfono (simulado). Por favor, inténtalo nuevamente.');
            }
          }
        }
      ]
    );
  };


  const openAddPhoneModal = () => {
    setNewPhone("");
    setNewPhoneDetail("");
    setPhoneError("");
    setEditPhoneIndex(null);
    setShowPhoneModal(true);
  };

  // Función para abrir el modal de editar teléfono
  const openEditPhoneModal = (index: number) => {
    const phone = phoneList[index];
    setNewPhone(phone.numero);
    setNewPhoneDetail(phone.detalle);
    setPhoneError("");
    setEditPhoneIndex(index);
    setShowPhoneModal(true);
  };

  // Función para cerrar el modal de teléfono
  const closePhoneModal = () => {
    setShowPhoneModal(false);
    setNewPhone("");
    setNewPhoneDetail("");
    setPhoneError("");
    setEditPhoneIndex(null);
  };


  const handleSavePhone = () => {
    if (editPhoneIndex !== null) {
      editPhone();
    } else {
      addPhone();
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleSavePress = async () => {
    if (!clienteId) {
      Alert.alert('Error', 'No se encontró el ID del cliente (simulado)');
      return;
    }

    try {
      setIsSaving(true);

      console.log('Guardando perfil con email (simulado):', email);
      console.log('Email original (simulado):', originalEmail);

      // Validaciones básicas
      if (!fullName.trim()) {
        Alert.alert('Error', 'El nombre es obligatorio');
        return;
      }

      if (!email.trim()) {
        Alert.alert('Error', 'El correo electrónico es obligatorio');
        return;
      }

      // Validar formato de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('Error', 'El formato del correo electrónico no es válido');
        return;
      }

      if (!idNumber.trim()) {
        Alert.alert('Error', 'El número de identificación es obligatorio');
        return;
      }

      if (!birthDate.trim()) { // Validate birth date
        Alert.alert('Error', 'La fecha de nacimiento es obligatoria');
        return;
      }
      // Basic date format validation (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate.trim())) {
        Alert.alert('Error', 'El formato de la fecha de nacimiento debe ser AAAA-MM-DD');
        return;
      }


      // Simulate API call and delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // const csrfResponse = await axios.get(...);
      // const csrfToken = csrfResponse.data.csrfToken;

      // const updateData: any = {...}; // This would include birthDate
      // if (password.trim()) {...}

      // const response = await axios.put(...);

      // Simulate successful response
      // if (response.status === 200) {
        setOriginalEmail(email.trim());
        Alert.alert(
          'Éxito',
          'Perfil actualizado correctamente (simulado)',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsEditing(false);
                setPassword('');
              }
            }
          ]
        );
      // }

    } catch (error) {
      console.error('Error al actualizar perfil (simulado):', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil (simulado)');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <LinearGradient
        colors={['#026b6b', '#2D353C']}
        style={styles.backgroundImage}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.container}>
          <Header onMenuPress={() => setSidebarOpen(true)} customTitle="Ver Perfil" />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', marginTop: 16, fontSize: 16 }}>
              Cargando perfil...
            </Text>
          </View>
        </View>
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
      <View style={styles.container}>
        <Header onMenuPress={() => setSidebarOpen(true)} customTitle="Ver Perfil" />

        <View style={styles.profileContainer}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{getInitials(fullName)}</Text>
            </View>
          </View>
          {!isEditing ? (
            <TouchableOpacity style={[styles.editButton, styles.editButtonStyled]} onPress={handleEditPress}>
              <Feather name="edit" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          ) : null}
        </View>


        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            editable={isEditing}
            placeholder="Ingresa tu nombre completo"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            keyboardType="email-address"
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />

          <Text style={styles.label}>Número de identificación</Text>
          <TextInput
            style={styles.input}
            value={idNumber}
            onChangeText={setIdNumber}
            editable={isEditing}
            keyboardType="numeric"
            placeholder="Ingresa tu número de identificación"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />

          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            editable={isEditing}
            placeholder="Ingresa tu dirección"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />

          {/* New field: Fecha de Nacimiento */}
          <Text style={styles.label}>Fecha de Nacimiento</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            editable={isEditing}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            keyboardType="numbers-and-punctuation" // Suggests numbers and hyphens
          />

          <View style={styles.phoneSectionContainer}>
            <Text style={styles.phoneSectionTitleText}>Teléfono</Text>
            {isLoadingPhones ? (
              <View style={styles.phoneLoadingView}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.phoneLoadingMessage}>Cargando números...</Text>
              </View>
            ) : phoneList.length > 0 ? (
              phoneList.map((item, idx) => (
                <TouchableOpacity
                  key={item.id || idx} // Use item.id for key if available, fallback to idx
                  style={styles.phoneItemContainer}
                  onPress={() => openEditPhoneModal(idx)}
                  onLongPress={() => deletePhone(idx)}
                >
                  <Text style={styles.phoneItemTitleText}>{item.detalle}:</Text>
                  <Text style={styles.phoneItemNumberText}>{item.numero}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noPhoneContainer}>
                <Text style={styles.noPhoneText}>No hay números registrados</Text>
              </View>
            )}
          </View>

          {isEditing && (
            <>
              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={isEditing}
                placeholder="Nueva contraseña"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
              />
            </>
          )}

          {isEditing && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButtonEdit,
                isSaving ? styles.saveButtonEditDisabled : null
              ]}
              onPress={handleSavePress}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Guardando...</Text>
                </>
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.addPhoneSection}>
          <Text style={styles.addPhonePrompt}>
            {phoneList.length === 0 ? '¿Quieres agregar un número de teléfono?' : '¿Quieres agregar otro número?'}
          </Text>
          <TouchableOpacity
            style={styles.addPhoneBtn}
            onPress={openAddPhoneModal}
          >
            <Feather name="phone" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addPhoneBtnText}>Agregar Teléfono</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showPhoneModal}
          animationType="fade"
          transparent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboardAvoidingView}
          >
            <View style={styles.modalContentContainer}>
              <Text style={styles.modalTitleText}>{typeof editPhoneIndex === 'number' ? 'Editar Teléfono' : 'Agregar Teléfono'}</Text>
              {/* Campo Detalle */}
              <View style={styles.modalInputContainer}>
                <Feather name="tag" size={20} color="#137C6B" style={styles.modalInputIcon} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Detalle (Ej: Principal)"
                  placeholderTextColor="#aaa"
                  value={newPhoneDetail}
                  onChangeText={setNewPhoneDetail}
                  maxLength={20}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Feather name="phone" size={20} color="#137C6B" style={styles.modalInputIcon} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Número de teléfono"
                  placeholderTextColor="#aaa"
                  keyboardType="phone-pad"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  maxLength={15}
                />
              </View>
              {phoneError ? <Text style={{ color: 'red', marginBottom: 8 }}>{phoneError}</Text> : null}
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSavePhone}
                disabled={isSavingPhone}
              >
                {isSavingPhone ? (
                  <ActivityIndicator size="small" color="#fff" style={styles.modalSaveBtnIcon} />
                ) : (
                  <Feather name="plus" size={18} color="#fff" style={styles.modalSaveBtnIcon} />
                )}
                <Text style={styles.modalSaveBtnText}>
                  {isSavingPhone ? 'Guardando...' : (typeof editPhoneIndex === 'number' ? 'Guardar Cambios' : 'Guardar')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={closePhoneModal}
              >
                <Feather name="x-circle" size={18} color="#137C6B" style={styles.modalCancelBtnIcon} />
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
      <CustomSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </LinearGradient>
  );
};

const localStyles = StyleSheet.create({
  profileImageContainer: {
    position: "relative",
  },
});

export default ProfileScreen;