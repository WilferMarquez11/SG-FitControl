import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "../../services/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "../../theme/useTheme";

export default function PanelAdminScreen({ navigation }) {
  const { tema, modoOscuro, toggleTema } = useTheme();
  const [nombreAdmin, setNombreAdmin] = useState("Admin");
  const [emailAdmin, setEmailAdmin] = useState("");
  const [tabActiva, setTabActiva] = useState("PanelAdmin");
  const [modalPerfil, setModalPerfil] = useState(false);

  useEffect(() => {
    const obtenerNombre = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmailAdmin(user.email || "");
          const docSnap = await getDoc(doc(db, "Usuarios", user.uid));
         if (docSnap.exists()) setNombreAdmin(docSnap.data().nombre || docSnap.data().representante || "Admin");
        }
      } catch (error) { console.error("Error al obtener nombre:", error); }
    };
    obtenerNombre();
  }, []);

  const handleLogout = () => {
    setModalPerfil(false);
    Alert.alert(
      "Cerrar sesión", "¿Deseas cerrar tu sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: () => navigation.replace("Login") },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>

      {/* MODAL PERFIL */}
      <Modal visible={modalPerfil} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalPerfil(false)}
        >
          <View
            style={[styles.modalCard, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}
            // Evita que el toque dentro del modal lo cierre
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >

            {/* PERFIL */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalAvatarCircle, { backgroundColor: tema.botonPrimario }]}>
                <Icon name="account" size={36} color={tema.botonPrimarioTexto} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.modalNombre, { color: tema.texto }]}>{nombreAdmin}</Text>
                <Text style={[styles.modalRol, { color: tema.subtexto }]}>Administrador</Text>
                <Text style={[styles.modalEmail, { color: tema.subtexto }]} numberOfLines={1}>{emailAdmin}</Text>
              </View>
            </View>

            <View style={[styles.modalDivider, { backgroundColor: tema.inputBorder }]} />

            {/* TEMA */}
            <TouchableOpacity
              style={styles.modalOpcion}
              onPress={toggleTema}
            >
              <Icon
                name={modoOscuro ? "weather-night" : "white-balance-sunny"}
                size={22}
                color={tema.acento}
              />
              <Text style={[styles.modalOpcionTexto, { color: tema.texto }]}>
                {modoOscuro ? "Modo Oscuro" : "Modo Claro"}
              </Text>
              <View style={[styles.temaSwitch, { backgroundColor: modoOscuro ? tema.acento : tema.inputBorder }]}>
                <View style={[styles.temaSwitchCircle, { alignSelf: modoOscuro ? "flex-end" : "flex-start" }]} />
              </View>
            </TouchableOpacity>

            <View style={[styles.modalDivider, { backgroundColor: tema.inputBorder }]} />

            {/* CERRAR SESIÓN */}
            <TouchableOpacity style={styles.modalOpcion} onPress={handleLogout}>
              <Icon name="logout" size={22} color="#E24B4A" />
              <Text style={[styles.modalOpcionTexto, { color: "#E24B4A" }]}>Cerrar Sesión</Text>
              <Icon name="chevron-right" size={20} color={tema.subtexto} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: tema.inputBg }]}>

          {/* TEXTO BIENVENIDO - izquierda */}
          <View style={styles.headerTexto}>
            <Text style={[styles.welcomeText, { color: tema.subtexto }]}>¡Bienvenido!</Text>
            <Text style={[styles.nombreText, { color: tema.texto }]} numberOfLines={1}>{nombreAdmin}</Text>
          </View>

          {/* ICONO PERFIL - derecha */}
          <TouchableOpacity onPress={() => setModalPerfil(true)} style={styles.avatarBtn}>
            <Image source={require("../../../assets/LogoGym.jpg")} style={styles.avatar} />
            <Icon name="chevron-down" size={16} color={tema.subtexto} />
          </TouchableOpacity>

        </View>

        {/* IMAGEN */}
        <View style={styles.imageContainer}>
          <Image source={require("../../../assets/LogoGym.jpg")} style={styles.image} resizeMode="contain" />
        </View>

        {/* TÍTULO */}
        <Text style={[styles.panelTitle, { color: tema.texto }]}>Panel Administrativo</Text>

        {/* SEPARADOR */}
        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: tema.inputBorder }]} />
          <Text style={[styles.separatorText, { color: tema.texto }]}>0</Text>
          <View style={[styles.line, { backgroundColor: tema.inputBorder }]} />
        </View>

        {/* SUGERIDOS */}
        <View style={styles.seccionHeader}>
          <Icon name="view-grid" size={20} color={tema.icono} style={{ marginRight: 6 }} />
          <Text style={[styles.seccionTitle, { color: tema.texto }]}>Sugeridos FitControl</Text>
        </View>
        <View style={styles.grid}>
          {[
            { icon: "account-tie", label: "Registrar\nEntrenador", screen: "RegistrarEntrenador" },
            { icon: "card-account-details", label: "Tipos\nMembresías", screen: "TiposMembresias" },
            { icon: "clipboard-list", label: "Control\nRutinas", screen: "ControlRutinas" },
          ].map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.cardLight, { backgroundColor: tema.inputBg }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Icon name={item.icon} size={36} color={tema.icono} />
              <Text style={[styles.cardTextLight, { color: tema.texto }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACCESOS RÁPIDOS */}
        <View style={styles.seccionHeader}>
          <Icon name="view-grid" size={20} color={tema.icono} style={{ marginRight: 6 }} />
          <Text style={[styles.seccionTitle, { color: tema.texto }]}>Accesos Rápidos</Text>
        </View>
        <View style={styles.grid}>
          {[
            { icon: "account-plus", label: "Registrar\nClientes", screen: "RegistrarClientes" },
            { icon: "card-plus", label: "Registrar\nMembresías", screen: "RegistrarMembresias" },
            { icon: "currency-usd", label: "Registrar\nPagos", screen: "RegistrarPagos" },
            { icon: "clipboard-check", label: "Control de\nAsistencias", screen: "RegistrarAsistencias" },
          ].map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.cardLightBig, { backgroundColor: tema.inputBg }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Icon name={item.icon} size={36} color={tema.icono} />
              <Text style={[styles.cardTextLight, { color: tema.texto }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: tema.inputBg, borderTopColor: tema.inputBorder }]}>
        {[
          { icon: "home", screen: "PanelAdmin" },
          { icon: "account-group", screen: "GestionClientes" },
          { icon: "card-account-details", screen: "GestionMembresias" },
          { icon: "currency-usd", screen: "GestionPagos" },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item) => (
          <TouchableOpacity
            key={item.screen}
            onPress={() => { setTabActiva(item.screen); navigation.navigate(item.screen); }}
          >
            <Icon
              name={item.icon}
              size={28}
              color={tabActiva === item.screen ? tema.acento : tema.icono}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 15, marginTop: 10, elevation: 2 },
  headerTexto: { flex: 1 },
  welcomeText: { fontSize: 12 },
  nombreText: { fontSize: 15, fontWeight: "bold", maxWidth: 200 },
  avatarBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIcon: { padding: 4 },
  imageContainer: { width: "100%", alignSelf: "center", marginBottom: 12, backgroundColor: "transparent" },
  image: { width: "100%", height: 150, resizeMode: "contain" },
  panelTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  separatorContainer: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  line: { flex: 1, height: 1 },
  separatorText: { marginHorizontal: 10, fontSize: 16, fontWeight: "bold" },
  seccionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 6 },
  seccionTitle: { fontSize: 16, fontWeight: "bold" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 10 },
  cardLight: { width: "31%", paddingVertical: 18, alignItems: "center", borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardLightBig: { width: "48%", paddingVertical: 18, alignItems: "center", borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardTextLight: { fontSize: 12, marginTop: 8, textAlign: "center", fontWeight: "500" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: "100%", elevation: 6, marginBottom: 40 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-start", paddingTop: 100, paddingHorizontal: 20 },
  modalCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", elevation: 8 },
  modalHeader: { flexDirection: "row", alignItems: "center", padding: 16 },
  modalAvatarCircle: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  modalNombre: { fontSize: 16, fontWeight: "bold" },
  modalRol: { fontSize: 13, marginTop: 2 },
  modalEmail: { fontSize: 12, marginTop: 2 },
  modalDivider: { height: 1, width: "100%" },
  modalOpcion: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  modalOpcionTexto: { fontSize: 15, fontWeight: "500", flex: 1 },
  temaSwitch: { width: 44, height: 24, borderRadius: 12, padding: 2, justifyContent: "center" },
  temaSwitchCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
});