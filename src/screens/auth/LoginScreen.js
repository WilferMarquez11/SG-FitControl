import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { tema, modoOscuro, toggleTema } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa correo y contraseña");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const docRef = doc(db, "Usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.rol === "admin") {
          navigation.replace("PanelAdmin");
        } else if (data.rol === "user") {
          navigation.replace("PanelUser");
        } else if (data.rol === "coach") {
          navigation.replace("PanelCoach");
        } else {
          Alert.alert("⚠️ Error", "Rol no reconocido");
        }
      } else {
        if (user.email === "vitalsport@gmail.com") {
          await setDoc(doc(db, "Usuarios", user.uid), {
            email: user.email,
            rol: "admin",
            nombre: "Administrador"
          });
          navigation.replace("PanelAdmin");
        } else {
          Alert.alert("⚠️ Error", "El usuario no tiene rol definido");
        }
      }

    } catch (error) {
      console.error("Error Firebase:", error.message);
      Alert.alert("❌ Error", "Correo o contraseña incorrectos");
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
          : require('../../../assets/1LogoIconoPrincipal.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.subtitle, { color: tema.texto }]}>
        ¡Ingresa ahora mismo!
      </Text>

      {/* Input Correo */}
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="email" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Correo Electrónico"
          placeholderTextColor={tema.placeholder}
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <Text style={[styles.hint, { color: tema.subtexto }]}>
        Ejemplo: nombre@gmail.com
      </Text>

      {/* Input Contraseña */}
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <MaterialIcons name="lock" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Contraseña"
          placeholderTextColor={tema.placeholder}
          value={password}
          onChangeText={setPassword}
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
      <Text style={[styles.hint, { color: tema.subtexto }]}>
        Debe tener al menos 6 caracteres
      </Text>

      {/* Botón Iniciar Sesión */}
      <TouchableOpacity
        style={[styles.btnPrimario, { backgroundColor: tema.botonPrimario }]}
        onPress={handleLogin}
      >
        <Text style={[styles.btnPrimarioTexto, { color: tema.botonPrimarioTexto }]}>
          Iniciar Sesión
        </Text>
      </TouchableOpacity>

      {/* Botón Crear Cuenta */}
      <TouchableOpacity
        style={[styles.btnSecundario, { borderColor: tema.botonSecundarioBorde }]}
        onPress={() => navigation.navigate("Registrar")}
      >
        <Text style={[styles.btnSecundarioTexto, { color: tema.botonSecundarioTexto }]}>
          Crear Cuenta
        </Text>
      </TouchableOpacity>

      {/* Olvidé contraseña */}
      <TouchableOpacity onPress={() => navigation.navigate("Recuperar")}>
        <Text style={[styles.forgotPassword, { color: tema.acento }]}>
          Olvidé mi contraseña
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.byText, { color: tema.subtexto }]}>By</Text>
        <Text style={[styles.companyText, { color: tema.texto }]}>WO Devs</Text>
      </View>

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
  logo: { width: 160, height: 160, marginBottom: 10 },
  subtitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 25 },
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
  hint: { fontSize: 12, alignSelf: 'flex-start', marginBottom: 14, marginLeft: 4 },
  btnPrimario: {
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  btnPrimarioTexto: { fontSize: 18, fontWeight: 'bold' },
  forgotPassword: { fontSize: 14, textDecorationLine: 'underline', marginBottom: 20 },
  footer: { marginTop: 100, alignItems: 'center' },
  byText: { fontSize: 14 },
  companyText: { fontSize: 16, fontWeight: 'bold' },

  btnSecundario: {
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  btnSecundarioTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});