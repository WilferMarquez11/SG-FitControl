import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert, Modal, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";

export default function RegistrarMembresiasScreen({ navigation, route }) {
  const rol = route?.params?.rol || "admin";
  const panelHome = rol === "entrenador" ? "PanelEntrenador" : "PanelUser";

  const [nombreCliente, setNombreCliente] = useState("");
  const [clienteID, setClienteID] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoMembresia, setTipoMembresia] = useState("");
  const [tiposMembresias, setTiposMembresias] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState("Activa");
  const [showInicio, setShowInicio] = useState(false);

  const { tema, modoOscuro, toggleTema } = useTheme();

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const snap = await getDocs(collection(db, "TiposMembresias"));
        setTiposMembresias(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) { console.error("Error cargando tipos:", error); }
    };
    fetchTipos();
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const q = query(collection(db, "Clientes"), where("rol", "==", "cliente"));
        const snapshot = await getDocs(q);
        setClientes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("Error cargando clientes:", error); }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    if (!fechaInicio || !tipoMembresia) return;
    const tipoSeleccionado = tiposMembresias.find((t) => t.nombre === tipoMembresia);
    if (!tipoSeleccionado) return;
    const inicio = new Date(fechaInicio.split("/").reverse().join("-"));
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + parseInt(tipoSeleccionado.duracion));
    setFechaFin(formatDate(fin));
  }, [fechaInicio, tipoMembresia, tiposMembresias]);

  const registrarMembresia = async () => {
    if (!clienteID || !nombreCliente || !tipoMembresia || !fechaInicio || !fechaFin || !estado) {
      Alert.alert("Error", "Por favor completa todos los campos."); return;
    }
    const tipoSeleccionado = tiposMembresias.find((t) => t.nombre === tipoMembresia);
    try {
      await addDoc(collection(db, "Membresias"), {
        clienteID,
        nombreCliente,
        tipoMembresia,
        precio: tipoSeleccionado?.precio || 0,
        duracion: tipoSeleccionado?.duracion || 0,
        fechaInicio,
        fechaFin,
        estado,
      });
      Alert.alert("✅ Éxito", "Membresía registrada correctamente.");
      setNombreCliente(""); setClienteID(null); setTipoMembresia("");
      setFechaInicio(""); setFechaFin(""); setEstado("Activa");
      navigation.replace("RegistrarPagos", { rol });
    } catch (error) {
      console.error("Error al registrar membresía:", error);
      Alert.alert("Error", "No se pudo registrar la membresía.");
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const tipoInfo = tiposMembresias.find((t) => t.nombre === tipoMembresia);

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
          <Text style={[styles.headerTitle, { color: tema.texto }]}>Registrar Membresías</Text>
          <TouchableOpacity onPress={toggleTema}>
            <Icon
              name={modoOscuro ? "weather-night" : ""}
              size={24}
              color={tema.acento}
            />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Icon name="card-plus" size={60} color={tema.acento} />
        </View>

        {/* CLIENTE */}
        <Text style={[styles.label, { color: tema.texto }]}>Nombre Cliente</Text>
        <TouchableOpacity
          style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ flex: 1, color: nombreCliente ? tema.inputTexto : tema.placeholder }}>
            {nombreCliente || "Seleccionar cliente..."}
          </Text>
          <Icon name="magnify" size={22} color={tema.acento} />
        </TouchableOpacity>

        {/* MODAL CLIENTES */}
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
                  onPress={() => {
                    setClienteID(item.id);
                    setNombreCliente(item.nombre);
                    setModalVisible(false);
                    setSearchText("");
                  }}
                >
                  <Text style={{ color: tema.texto }}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: tema.botonPrimario }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: tema.botonPrimarioTexto }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* TIPO MEMBRESÍA */}
        <Text style={[styles.label, { color: tema.texto }]}>Tipo Membresía</Text>
        {tiposMembresias.length === 0 ? (
          <View style={[styles.emptyTipos, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
            <Icon name="alert-circle-outline" size={18} color={tema.acento} />
            <Text style={{ color: tema.subtexto, marginLeft: 8, fontSize: 13 }}>
              No hay tipos de membresías. Créalos en Tipos Membresías.
            </Text>
          </View>
        ) : (
          <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
            <Picker
              selectedValue={tipoMembresia}
              onValueChange={setTipoMembresia}
              style={{ color: tema.inputTexto }}
              dropdownIconColor={tema.icono}
            >
              <Picker.Item label="Seleccionar..." value="" />
              {tiposMembresias.map((t) => (
                <Picker.Item
                  key={t.id}
                  label={`${t.nombre} - $${parseFloat(t.precio).toLocaleString("es-CO")} (${t.duracion} días)`}
                  value={t.nombre}
                />
              ))}
            </Picker>
          </View>
        )}

        {/* INFO TIPO SELECCIONADO */}
        {tipoInfo && (
          <View style={[styles.tipoInfoCard, { backgroundColor: tema.inputBg, borderColor: tema.acento }]}>
            <Text style={[styles.tipoInfoText, { color: tema.texto }]}>
              💰 Precio: <Text style={{ color: "#4CAF50", fontWeight: "bold" }}>${parseFloat(tipoInfo.precio).toLocaleString("es-CO")}</Text>
            </Text>
            <Text style={[styles.tipoInfoText, { color: tema.texto }]}>
              📅 Duración: <Text style={{ fontWeight: "bold" }}>{tipoInfo.duracion} días</Text>
            </Text>
            {tipoInfo.descripcion ? (
              <Text style={[styles.tipoInfoText, { color: tema.subtexto }]}>📝 {tipoInfo.descripcion}</Text>
            ) : null}
          </View>
        )}

        {/* FECHA INICIO */}
        <Text style={[styles.label, { color: tema.texto }]}>Fecha Inicio</Text>
        <View style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput
            style={[styles.inputFlex, { color: tema.inputTexto }]}
            placeholder="dd/mm/aaaa"
            placeholderTextColor={tema.placeholder}
            value={fechaInicio}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowInicio(true)}>
            <Icon name="calendar" size={22} color={tema.acento} />
          </TouchableOpacity>
        </View>
        {showInicio && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowInicio(false);
              if (selectedDate) setFechaInicio(formatDate(selectedDate));
            }}
          />
        )}

        {/* FECHA FIN */}
        <Text style={[styles.label, { color: tema.texto }]}>Fecha Fin</Text>
        <View style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput
            style={[styles.inputFlex, { color: tema.inputTexto }]}
            placeholder="Se calcula automáticamente"
            placeholderTextColor={tema.placeholder}
            value={fechaFin}
            editable={false}
          />
          <Icon name="calendar-check" size={22} color={tema.subtexto} />
        </View>

        {/* ESTADO */}
        <Text style={[styles.label, { color: tema.texto }]}>Estado</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker
            selectedValue={estado}
            onValueChange={setEstado}
            style={{ color: tema.inputTexto }}
            dropdownIconColor={tema.icono}
          >
            <Picker.Item label="Activa" value="Activa" />
            <Picker.Item label="Vencida" value="Vencida" />
            <Picker.Item label="Cancelada" value="Cancelada" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: tema.botonPrimario }]}
          onPress={registrarMembresia}
        >
          <Text style={[styles.registerButtonText, { color: tema.botonPrimarioTexto }]}>Registrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: tema.acento }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: tema.botonPrimarioTexto }]}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* BARRA INFERIOR FIJA */}
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
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  inputIcon: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, marginBottom: 6, height: 50, borderWidth: 1, elevation: 1 },
  inputFlex: { flex: 1, padding: 10 },
  pickerContainer: { borderRadius: 8, marginBottom: 6, borderWidth: 1, elevation: 1 },
  emptyTipos: { flexDirection: "row", alignItems: "center", borderRadius: 8, padding: 12, marginBottom: 6, borderWidth: 1 },
  tipoInfoCard: { borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, gap: 4 },
  tipoInfoText: { fontSize: 13 },
  registerButton: { padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10, marginBottom: 10 },
  registerButtonText: { fontSize: 16, fontWeight: "bold" },
  cancelButton: { padding: 15, borderRadius: 8, alignItems: "center", marginTop: 5 },
  cancelButtonText: { fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, padding: 20 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  modalItem: { padding: 15, borderBottomWidth: 1 },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: "100%",
    elevation: 6,
     marginBottom: 20,
  },
});