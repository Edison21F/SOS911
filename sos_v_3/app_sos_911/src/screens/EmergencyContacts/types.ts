import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/Navigator';

export interface Contact {
  id: string;
  nombre: string;
  telefono: string;
  descripcion: string;
}

export interface EmergencyContactsProps {
  navigation: NavigationProp<RootStackParamList, 'EmergencyContacts'>;
}
