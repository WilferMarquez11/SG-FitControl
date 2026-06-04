import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { doc, setDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function RegistrarCliente({ navigation, route }) {
  const rol = route?.params?.rol || "admin";
  const panelHome = rol === "entrenador" ? "PanelEntrenador" : "PanelUser";

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [sexo, setSexo] = useState("");
  const [email, setEmail] = useState("");

  const { tema, modoOscuro, toggleTema } = useTheme();

  const handleRegistrar = async () => {
    if (!nombre || !telefono || !direccion || !sexo || !email) {
      Alert.alert("⚠️ Campos incompletos", "Por favor llena todos los campos");
      return;
    }
    try {
      const nuevoDoc = doc(collection(db, "Clientes"));
      await setDoc(nuevoDoc, {
        nombre,
        telefono,
        direccion,
        sexo,
        email,
        rol: "cliente",
        fechaRegistro: Timestamp.now(),
      });
      Alert.alert("✅ Éxito", "Cliente registrado correctamente");
      setNombre("");
      setTelefono("");
      setDireccion("");
      setSexo("");
      setEmail("");
      navigation.replace("RegistrarMembresias", { rol });
    } catch (error) {
      console.error("Error al registrar cliente:", error.message);
      Alert.alert("❌ Error", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={tema.icono} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tema.texto }]}>Registrar Clientes</Text>
        <TouchableOpacity onPress={toggleTema}>
          <Icon
            name={modoOscuro ? "weather-night" : ""}
            size={24}
            color={tema.acento}
          />
        </TouchableOpacity>
      </View>

      {/* ICONO */}
      <View style={styles.iconContainer}>
        <Icon name="account-plus" size={56} color={tema.acento} />
      </View>

      {/* FORMULARIO CON SCROLL */}
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={100}
      >

        <Text style={[styles.label, { color: tema.texto }]}>Nombre</Text>
        <TextInput
          style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
          placeholder="Ejemplo: Juan Perez"
          placeholderTextColor={tema.placeholder}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={[styles.label, { color: tema.texto }]}>Teléfono</Text>
        <TextInput
          style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
          placeholder="Ejemplo: 1234567890"
          placeholderTextColor={tema.placeholder}
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: tema.texto }]}>Dirección de Residencia</Text>
        <TextInput
          style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
          placeholder="Ejemplo: Kr 14 12-47"
          placeholderTextColor={tema.placeholder}
          value={direccion}
          onChangeText={setDireccion}
        />

        <Text style={[styles.label, { color: tema.texto }]}>Sexo</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker
            selectedValue={sexo}
            onValueChange={setSexo}
            dropdownIconColor={tema.icono}
            style={{ color: tema.inputTexto }}
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Masculino" value="M" />
            <Picker.Item label="Femenino" value="F" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: tema.texto }]}>Correo Electrónico</Text>
        <TextInput
          style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
          placeholder="Ejemplo@gmail.com"
          placeholderTextColor={tema.placeholder}
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tema.botonPrimario }]}
          onPress={handleRegistrar}
        >
          <Text style={[styles.buttonText, { color: tema.botonPrimarioTexto }]}>
            Registrar
          </Text>
        </TouchableOpacity>

        {/* Espacio para que el botón no quede tapado por la barra inferior */}
        <View style={{ height: 100 }} />

      </KeyboardAwareScrollView>

      {/* BARRA INFERIOR */}
      <View style={[styles.bottomNav, { backgroundColor: tema.inputBg, borderTopColor: tema.inputBorder }]}>
        {[
          { icon: "home-outline", screen: panelHome },
          { icon: "account-group", screen: "GestionClientes" },
          { icon: "card-account-details", screen: "GestionMembresias" },
          { icon: "currency-usd", screen: "GestionPagos" },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item) => (
          <TouchableOpacity
            key={item.screen}
            onPress={() => navigation.navigate(item.screen, { rol })}
          >
            <Icon name={item.icon} size={28} color={tema.icono} />
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 30, paddingHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  iconContainer: { alignItems: "center", marginBottom: 10, marginTop: 6 },
  scroll: { flex: 1 },
  formContainer: { paddingBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  input: { borderRadius: 8, paddingHorizontal: 15, marginBottom: 6, height: 50, fontSize: 16, borderWidth: 1, elevation: 1 },
  pickerContainer: { borderRadius: 8, marginBottom: 6, height: 50, justifyContent: "center", borderWidth: 1, elevation: 1 },
  button: { borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  buttonText: { fontSize: 18, fontWeight: "bold" },
bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: "100%", elevation: 6, marginBottom: 20 },
});