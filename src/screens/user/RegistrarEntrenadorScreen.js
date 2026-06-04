import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";

const ESPECIALIDADES = ["Musculación", "Cardio", "Crossfit", "Yoga", "Funcional", "Pilates"];
const TURNOS = ["Mañana", "Tarde", "Noche"];

export default function RegistrarEntrenador({ navigation }) {
  const { tema } = useTheme();
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    sexo: "",
    especialidad: [],
    turno: "",
    contrasena: "",
    confirmarContrasena: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEspecialidad = (esp) => {
    const actuales = form.especialidad;
    if (actuales.includes(esp)) {
      handleChange("especialidad", actuales.filter((e) => e !== esp));
    } else {
      handleChange("especialidad", [...actuales, esp]);
    }
  };

  const validar = () => {
    const { nombre, telefono, correo, sexo, especialidad, turno, contrasena, confirmarContrasena } = form;
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (!telefono.trim() || telefono.length < 7) return "Ingresa un teléfono válido.";
    if (!correo.includes("@")) return "Ingresa un correo válido.";
    if (!sexo) return "Selecciona el sexo.";
    if (especialidad.length === 0) return "Selecciona al menos una especialidad.";
    if (!turno) return "Selecciona un turno.";
    if (contrasena.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (contrasena !== confirmarContrasena) return "Las contraseñas no coinciden.";
    return null;
  };

  const handleRegistrar = async () => {
    const error = validar();
    if (error) {
      Alert.alert("Campos incompletos", error);
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.correo.trim(),
        form.contrasena
      );
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "Usuarios", uid), {
        uid,
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim().toLowerCase(),
        sexo: form.sexo,
        especialidad: form.especialidad,
        turno: form.turno,
        rol: "entrenador",
        creadoEn: serverTimestamp(),
      });
      Alert.alert("¡Registrado!", `El entrenador ${form.nombre} fue registrado exitosamente.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      let mensaje = "Ocurrió un error al registrar.";
      if (err.code === "auth/email-already-in-use") mensaje = "Este correo ya está registrado.";
      if (err.code === "auth/invalid-email") mensaje = "Correo electrónico inválido.";
      Alert.alert("Error", mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: tema.fondo }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: tema.fondo }]}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: tema.inputBg, borderBottomColor: tema.inputBorder }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color={tema.icono} />
          </TouchableOpacity>
          <View style={[styles.headerIcon, { borderColor: tema.acento, backgroundColor: tema.fondo }]}>
            <Icon name="account-tie" size={36} color={tema.acento} />
          </View>
          <Text style={[styles.titulo, { color: tema.texto }]}>Registrar Entrenador</Text>
          <Text style={[styles.subtitulo, { color: tema.subtexto }]}>
            Completa los datos del nuevo entrenador
          </Text>
        </View>

        {/* DATOS PERSONALES */}
        <View style={[styles.seccion, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Text style={[styles.seccionTitulo, { color: tema.acento }]}>
            Datos Personales
          </Text>

          <Campo label="Nombre completo" icon="account-outline" placeholder="Ej: Carlos Pérez"
            value={form.nombre} onChangeText={(v) => handleChange("nombre", v)} tema={tema} />

          <Campo label="Teléfono" icon="phone-outline" placeholder="Ej: 3001234567"
            value={form.telefono} onChangeText={(v) => handleChange("telefono", v)}
            keyboardType="phone-pad" tema={tema} />

          <Campo label="Correo electrónico" icon="email-outline" placeholder="correo@ejemplo.com"
            value={form.correo} onChangeText={(v) => handleChange("correo", v)}
            keyboardType="email-address" autoCapitalize="none" tema={tema} />

          <Text style={[styles.label, { color: tema.subtexto }]}>Sexo</Text>
          <View style={styles.chipRow}>
            {["Masculino", "Femenino"].map((op) => (
              <TouchableOpacity
                key={op}
                style={[
                  styles.chip,
                  { backgroundColor: tema.fondo, borderColor: tema.inputBorder },
                  form.sexo === op && { backgroundColor: tema.acento, borderColor: tema.acento },
                ]}
                onPress={() => handleChange("sexo", op)}
              >
                <Icon
                  name={op === "Masculino" ? "gender-male" : "gender-female"}
                  size={16}
                  color={form.sexo === op ? "#fff" : tema.subtexto}
                />
                <Text style={[
                  styles.chipText,
                  { color: tema.subtexto },
                  form.sexo === op && { color: "#fff", fontWeight: "bold" },
                ]}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DATOS LABORALES */}
        <View style={[styles.seccion, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Text style={[styles.seccionTitulo, { color: tema.acento }]}>
            Datos Laborales
          </Text>

          <Text style={[styles.label, { color: tema.subtexto }]}>
            Especialidad <Text style={{ color: tema.acento }}>(puedes elegir varias)</Text>
          </Text>
          <View style={styles.chipGrid}>
            {ESPECIALIDADES.map((esp) => (
              <TouchableOpacity
                key={esp}
                style={[
                  styles.chip,
                  { backgroundColor: tema.fondo, borderColor: tema.inputBorder },
                  form.especialidad.includes(esp) && { backgroundColor: tema.acento, borderColor: tema.acento },
                ]}
                onPress={() => toggleEspecialidad(esp)}
              >
                <Text style={[
                  styles.chipText,
                  { color: tema.subtexto },
                  form.especialidad.includes(esp) && { color: "#fff", fontWeight: "bold" },
                ]}>{esp}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: tema.subtexto }]}>Turno</Text>
          <View style={styles.chipRow}>
            {TURNOS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.chip,
                  { backgroundColor: tema.fondo, borderColor: tema.inputBorder },
                  form.turno === t && { backgroundColor: tema.acento, borderColor: tema.acento },
                ]}
                onPress={() => handleChange("turno", t)}
              >
                <Icon
                  name={t === "Mañana" ? "weather-sunny" : t === "Tarde" ? "weather-partly-cloudy" : "weather-night"}
                  size={16}
                  color={form.turno === t ? "#fff" : tema.subtexto}
                />
                <Text style={[
                  styles.chipText,
                  { color: tema.subtexto },
                  form.turno === t && { color: "#fff", fontWeight: "bold" },
                ]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ACCESO AL SISTEMA */}
        <View style={[styles.seccion, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Text style={[styles.seccionTitulo, { color: tema.acento }]}>
            Acceso al Sistema
          </Text>

          <Text style={[styles.label, { color: tema.subtexto }]}>Contraseña</Text>
          <View style={[styles.inputRow, { backgroundColor: tema.fondo, borderColor: tema.inputBorder }]}>
            <Icon name="lock-outline" size={20} color={tema.subtexto} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: tema.inputTexto }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={tema.placeholder}
              secureTextEntry={!showPassword}
              value={form.contrasena}
              onChangeText={(v) => handleChange("contrasena", v)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color={tema.subtexto} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: tema.subtexto }]}>Confirmar contraseña</Text>
          <View style={[styles.inputRow, { backgroundColor: tema.fondo, borderColor: tema.inputBorder }]}>
            <Icon name="lock-check-outline" size={20} color={tema.subtexto} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: tema.inputTexto }]}
              placeholder="Repite la contraseña"
              placeholderTextColor={tema.placeholder}
              secureTextEntry={!showConfirm}
              value={form.confirmarContrasena}
              onChangeText={(v) => handleChange("confirmarContrasena", v)}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Icon name={showConfirm ? "eye-off" : "eye"} size={20} color={tema.subtexto} />
            </TouchableOpacity>
          </View>
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          style={[styles.btnRegistrar, { backgroundColor: tema.acento }, loading && { opacity: 0.7 }]}
          onPress={handleRegistrar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="account-plus" size={20} color="#fff" />
              <Text style={styles.btnText}>Registrar Entrenador</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ label, icon, placeholder, value, onChangeText, keyboardType, autoCapitalize, tema }) {
  return (
    <>
      <Text style={[styles.label, { color: tema.subtexto }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: tema.fondo, borderColor: tema.inputBorder }]}>
        <Icon name={icon} size={20} color={tema.subtexto} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder={placeholder}
          placeholderTextColor={tema.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "words"}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 20 },
  header: { padding: 24, paddingTop: 50, alignItems: "center", borderBottomWidth: 1 },
  backBtn: { position: "absolute", top: 50, left: 20, padding: 8 },
  headerIcon: { borderRadius: 50, padding: 16, borderWidth: 2, marginBottom: 12 },
  titulo: { fontSize: 22, fontWeight: "bold", letterSpacing: 0.5 },
  subtitulo: { fontSize: 13, marginTop: 4 },
  seccion: { margin: 16, marginBottom: 8, borderRadius: 16, padding: 16, borderWidth: 1 },
  seccionTitulo: { fontWeight: "bold", fontSize: 14, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  chipRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13 },
  btnRegistrar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, margin: 16, marginTop: 20, padding: 16, borderRadius: 14, elevation: 4 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 },
});