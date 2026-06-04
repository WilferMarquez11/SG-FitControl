import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase/firebaseConfig';
import { useTheme } from '../../../src/theme/useTheme';

export default function Recuperar({ navigation }) {
  const { tema } = useTheme();
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);

  const manejarRecuperacion = async () => {
    if (!correo.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, correo.trim().toLowerCase());
      Alert.alert('✅ Correo enviado', 'Revisa tu bandeja de entrada o la carpeta Spam.');
      navigation.navigate('Login');
    } catch (error) {
      console.log('ERROR FIREBASE:', error);
      console.log('ERROR CODE:', error.code);

      switch (error.code) {
        case 'auth/user-not-found':
          Alert.alert('Usuario no encontrado', 'No existe una cuenta registrada con ese correo.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Correo inválido', 'El correo ingresado no es válido.');
          break;
        case 'auth/too-many-requests':
          Alert.alert('Demasiados intentos', 'Intenta nuevamente más tarde.');
          break;
        default:
          Alert.alert('Error', 'Ocurrió un problema al enviar el correo.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: tema.fondo }]}
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require('../../../assets/LogoGym.jpg')}
        style={styles.logoImage}
        resizeMode="contain"
      />

      <View style={styles.separatorContainer}>
        <View style={[styles.line, { backgroundColor: tema.inputBorder }]} />
        <Text style={[styles.separatorText, { color: tema.texto }]}>0</Text>
        <View style={[styles.line, { backgroundColor: tema.inputBorder }]} />
      </View>

      <Text style={[styles.titulo, { color: tema.texto }]}>
        Recupera tu contraseña
      </Text>

      <Text style={[styles.instruccion, { color: tema.subtexto }]}>
        Ingresa el correo asociado a tu cuenta para enviarte un enlace de recuperación.
      </Text>

      <View style={[styles.inputContainer, {
        backgroundColor: tema.inputBg,
        borderColor: tema.inputBorder,
      }]}>
        <Icon name="email" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.entrada, { color: tema.inputTexto }]}
          placeholder="Correo Electrónico"
          placeholderTextColor={tema.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={correo}
          onChangeText={(texto) => setCorreo(texto.toLowerCase())}
        />
      </View>

      <Text style={[styles.inputHint, { color: tema.subtexto }]}>
        Ejemplo: nombre@gmail.com
      </Text>

      <TouchableOpacity
        style={[styles.boton, { backgroundColor: tema.botonPrimario }, loading && { opacity: 0.7 }]}
        onPress={manejarRecuperacion}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={tema.botonPrimarioTexto} />
        ) : (
          <Text style={[styles.botonTexto, { color: tema.botonPrimarioTexto }]}>
            Enviar Enlace
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.volver, { color: tema.acento }]}>
          Volver al Inicio de Sesión
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.byText, { color: tema.texto }]}>By</Text>
        <Text style={[styles.companyText, { color: tema.texto }]}>WO Devs</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contenedor: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  logoImage: {
    width: 160,
    height: 160,
    marginBottom: 10,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  instruccion: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '100%',
    height: 50,
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  entrada: {
    flex: 1,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginLeft: 4,
  },
  boton: {
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  botonTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  volver: {
    fontSize: 15,
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  byText: {
    fontSize: 14,
  },
  companyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});