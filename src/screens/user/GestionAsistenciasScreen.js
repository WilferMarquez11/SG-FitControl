import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { collection, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";

const parseToDate = (value) => {
  try {
    if (!value) return null;
    if (typeof value === "object" && typeof value.toDate === "function") return value.toDate();
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (!isNaN(value) && typeof value !== "object") return new Date(Number(value));
    if (typeof value === "string") {
      const s = value.trim();
      const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (m) return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
      const iso = new Date(s);
      if (!isNaN(iso.getTime())) return iso;
    }
    return null;
  } catch { return null; }
};

const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "Sin fecha";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
};

export default function GestionAsistencias({ navigation, route }) {
  const rol = route?.params?.rol || "admin";
  const panelHome = rol === "entrenador" ? "PanelEntrenador" : "PanelUser";

  const [asistencias, setAsistencias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState(null);
  const [formData, setFormData] = useState({ rutina: "", entrenador: "", fecha: new Date() });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroRutina, setFiltroRutina] = useState("");

  const { tema } = useTheme();

  const rutinasDisponibles = ["Cardio", "Fuerza", "HIIT", "Yoga"];
  const entrenadoresDisponibles = ["Carlos Gómez", "Ana Torres", "Luis Ramírez"];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Asistencias"), async (snapshot) => {
      try {
        let asistenciasConInfo = [];

        for (const asistenciaDoc of snapshot.docs) {
          const asistenciaData = asistenciaDoc.data();
          const fechaRaw = asistenciaData.fecha || asistenciaData.fechaAsistencia || asistenciaData.dia || asistenciaData.date || null;
          const fechaFinal = parseToDate(fechaRaw) || null;

          let nombreCliente = asistenciaData.nombreCliente || "Sin nombre";
          const clienteID = asistenciaData.clienteID || asistenciaData.userId || asistenciaData.uid;
          if (clienteID && !asistenciaData.nombreCliente) {
            try {
              const clienteSnap = await getDoc(doc(db, "Clientes", clienteID));
              if (clienteSnap.exists()) {
                const d = clienteSnap.data();
                nombreCliente = d.nombre || d.name || d.fullName || nombreCliente;
              }
            } catch (err) { console.log("⚠️ Error obteniendo cliente:", err); }
          }

          asistenciasConInfo.push({
            id: asistenciaDoc.id,
            ...asistenciaData,
            nombreCliente,
            fecha: fechaFinal,
          });
        }

        const toTimestamp = (fecha) => {
          if (fecha instanceof Date && !isNaN(fecha.getTime())) return fecha.getTime();
          if (typeof fecha === "string") {
            const parsed = parseToDate(fecha);
            return parsed ? parsed.getTime() : 0;
          }
          return 0;
        };

        asistenciasConInfo.sort((a, b) => toTimestamp(b.fecha) - toTimestamp(a.fecha));
        setAsistencias(asistenciasConInfo);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error al cargar asistencias:", error);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const abrirModal = (asistencia) => {
    if (!asistencia) return;
    const fechaValida = asistencia.fecha instanceof Date ? asistencia.fecha : parseToDate(asistencia.fecha) || new Date();
    const rutinaNormalizada = (() => {
      if (!asistencia.rutina) return "";
      const r = asistencia.rutina.trim().toLowerCase();
      return rutinasDisponibles.find((opt) => opt.trim().toLowerCase() === r) || "";
    })();
    setSelectedAsistencia(asistencia);
    setFormData({ rutina: rutinaNormalizada, entrenador: asistencia.entrenador || "", fecha: fechaValida });
    setModalVisible(true);
  };

  const guardarCambios = async () => {
    if (!selectedAsistencia) return;
    try {
      await updateDoc(doc(db, "Asistencias", selectedAsistencia.id), {
        rutina: formData.rutina,
        entrenador: formData.entrenador,
        fecha: formatDate(formData.fecha),
      });
      setModalVisible(false);
    } catch (error) { console.error("❌ Error al actualizar asistencia:", error); }
  };

  const asistenciasFiltradas = asistencias.filter((item) => {
    const coincideRutina = filtroRutina ? item.rutina?.toLowerCase() === filtroRutina.toLowerCase() : true;
    const coincideBusqueda = item.nombreCliente?.toLowerCase().includes(searchQuery.toLowerCase());
    return coincideRutina && coincideBusqueda;
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: tema.fondo, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={tema.acento} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.icono} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: tema.texto }]}>Gestión Asistencias</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* TARJETA TOTAL */}
        <View style={[styles.totalContainer, { backgroundColor: tema.inputBg, borderColor: tema.acento }]}>
          <Text style={[styles.totalTitle, { color: tema.subtexto }]}>Total Asistencias</Text>
          <Text style={[styles.totalAmount, { color: tema.texto }]}>{asistenciasFiltradas.length}</Text>
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
            onPress={() => navigation.navigate("RegistrarAsistencias", { rol })}
          >
            <Text style={styles.registerText}>Registrar Asistencias</Text>
          </TouchableOpacity>
        </View>

        {/* FILTRO RUTINA */}
        <View style={[styles.filterContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker
            selectedValue={filtroRutina}
            onValueChange={setFiltroRutina}
            style={{ color: tema.inputTexto }}
            dropdownIconColor={tema.icono}
          >
            <Picker.Item label="Rutinas" value="" />
            {rutinasDisponibles.map((r, i) => <Picker.Item key={i} label={r} value={r} />)}
          </Picker>
        </View>

        {/* BUSCADOR */}
        <View style={[styles.searchContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Icon name="magnify" size={22} color={tema.subtexto} style={{ marginHorizontal: 6 }} />
          <TextInput
            style={[styles.searchInput, { color: tema.inputTexto }]}
            placeholder="Buscar cliente..."
            placeholderTextColor={tema.subtexto}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* LISTA */}
        {asistenciasFiltradas.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemBox, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}
            onPress={() => abrirModal(item)}
          >
            <Text style={[styles.itemText, { color: tema.texto }]}>{item.nombreCliente}</Text>
            <Text style={[styles.fechaText, { color: tema.subtexto }]}>
              {item.fecha ? formatDate(item.fecha) : "Sin fecha"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: tema.inputBg }]}>
            <Text style={[styles.modalTitle, { color: tema.texto }]}>Editar Asistencia</Text>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Rutina</Text>
            <View style={[styles.modalPicker, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
              <Picker
                selectedValue={formData.rutina}
                onValueChange={(val) => setFormData({ ...formData, rutina: val })}
                style={{ color: tema.inputTexto }}
                dropdownIconColor={tema.icono}
              >
                <Picker.Item label="Seleccionar rutina" value="" />
                {rutinasDisponibles.map((r, i) => <Picker.Item key={i} label={r} value={r} />)}
              </Picker>
            </View>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Entrenador</Text>
            <View style={[styles.modalPicker, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
              <Picker
                selectedValue={formData.entrenador}
                onValueChange={(val) => setFormData({ ...formData, entrenador: val })}
                style={{ color: tema.inputTexto }}
                dropdownIconColor={tema.icono}
              >
                <Picker.Item label="Seleccionar entrenador" value="" />
                {entrenadoresDisponibles.map((e, i) => <Picker.Item key={i} label={e} value={e} />)}
              </Picker>
            </View>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Fecha</Text>
            <View style={styles.dateContainer}>
              <View style={[styles.inputView, { flex: 1, backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
                <Text style={{ color: tema.inputTexto }}>{formatDate(formData.fecha)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.calendarButton, { borderColor: tema.acento }]}
              >
                <Icon name="calendar" size={24} color={tema.acento} />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.fecha instanceof Date ? formData.fecha : new Date()}
                mode="date"
                display="calendar"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setFormData({ ...formData, fecha: date });
                }}
              />
            )}

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
          { icon: "clipboard-list", screen: null },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => item.screen && navigation.navigate(item.screen, { rol })}
          >
            <Icon name={item.icon} size={28} color={index === 4 ? tema.acento : tema.icono} />
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
  totalContainer: { borderRadius: 16, padding: 15, alignItems: "center", borderWidth: 1, elevation: 3, marginBottom: 20 },
  totalTitle: { fontSize: 16 },
  totalAmount: { fontSize: 24, fontWeight: "bold", marginTop: 5 },
  separatorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 15 },
  line: { flex: 1, height: 1, marginHorizontal: 10 },
  separatorText: { fontSize: 18, fontWeight: "bold" },
  buttonsContainer: { alignItems: "center", marginBottom: 20 },
  registerBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginBottom: 15, elevation: 3 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  filterContainer: { borderRadius: 12, marginBottom: 12, borderWidth: 1, overflow: "hidden" },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  itemBox: { padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, elevation: 2, alignItems: "center" },
  itemText: { fontSize: 15, fontWeight: "500" },
  fechaText: { fontSize: 13, marginTop: 3 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  modalPicker: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  inputView: { padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 5 },
  dateContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  calendarButton: { marginLeft: 10, padding: 10, borderRadius: 12, borderWidth: 1 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 25 },
  modalBtn: { flex: 1, marginHorizontal: 5, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  modalBtnText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 15 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: "100%", elevation: 6, marginBottom: 30 },
});