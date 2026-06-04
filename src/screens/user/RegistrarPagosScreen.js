import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert, Modal, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";

export default function RegistrarPagos({ navigation, route }) {
  const rol = route?.params?.rol || "admin";
  const panelHome = rol === "entrenador" ? "PanelEntrenador" : "PanelUser";

  const [membresia, setMembresia] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [monto, setMonto] = useState("");
  const [fechaPago, setFechaPago] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [subMetodoPago, setSubMetodoPago] = useState("");
  const [detalle, setDetalle] = useState("");
  const [membresias, setMembresias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { tema } = useTheme();

  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Membresias"));
        setMembresias(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("Error al cargar membresías:", error); }
    };
    fetchMembresias();
  }, []);

  const membresiasFiltradas = membresias.filter((m) =>
    (m.nombreCliente || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const parseFechaToDate = (fechaStr) => {
    if (!fechaStr) return new Date();
    const [d, m, y] = fechaStr.split("/");
    const nd = new Date(`${y}-${m}-${d}`);
    return isNaN(nd.getTime()) ? new Date() : nd;
  };

  const handleMembresiaSeleccionada = (item) => {
    setMembresia(item.id);
    setNombreCliente(item.nombreCliente);
    const montos = { Mensual: "60000", Trimestral: "180000", Anual: "720000" };
    setMonto(montos[item.tipoMembresia] || "");
    setModalVisible(false);
    setSearchText("");
  };

  const registrarPago = async () => {
    if (!membresia || !monto || !fechaPago || !metodoPago || (metodoPago !== "efectivo" && !subMetodoPago)) {
      Alert.alert("Error", "Por favor completa todos los campos"); return;
    }
    try {
      const [day, month, year] = fechaPago.split("/");
      await addDoc(collection(db, "Pagos"), {
        membresiaID: membresia, nombreCliente, monto: parseFloat(monto),
        fechaPago: Timestamp.fromDate(new Date(`${year}-${month}-${day}`)),
        metodoPago, subMetodoPago: metodoPago === "efectivo" ? "Efectivo" : subMetodoPago,
        detalle, createdAt: Timestamp.now(),
      });
      Alert.alert("✅ Éxito", "Pago registrado correctamente");
      setMembresia(""); setNombreCliente(""); setMonto(""); setFechaPago("");
      setMetodoPago(""); setSubMetodoPago(""); setDetalle("");
      navigation.replace("RegistrarAsistencias", { rol });
    } catch (error) {
      console.error("Error al registrar pago:", error);
      Alert.alert("Error", "No se pudo registrar el pago");
    }
  };

  const getSubMetodos = () => {
    if (metodoPago === "tarjeta") return [
      { label: "Visa", value: "Visa" },
      { label: "Mastercard", value: "Mastercard" },
      { label: "Davivienda", value: "Davivienda" },
      { label: "Banco de Bogotá", value: "Banco de Bogotá" },
      { label: "BBVA", value: "BBVA" },
    ];
    if (metodoPago === "transferencia") return [
      { label: "Nequi", value: "Nequi" },
      { label: "Daviplata", value: "Daviplata" },
      { label: "Bancolombia", value: "Bancolombia" },
    ];
    return [];
  };

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
          <Text style={[styles.headerTitle, { color: tema.texto }]}>Registrar Pagos</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ICONO */}
        <View style={styles.iconContainer}>
          <Icon name="currency-usd" size={70} color={tema.acento} />
        </View>

        {/* MEMBRESÍA */}
        <Text style={[styles.label, { color: tema.texto }]}>Membresía</Text>
        <TouchableOpacity
          style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ flex: 1, color: nombreCliente ? tema.inputTexto : tema.placeholder }}>
            {nombreCliente || "Seleccionar membresía..."}
          </Text>
          <Icon name="magnify" size={22} color={tema.acento} />
        </TouchableOpacity>

        {/* MODAL */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={[styles.modalContainer, { backgroundColor: tema.fondo }]}>
            <TextInput
              style={[styles.modalInput, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
              placeholder="Buscar membresía..."
              placeholderTextColor={tema.placeholder}
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={membresiasFiltradas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: tema.inputBorder }]}
                  onPress={() => handleMembresiaSeleccionada(item)}
                >
                  <Text style={{ color: tema.texto }}>{`${item.tipoMembresia} - ${item.nombreCliente}`}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: tema.botonPrimario }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.cancelText, { color: tema.botonPrimarioTexto }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* MONTO */}
        <Text style={[styles.label, { color: tema.texto }]}>Monto</Text>
        <TextInput
          style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
          placeholder="Ingrese monto a pagar"
          placeholderTextColor={tema.placeholder}
          keyboardType="numeric"
          value={monto}
          onChangeText={setMonto}
        />

        {/* FECHA PAGO */}
        <Text style={[styles.label, { color: tema.texto }]}>Fecha Pago</Text>
        <View style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput
            style={[styles.inputFlex, { color: tema.inputTexto }]}
            placeholder="dd/mm/aaaa"
            placeholderTextColor={tema.placeholder}
            value={fechaPago}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={22} color={tema.acento} />
          </TouchableOpacity>
        </View>
        {showPicker && (
          <DateTimePicker
            value={parseFechaToDate(fechaPago)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setFechaPago(formatDate(selectedDate));
            }}
          />
        )}

        {/* MÉTODO PAGO */}
        <Text style={[styles.label, { color: tema.texto }]}>Método Pago</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker
            selectedValue={metodoPago}
            onValueChange={(v) => { setMetodoPago(v); setSubMetodoPago(""); }}
            style={{ color: tema.inputTexto }}
            dropdownIconColor={tema.icono}
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Efectivo" value="efectivo" />
            <Picker.Item label="Tarjeta" value="tarjeta" />
            <Picker.Item label="Transferencia" value="transferencia" />
          </Picker>
        </View>

        {/* SUBMÉTODO */}
        {metodoPago !== "efectivo" && metodoPago ? (
          <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
            <Picker
              key={`${metodoPago}-sub`}
              selectedValue={subMetodoPago}
              onValueChange={setSubMetodoPago}
              style={{ color: tema.inputTexto }}
              dropdownIconColor={tema.icono}
            >
              <Picker.Item label="Seleccionar submétodo..." value="" />
              {getSubMetodos().map((op) => (
                <Picker.Item key={op.value} label={op.label} value={op.value} />
              ))}
            </Picker>
          </View>
        ) : null}

        {/* DETALLE */}
        <Text style={[styles.label, { color: tema.texto }]}>Detalle</Text>
        <TextInput
          style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto, height: 100, textAlignVertical: "top" }]}
          placeholder="Escriba el detalle del pago"
          placeholderTextColor={tema.placeholder}
          multiline
          value={detalle}
          onChangeText={setDetalle}
        />

        {/* BOTONES */}
        <TouchableOpacity
          style={[styles.registerBtn, { backgroundColor: tema.botonPrimario }]}
          onPress={registrarPago}
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, marginTop: 30, paddingHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  iconContainer: { alignItems: "center", marginVertical: 10 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6, borderWidth: 1, elevation: 1 },
  inputIcon: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, marginBottom: 6, height: 50, borderWidth: 1, elevation: 1 },
  inputFlex: { flex: 1, padding: 10 },
  pickerContainer: { borderRadius: 8, marginBottom: 6, borderWidth: 1, elevation: 1 },
  registerBtn: { paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 10, marginBottom: 10 },
  registerText: { fontSize: 16, fontWeight: "bold" },
  cancelBtn: { paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  cancelText: { fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, padding: 20 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  modalItem: { padding: 15, borderBottomWidth: 1 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: "100%", elevation: 6, marginBottom: 30 },
});