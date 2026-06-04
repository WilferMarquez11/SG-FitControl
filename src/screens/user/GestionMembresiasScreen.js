import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Modal, TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";
import DateTimePicker from "@react-native-community/datetimepicker";

const parseToTimestamp = (value) => {
  if (!value) return 0;
  if (typeof value === "object" && typeof value.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date && !isNaN(value.getTime())) return value.getTime();
  if (typeof value === "string") {
    const m = value.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])).getTime();
    const iso = new Date(value);
    if (!isNaN(iso.getTime())) return iso.getTime();
  }
  return 0;
};

export default function GestionMembresias({ navigation, route }) {
  const rol = route?.params?.rol || "admin";
  const panelHome = rol === "entrenador" ? "PanelEntrenador" : "PanelUser";

  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [membresiaSeleccionada, setMembresiaSeleccionada] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoMembresia, setTipoMembresia] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const { tema } = useTheme();

  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Membresias"));
        const data = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const ta = parseToTimestamp(a.fechaInicio);
            const tb = parseToTimestamp(b.fechaInicio);
            if (ta === 0 && tb === 0) return 0;
            if (ta === 0) return 1;
            if (tb === 0) return -1;
            return tb - ta;
          });
        setMembresias(data);
      } catch (error) {
        console.error("Error al obtener membresías:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembresias();
  }, []);

  const abrirModalEdicion = (membresia) => {
    setMembresiaSeleccionada(membresia);
    setFechaInicio(membresia.fechaInicio || "");
    setFechaFin(membresia.fechaFin || "");
    setTipoMembresia(membresia.tipoMembresia || "");
    setModalVisible(true);
  };

  const actualizarMembresia = async () => {
    try {
      await updateDoc(doc(db, "Membresias", membresiaSeleccionada.id), { tipoMembresia, fechaFin });
      setMembresias((prev) =>
        prev.map((m) => m.id === membresiaSeleccionada.id ? { ...m, tipoMembresia, fechaFin } : m)
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar membresía:", error);
    }
  };

  const onChangeFechaFin = (event, selectedDate) => {
    setMostrarCalendario(false);
    if (selectedDate) setFechaFin(selectedDate.toISOString().split("T")[0]);
  };

  const membresiasFiltradas = membresias.filter((m) => {
    const coincideNombre = m.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo ? m.tipoMembresia === filtroTipo : true;
    return coincideNombre && coincideTipo;
  });

  const total = membresiasFiltradas.length;
  const activas = membresiasFiltradas.filter((m) => m.estado?.toLowerCase() === "activa").length;
  const inactivas = membresiasFiltradas.filter((m) => m.estado?.toLowerCase() === "inactiva").length;

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.icono} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: tema.texto }]}>Gestión Membresías</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* TARJETAS */}
        <View style={styles.row}>
          {[
            { label: "Total", value: total, color: tema.acento },
            { label: "Activas", value: activas, color: "#4CAF50" },
            { label: "Inactivas", value: inactivas, color: "#F44336" },
          ].map((item) => (
            <View key={item.label} style={[styles.card, { backgroundColor: tema.inputBg, borderColor: item.color }]}>
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
            onPress={() => navigation.navigate("RegistrarMembresias", { rol })}
          >
            <Text style={styles.registerText}>Registrar Membresía</Text>
          </TouchableOpacity>
        </View>

        {/* FILTRO */}
        <View style={[styles.filterContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker
            selectedValue={filtroTipo}
            onValueChange={setFiltroTipo}
            style={{ color: tema.inputTexto }}
            dropdownIconColor={tema.icono}
          >
            <Picker.Item label="Tipo Membresía" value="" />
            <Picker.Item label="Mensual" value="Mensual" />
            <Picker.Item label="Trimestral" value="Trimestral" />
            <Picker.Item label="Anual" value="Anual" />
          </Picker>
        </View>

        {/* BUSCADOR */}
        <View style={[styles.searchContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Icon name="magnify" size={22} color={tema.subtexto} style={{ marginHorizontal: 6 }} />
          <TextInput
            style={[styles.searchInput, { color: tema.inputTexto }]}
            placeholder="Buscar por nombre..."
            placeholderTextColor={tema.subtexto}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* LISTA */}
        {loading ? (
          <ActivityIndicator size="large" color={tema.acento} style={{ marginTop: 20 }} />
        ) : (
          membresiasFiltradas.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.itemBox, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}
              onPress={() => abrirModalEdicion(m)}
            >
              <Text style={[styles.itemText, { color: tema.texto }]}>
                {m.nombreCliente} - {m.tipoMembresia}
              </Text>
              <Text style={[styles.fechaText, { color: tema.subtexto }]}>
                {m.fechaInicio} → {m.fechaFin}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: tema.inputBg }]}>
            <Text style={[styles.modalTitle, { color: tema.texto }]}>Editar Membresía</Text>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Tipo de Membresía</Text>
            <View style={[styles.modalPicker, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
              <Picker
                selectedValue={tipoMembresia}
                onValueChange={setTipoMembresia}
                style={{ color: tema.inputTexto }}
                dropdownIconColor={tema.icono}
              >
                <Picker.Item label="Seleccione..." value="" />
                <Picker.Item label="Mensual" value="Mensual" />
                <Picker.Item label="Trimestral" value="Trimestral" />
                <Picker.Item label="Anual" value="Anual" />
              </Picker>
            </View>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Fecha Inicio</Text>
            <View style={[styles.inputView, { backgroundColor: tema.inputBorder, borderColor: tema.inputBorder }]}>
              <Text style={{ color: tema.subtexto }}>{fechaInicio || "Sin fecha"}</Text>
            </View>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Fecha Fin</Text>
            <TouchableOpacity
              style={[styles.inputView, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}
              onPress={() => setMostrarCalendario(true)}
            >
              <Text style={{ color: tema.inputTexto }}>{fechaFin || "Seleccionar fecha"}</Text>
            </TouchableOpacity>

            {mostrarCalendario && (
              <DateTimePicker
                value={fechaFin ? new Date(fechaFin) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeFechaFin}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: tema.acento }]}
                onPress={actualizarMembresia}
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
            <Icon name={item.icon} size={28} color={index === 2 ? tema.acento : tema.icono} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30, marginBottom: 20 },
  header: { fontSize: 20, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  card: { borderRadius: 16, padding: 15, alignItems: "center", flex: 1, marginHorizontal: 5, borderWidth: 1, elevation: 3 },
  cardNumber: { fontSize: 24, fontWeight: "bold" },
  cardLabel: { fontSize: 14, marginTop: 5 },
  separatorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 15 },
  line: { flex: 1, height: 1, marginHorizontal: 10 },
  separatorText: { fontSize: 18, fontWeight: "bold" },
  buttonsContainer: { alignItems: "center", marginBottom: 20 },
  registerBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginBottom: 15, elevation: 3 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  filterContainer: { borderRadius: 12, marginBottom: 12, borderWidth: 1, overflow: "hidden" },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  itemBox: { padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, elevation: 2 },
  itemText: { fontSize: 15, fontWeight: "500", textAlign: "center" },
  fechaText: { fontSize: 12, marginTop: 4, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  modalPicker: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  inputView: { padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 5 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 25 },
  modalBtn: { flex: 1, marginHorizontal: 5, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  modalBtnText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 15 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: "100%", elevation: 6, marginBottom: 30 },
});