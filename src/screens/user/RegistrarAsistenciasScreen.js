import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView, Modal, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../../services/firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useTheme } from "../../theme/useTheme";

export default function RegistrarAsistencias({ navigation, route }) {
  const rol = route?.params?.rol || "admin";
  const panelHome = rol === "entrenador" ? "PanelEntrenador" : "PanelUser";

  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState("");
  const [clienteID, setClienteID] = useState(null);
  const [rutina, setRutina] = useState("");
  const [fecha, setFecha] = useState("");
  const [entrenador, setEntrenador] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [membresiaActiva, setMembresiaActiva] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { tema } = useTheme();

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const q = query(collection(db, "Clientes"), where("rol", "==", "cliente"));
        const snap = await getDocs(q);
        setClientes(snap.docs.map((doc) => ({ id: doc.id, nombre: doc.data().nombre })));
      } catch (error) { console.error(error); }
    };
    cargarClientes();
  }, []);

  useEffect(() => {
    const buscarMembresia = async () => {
      if (!clienteID) return;
      try {
        const q = query(collection(db, "Membresias"), where("clienteID", "==", clienteID));
        const snap = await getDocs(q);
        if (snap.empty) {
          setMembresiaActiva(null);
          Alert.alert("⚠️ Sin Membresía", "El cliente no tiene membresía registrada.");
          return;
        }
        setMembresiaActiva(snap.docs[0].data());
      } catch (error) { console.error(error); }
    };
    buscarMembresia();
  }, [clienteID]);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const registrarAsistencia = async () => {
    if (!clienteID || !cliente || !rutina || !fecha || !entrenador) {
      Alert.alert("Error", "Completa todos los campos."); return;
    }
    if (!membresiaActiva) {
      Alert.alert("⚠️ Sin Membresía", "El cliente no tiene una membresía activa. No se puede registrar la asistencia.");
      return;
    }
    if (membresiaActiva.estado !== "Activa") {
      Alert.alert("⚠️ Membresía Inactiva", `La membresía del cliente está ${membresiaActiva.estado}. No se puede registrar la asistencia.`);
      return;
    }
    try {
      await addDoc(collection(db, "Asistencias"), {
        clienteID, nombreCliente: cliente, rutina, fecha, entrenador, createdAt: new Date(),
      });
      Alert.alert("✅ Éxito", "Asistencia registrada.");
      setCliente(""); setClienteID(null); setRutina(""); setFecha(""); setEntrenador("");
      setMembresiaActiva(null);
      navigation.replace(panelHome, { rol });
    } catch (error) { console.error(error); Alert.alert("Error", "No se pudo registrar."); }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.icono} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tema.texto }]}>Registrar Asistencias</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ICONO */}
        <View style={styles.iconContainer}>
          <Icon name="clipboard-list" size={70} color={tema.acento} />
        </View>

        {/* MEMBRESÍA ACTIVA INFO */}
        {membresiaActiva && (
          <View style={[styles.membresiaCard, {
            backgroundColor: membresiaActiva.estado === "Activa" ? "#e8f5e9" : "#fdecea",
            borderColor: membresiaActiva.estado === "Activa" ? "#4CAF50" : "#E24B4A",
          }]}>
            <Icon
              name={membresiaActiva.estado === "Activa" ? "check-circle" : "alert-circle"}
              size={20}
              color={membresiaActiva.estado === "Activa" ? "#4CAF50" : "#E24B4A"}
            />
            <Text style={{ marginLeft: 8, color: membresiaActiva.estado === "Activa" ? "#2e7d32" : "#E24B4A", fontWeight: "600" }}>
              Membresía {membresiaActiva.estado} — {membresiaActiva.tipoMembresia} (vence: {membresiaActiva.fechaFin})
            </Text>
          </View>
        )}

        {/* CLIENTE */}
        <Text style={[styles.label, { color: tema.texto }]}>Nombre Cliente</Text>
        <TouchableOpacity
          style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ flex: 1, color: cliente ? tema.inputTexto : tema.placeholder }}>
            {cliente || "Seleccionar cliente..."}
          </Text>
          <Icon name="magnify" size={22} color={tema.acento} />
        </TouchableOpacity>

        {/* MODAL */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={[styles.modalContainer, { backgroundColor: tema.fondo }]}>
            <TextInput
              style={[styles.modalInput, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
              placeholder="Buscar cliente..."
              placeholderTextColor={tema.placeholder}
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={clientesFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: tema.inputBorder }]}
                  onPress={() => { setCliente(item.nombre); setClienteID(item.id); setModalVisible(false); setSearchText(""); }}
                >
                  <Text style={{ color: tema.texto }}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: tema.botonPrimario }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.cancelText, { color: tema.botonPrimarioTexto }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* RUTINA */}
        <Text style={[styles.label, { color: tema.texto }]}>Rutina</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker
            selectedValue={rutina}
            onValueChange={setRutina}
            style={{ color: tema.inputTexto }}
            dropdownIconColor={tema.icono}
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Cardio" value="Cardio" />
            <Picker.Item label="Fuerza" value="Fuerza" />
            <Picker.Item label="HIIT" value="HIIT" />
            <Picker.Item label="Yoga" value="Yoga" />
          </Picker>
        </View>

        {/* FECHA */}
        <Text style={[styles.label, { color: tema.texto }]}>Fecha Asistencia</Text>
        <View style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput
            style={[styles.inputFlex, { color: tema.inputTexto }]}
            placeholder="dd/mm/aaaa"
            placeholderTextColor={tema.placeholder}
            value={fecha}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={22} color={tema.acento} />
          </TouchableOpacity>
        </View>
        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setFecha(formatDate(selectedDate));
            }}
          />
        )}

        {/* ENTRENADOR */}
        <Text style={[styles.label, { color: tema.texto }]}>Entrenador</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker
            selectedValue={entrenador}
            onValueChange={setEntrenador}
            style={{ color: tema.inputTexto }}
            dropdownIconColor={tema.icono}
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Carlos Gómez" value="Carlos Gómez" />
            <Picker.Item label="Ana Torres" value="Ana Torres" />
            <Picker.Item label="Luis Ramírez" value="Luis Ramírez" />
          </Picker>
        </View>

        {/* BOTONES */}
        <TouchableOpacity
          style={[styles.registerBtn, { backgroundColor: tema.botonPrimario }]}
          onPress={registrarAsistencia}
        >
          <Text style={[styles.registerText, { color: tema.botonPrimarioTexto }]}>Registrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: tema.acento }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelText, { color: tema.botonPrimarioTexto }]}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* NAVBAR */}
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, marginTop: 30, paddingHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  iconContainer: { alignItems: "center", marginVertical: 10 },
  membresiaCard: { flexDirection: "row", alignItems: "center", borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  inputIcon: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, height: 50, borderWidth: 1, elevation: 1 },
  inputFlex: { flex: 1, padding: 10 },
  pickerContainer: { borderRadius: 8, marginBottom: 10, borderWidth: 1, elevation: 1 },
  registerBtn: { paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 15, marginBottom: 10 },
  registerText: { fontSize: 16, fontWeight: "bold" },
  cancelBtn: { paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  cancelText: { fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, padding: 20 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  modalItem: { padding: 15, borderBottomWidth: 1 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: "100%", elevation: 6, marginBottom: 30 },
});