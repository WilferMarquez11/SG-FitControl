import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, TextInput, ScrollView, Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useTheme } from "../../theme/useTheme";

export default function TiposMembresias({ navigation, route }) {
  const rol = route?.params?.rol || "admin";
  const panelHome = rol === "entrenador" ? "PanelEntrenador" : "PanelAdmin";
  const { tema } = useTheme();

  const [tipos, setTipos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nombre, setNombre] = useState("");
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    fetchTipos();
  }, []);

  const fetchTipos = async () => {
    try {
      const snap = await getDocs(collection(db, "TiposMembresias"));
      setTipos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) { console.error("Error al cargar tipos:", error); }
  };

  const abrirModalNuevo = () => {
    setEditando(null);
    setNombre("");
    setDuracion("");
    setPrecio("");
    setDescripcion("");
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
    setEditando(item);
    setNombre(item.nombre);
    setDuracion(String(item.duracion));
    setPrecio(String(item.precio));
    setDescripcion(item.descripcion || "");
    setModalVisible(true);
  };

  const guardar = async () => {
    if (!nombre || !duracion || !precio) {
      Alert.alert("⚠️ Campos incompletos", "Nombre, duración y precio son obligatorios.");
      return;
    }
    try {
      const datos = {
        nombre,
        duracion: parseInt(duracion),
        precio: parseFloat(precio),
        descripcion,
      };
      if (editando) {
        await updateDoc(doc(db, "TiposMembresias", editando.id), datos);
        setTipos((prev) =>
          prev.map((t) => t.id === editando.id ? { ...t, ...datos } : t)
        );
        Alert.alert("✅ Éxito", "Tipo de membresía actualizado.");
      } else {
        const nuevo = await addDoc(collection(db, "TiposMembresias"), datos);
        setTipos((prev) => [...prev, { id: nuevo.id, ...datos }]);
        Alert.alert("✅ Éxito", "Tipo de membresía creado.");
      }
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error", "No se pudo guardar.");
    }
  };

  const eliminar = (item) => {
    Alert.alert(
      "Eliminar",
      `¿Deseas eliminar "${item.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "TiposMembresias", item.id));
              setTipos((prev) => prev.filter((t) => t.id !== item.id));
            } catch (error) {
              console.error(error);
              Alert.alert("❌ Error", "No se pudo eliminar.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardNombre, { color: tema.texto }]}>{item.nombre}</Text>
          <Text style={[styles.cardSub, { color: tema.subtexto }]}>
            {item.duracion} días · ${parseFloat(item.precio).toLocaleString("es-CO")}
          </Text>
          {item.descripcion ? (
            <Text style={[styles.cardDesc, { color: tema.subtexto }]}>{item.descripcion}</Text>
          ) : null}
        </View>
        <View style={styles.cardBtns}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: `${tema.acento}22` }]}
            onPress={() => abrirModalEditar(item)}
          >
            <Icon name="pencil" size={18} color={tema.acento} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#FF333322" }]}
            onPress={() => eliminar(item)}
          >
            <Icon name="trash-can" size={18} color="#E24B4A" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.texto} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: tema.texto }]}>Tipos de Membresías</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ICONO */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Icon name="card-account-details" size={60} color={tema.acento} />
        </View>

        {/* BOTÓN AGREGAR */}
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: tema.botonPrimario }]}
          onPress={abrirModalNuevo}
        >
          <Icon name="plus" size={20} color={tema.botonPrimarioTexto} />
          <Text style={[styles.addBtnText, { color: tema.botonPrimarioTexto }]}>
            Nuevo Tipo de Membresía
          </Text>
        </TouchableOpacity>

        {/* LISTA */}
        {tipos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="card-off" size={50} color={tema.subtexto} />
            <Text style={[styles.emptyText, { color: tema.subtexto }]}>
              No hay tipos de membresías aún
            </Text>
          </View>
        ) : (
          <FlatList
            data={tipos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, borderWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: tema.texto }]}>
              {editando ? "Editar Membresía" : "Nueva Membresía"}
            </Text>

            <Text style={[styles.label, { color: tema.texto }]}>Nombre</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Mensual, Trimestral, Anual"
              placeholderTextColor={tema.placeholder}
              style={[styles.input, { backgroundColor: tema.fondo, borderColor: tema.inputBorder, color: tema.inputTexto }]}
            />

            <Text style={[styles.label, { color: tema.texto }]}>Duración (días)</Text>
            <TextInput
              value={duracion}
              onChangeText={setDuracion}
              placeholder="Ej: 30, 90, 365"
              placeholderTextColor={tema.placeholder}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: tema.fondo, borderColor: tema.inputBorder, color: tema.inputTexto }]}
            />

            <Text style={[styles.label, { color: tema.texto }]}>Precio</Text>
            <TextInput
              value={precio}
              onChangeText={setPrecio}
              placeholder="Ej: 60000"
              placeholderTextColor={tema.placeholder}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: tema.fondo, borderColor: tema.inputBorder, color: tema.inputTexto }]}
            />

            <Text style={[styles.label, { color: tema.texto }]}>Descripción (opcional)</Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ej: Acceso completo al gimnasio"
              placeholderTextColor={tema.placeholder}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 70, textAlignVertical: "top", backgroundColor: tema.fondo, borderColor: tema.inputBorder, color: tema.inputTexto }]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: tema.botonPrimario }]}
                onPress={guardar}
              >
                <Text style={[styles.modalBtnText, { color: tema.botonPrimarioTexto }]}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: tema.inputBorder }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: tema.texto }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        {[
          { icon: "home-outline", screen: panelHome },
          { icon: "account-group", screen: "GestionClientes" },
          { icon: "card-account-details", screen: "GestionMembresias" },
          { icon: "currency-usd", screen: "GestionPagos" },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
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
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30, marginBottom: 20 },
  header: { fontSize: 20, fontWeight: "bold" },
  addBtn: { flexDirection: "row", padding: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 20, gap: 8, elevation: 3 },
  addBtnText: { fontWeight: "bold", fontSize: 15 },
  card: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  cardNombre: { fontSize: 16, fontWeight: "bold" },
  cardSub: { fontSize: 13, marginTop: 3 },
  cardDesc: { fontSize: 12, marginTop: 4, fontStyle: "italic" },
  cardBtns: { flexDirection: "column", gap: 8 },
  iconBtn: { padding: 8, borderRadius: 8, marginBottom: 4 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  input: { padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 2 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  modalBtn: { flex: 1, marginHorizontal: 5, borderRadius: 12, paddingVertical: 12 },
  modalBtnText: { textAlign: "center", fontWeight: "bold", fontSize: 15 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderRadius: 18, position: "absolute", bottom: 15, width: "90%", alignSelf: "center", borderWidth: 1, elevation: 6,marginBottom: 30 },
});