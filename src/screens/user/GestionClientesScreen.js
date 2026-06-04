import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, ActivityIndicator, Modal, Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";

export default function GestionClientes({ navigation, route }) {
  const rol = route?.params?.rol || "admin";
  const panelHome = rol === "entrenador" ? "PanelEntrenador" : "PanelUser";

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ nombre: "", correo: "", telefono: "", sexo: "" });

  const { tema } = useTheme();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Clientes"));
        const data = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => (user.rol || "").toString().trim().toLowerCase() === "cliente")
          .sort((a, b) => (b.nombre || "").localeCompare(a.nombre || "", "es", { sensitivity: "base" }));
        setClientes(data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  const abrirModal = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nombre: cliente.nombre || "",
      correo: cliente.email || "",
      telefono: cliente.telefono || "",
      sexo: cliente.sexo || "",
    });
    setModalVisible(true);
  };

  const guardarCambios = async () => {
    if (!selectedCliente) return;
    try {
      const dataToUpdate = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        sexo: formData.sexo.toString().trim().toUpperCase(),
        ...(rol === "admin" && { email: formData.correo.trim() }),
      };
      await updateDoc(doc(db, "Clientes", selectedCliente.id), dataToUpdate);
      setClientes((prev) =>
        prev
          .map((c) => c.id === selectedCliente.id ? { ...c, ...dataToUpdate } : c)
          .sort((a, b) => (b.nombre || "").localeCompare(a.nombre || "", "es", { sensitivity: "base" }))
      );
      setModalVisible(false);
      Alert.alert("✅ Éxito", "Información actualizada correctamente");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error", "No se pudo actualizar el cliente");
    }
  };

  const total = clientes.length;
  const hombres = clientes.filter((c) => (c.sexo || "").toString().trim().toUpperCase() === "M").length;
  const mujeres = clientes.filter((c) => (c.sexo || "").toString().trim().toUpperCase() === "F").length;

  const clientesFiltrados = clientes.filter((c) =>
    (c.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  const campos = [
    { label: "Nombre", key: "nombre", editable: true, keyboardType: "default" },
    { label: "Correo", key: "correo", editable: rol === "admin", keyboardType: "email-address" },
    { label: "Teléfono", key: "telefono", editable: true, keyboardType: "phone-pad" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.icono} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tema.texto }]}>Gestión Clientes</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* TARJETAS */}
        <View style={styles.row}>
          {[{ label: "Total", value: total }, { label: "Hombres", value: hombres }, { label: "Mujeres", value: mujeres }].map((item) => (
            <View key={item.label} style={[styles.card, { backgroundColor: tema.inputBg, borderColor: tema.acento }]}>
              <Text style={[styles.cardNumber, { color: tema.texto }]}>{item.value}</Text>
              <Text style={[styles.cardLabel, { color: tema.subtexto }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* SEPARADOR */}
        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: tema.inputBorder }]} />
          <Text style={[styles.separatorText, { color: tema.texto }]}>O</Text>
          <View style={[styles.line, { backgroundColor: tema.inputBorder }]} />
        </View>

        {/* BOTÓN REGISTRAR */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: tema.acento }]}
            onPress={() => navigation.navigate("RegistrarClientes", { rol })}
          >
            <Text style={styles.registerText}>Registrar Cliente</Text>
          </TouchableOpacity>
        </View>

        {/* BUSCADOR */}
        <View style={[styles.searchContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Icon name="magnify" size={24} color={tema.placeholder} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: tema.inputTexto }]}
            placeholder="Buscar cliente..."
            placeholderTextColor={tema.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* LISTA */}
        {loading ? (
          <ActivityIndicator size="large" color={tema.acento} style={{ marginTop: 20 }} />
        ) : (
          clientesFiltrados.map((cliente) => (
            <TouchableOpacity key={cliente.id} onPress={() => abrirModal(cliente)}>
              <View style={[styles.pagoItem, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
                <Text style={[styles.pagoText, { color: tema.texto }]}>{cliente.nombre}</Text>
                <Text style={[styles.pagoSubText, { color: tema.subtexto }]}>{cliente.email}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: tema.inputBg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: tema.texto }]}>Editar Cliente</Text>

              {campos.map(({ label, key, editable, keyboardType }) => (
                <View key={key}>
                  <Text style={[styles.modalLabel, { color: tema.texto }]}>
                    {label}
                    {key === "correo" && rol !== "admin" && (
                      <Text style={{ color: tema.subtexto, fontSize: 11 }}> (solo admin)</Text>
                    )}
                  </Text>
                  <TextInput
                    editable={editable}
                    style={[styles.modalInput, {
                      backgroundColor: editable ? tema.inputBg : tema.inputBorder,
                      color: editable ? tema.inputTexto : tema.subtexto,
                      borderColor: tema.inputBorder,
                    }]}
                    keyboardType={keyboardType}
                    value={formData[key]}
                    onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                  />
                </View>
              ))}

              <Text style={[styles.modalLabel, { color: tema.texto }]}>Sexo</Text>
              <View style={[styles.modalPickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
                <Picker
                  selectedValue={formData.sexo}
                  onValueChange={(val) => setFormData({ ...formData, sexo: val })}
                  style={{ color: tema.inputTexto }}
                  dropdownIconColor={tema.icono}
                >
                  <Picker.Item label="Seleccionar..." value="" />
                  <Picker.Item label="Masculino" value="M" />
                  <Picker.Item label="Femenino" value="F" />
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: tema.acento }]}
                  onPress={guardarCambios}
                >
                  <Text style={styles.modalBtnText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: tema.botonPrimario }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* NAVBAR */}
      <View style={[styles.bottomNav, { backgroundColor: tema.inputBg, borderTopColor: tema.inputBorder }]}>
        {[
          { icon: "home-outline", screen: panelHome },
          { icon: "account-group", screen: "GestionClientes" },
          { icon: "card-account-details", screen: "GestionMembresias" },
          { icon: "currency-usd", screen: "GestionPagos" },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => item.screen && navigation.navigate(item.screen, { rol })}
          >
            <Icon name={item.icon} size={28} color={index === 1 ? tema.acento : tema.icono} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 30, paddingHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 12, padding: 15, alignItems: "center", flex: 1, marginHorizontal: 5, elevation: 2 },
  cardNumber: { fontSize: 22, fontWeight: "bold" },
  cardLabel: { fontSize: 14, marginTop: 5 },
  buttonsContainer: { alignItems: "center", marginBottom: 20 },
  registerBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, marginBottom: 15, elevation: 2 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 10, marginBottom: 15, paddingHorizontal: 10, borderWidth: 1, elevation: 1 },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 12 },
  pagoItem: { padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, elevation: 1 },
  pagoText: { fontSize: 15, fontWeight: "500" },
  pagoSubText: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { borderRadius: 16, padding: 20, width: "88%", maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  modalLabel: { fontWeight: "600", marginBottom: 6 },
  modalInput: { borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1 },
  modalPickerContainer: { borderRadius: 8, marginBottom: 12, borderWidth: 1 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 15 },
  modalBtn: { borderRadius: 10, padding: 12, width: "40%", alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "bold" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: "100%", elevation: 6, marginBottom: 30 },
  separatorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 },
  line: { flex: 1, height: 1, marginHorizontal: 10 },
  separatorText: { fontSize: 20, fontWeight: "bold" },
});