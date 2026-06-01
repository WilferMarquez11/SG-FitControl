import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";
import { palette } from '../../theme/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const TIPOS_DOCUMENTO = [
  { label: 'Seleccionar...', value: '' },
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Tarjeta de Identidad', value: 'TI' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PAS' },
];

export default function RegisterScreen({ navigation }) {
  const [nombreGym, setNombreGym] = useState('');
  const [representante, setRepresentante] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const { tema, modoOscuro, toggleTema } = useTheme();

  const handleRegister = async () => {
    // Validaciones obligatorias
    if (!nombreGym.trim() || !representante.trim() || !tipoDocumento || !numeroDocumento.trim() || !email.trim() || !password || !confirmarPassword) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }
    if (password !== confirmarPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Fecha y hora
      const ahora = new Date();
      const fechaRegistro = {
        fecha: ahora.toLocaleDateString('es-CO'),
        hora: ahora.toLocaleTimeString('es-CO'),
      };

      await setDoc(doc(db, "Usuarios", user.uid), {
        nombreGym: nombreGym.trim(),
        representante: representante.trim(),
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        telefono: telefono.trim(),        // opcional
        email: user.email.trim(),
        role: "cliente",
        fechaRegistro: fechaRegistro,
      });

      Alert.alert("✅ Éxito", "Cuenta creada correctamente", [
        { text: "Iniciar Sesión", onPress: () => navigation.replace("Login") }
      ]);
    } catch (error) {
      console.error("Error registro:", error.message);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("❌ Error", "Este correo ya está registrado");
      } else {
        Alert.alert("❌ Error", "No se pudo crear la cuenta");
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      style={[styles.scroll, { backgroundColor: tema.fondo }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      {/* Toggle tema */}
      <TouchableOpacity style={styles.temaBtn} onPress={toggleTema}>
        <MaterialIcons
          name={modoOscuro ? "wb-sunny" : "nightlight-round"}
          size={26}
          color={modoOscuro ? tema.acento : tema.texto}
        />
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={modoOscuro
          ? require('../../../assets/2LogoIconoPrincipal.png')
          : require('../../../assets/1LogoPrincipal.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.titulo, { color: tema.texto }]}>
        ¡Crea tu cuenta ahora mismo!
      </Text>

      {/* Nombre del Gym */}
      <Text style={[styles.label, { color: tema.texto }]}>
        Nombre del Gym <Text style={styles.requerido}>*</Text>
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="fitness-center" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Ejemplo: VITALSPORT"
          placeholderTextColor={tema.placeholder}
          value={nombreGym}
          onChangeText={(text) => setNombreGym(text.toUpperCase())}
          autoCapitalize="characters"
        />
      </View>

      {/* Representante Legal */}
      <Text style={[styles.label, { color: tema.texto }]}>
        Representante Legal <Text style={styles.requerido}>*</Text>
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="person" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Ejemplo: JUAN PÉREZ"
          placeholderTextColor={tema.placeholder}
          value={representante}
          onChangeText={(text) => setRepresentante(text.toUpperCase())}
          autoCapitalize="characters"
        />
      </View>

      {/* Tipo Documento */}
      <Text style={[styles.label, { color: tema.texto }]}>
        Tipo Documento <Text style={styles.requerido}>*</Text>
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="badge" size={22} color={tema.icono} style={styles.icon} />
        <Picker
          selectedValue={tipoDocumento}
          onValueChange={(value) => setTipoDocumento(value)}
          style={[styles.picker, { color: tipoDocumento ? tema.inputTexto : tema.placeholder }]}
          dropdownIconColor={tema.icono}
        >
          {TIPOS_DOCUMENTO.map((tipo) => (
            <Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} />
          ))}
        </Picker>
      </View>

      {/* Número Documento */}
      <Text style={[styles.label, { color: tema.texto }]}>
        Número Documento <Text style={styles.requerido}>*</Text>
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="numbers" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Ejemplo: 1111111111"
          placeholderTextColor={tema.placeholder}
          value={numeroDocumento}
          onChangeText={(text) => setNumeroDocumento(text.trim())}
          keyboardType="numeric"
        />
      </View>

      {/* Teléfono — opcional */}
      <Text style={[styles.label, { color: tema.texto }]}>
        Teléfono <Text style={[styles.opcional, { color: tema.subtexto }]}>(opcional)</Text>
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="phone" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Ejemplo: 3001234567"
          placeholderTextColor={tema.placeholder}
          value={telefono}
          onChangeText={(text) => setTelefono(text.trim())}
          keyboardType="phone-pad"
        />
      </View>

      {/* Correo Electrónico */}
      <Text style={[styles.label, { color: tema.texto }]}>
        Correo Electrónico <Text style={styles.requerido}>*</Text>
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="email" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Ejemplo: nombre@gmail.com"
          placeholderTextColor={tema.placeholder}
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase().trim())}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Contraseña */}
      <Text style={[styles.label, { color: tema.texto }]}>
        Contraseña <Text style={styles.requerido}>*</Text>
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="lock" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Mínimo 6 caracteres (sin espacios)"
          placeholderTextColor={tema.placeholder}
          value={password}
          onChangeText={(text) => {
            if (/\s/.test(text)) {
              Alert.alert("⚠️ Error", "La contraseña no puede contener espacios");
            } else {
              setPassword(text);
            }
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialIcons
            name={showPassword ? 'visibility' : 'visibility-off'}
            size={22}
            color={tema.icono}
          />
        </TouchableOpacity>
      </View>

      {/* Confirmar Contraseña */}
      <Text style={[styles.label, { color: tema.texto }]}>
        Confirmar Contraseña <Text style={styles.requerido}>*</Text>
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="lock-outline" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Repite tu contraseña"
          placeholderTextColor={tema.placeholder}
          value={confirmarPassword}
          onChangeText={(text) => {
            if (/\s/.test(text)) {
              Alert.alert("⚠️ Error", "La contraseña no puede contener espacios");
            } else {
              setConfirmarPassword(text);
            }
          }}
          secureTextEntry={!showConfirmar}
        />
        <TouchableOpacity onPress={() => setShowConfirmar(!showConfirmar)}>
          <MaterialIcons
            name={showConfirmar ? 'visibility' : 'visibility-off'}
            size={22}
            color={tema.icono}
          />
        </TouchableOpacity>
      </View>

      {/* Leyenda campos obligatorios */}
      <Text style={[styles.leyenda, { color: tema.subtexto }]}>
        <Text style={styles.requerido}>*</Text> Campos obligatorios
      </Text>

      {/* Botón Crear Cuenta */}
      <TouchableOpacity
        style={[styles.btnPrimario, { backgroundColor: tema.botonPrimario }]}
        onPress={handleRegister}
      >
        <Text style={[styles.btnPrimarioTexto, { color: tema.botonPrimarioTexto }]}>
          Crear Cuenta
        </Text>
      </TouchableOpacity>

      {/* Volver al Login */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={[styles.volverLogin, { color: tema.acento }]}>
          ¿Ya tienes cuenta? Inicia Sesión
        </Text>
      </TouchableOpacity>



    </KeyboardAwareScrollView>
  );

}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  temaBtn: { position: 'absolute', top: 50, right: 20 },
  logo: { width: 110, height: 110, marginBottom: 10 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 4, marginTop: 10 },
  requerido: { color: palette.rojo, fontWeight: 'bold' },
  opcional: { fontSize: 12, fontWeight: '400' },
  leyenda: { fontSize: 12, alignSelf: 'flex-start', marginTop: 8, marginBottom: 4 },
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
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  picker: { flex: 1, fontSize: 16 },
  btnPrimario: {
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  btnPrimarioTexto: { fontSize: 18, fontWeight: 'bold' },
  volverLogin: { fontSize: 14, textDecorationLine: 'underline', marginBottom: 80 },
  byText: { fontSize: 14 },
  companyText: { fontSize: 16, fontWeight: 'bold' },
});