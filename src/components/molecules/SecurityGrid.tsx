// src/components/SecurityGrid.tsx
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import FeatureCard from "../atoms/FeatureCard";
import { router } from "expo-router";

const CARD_GRADIENT = ["#00bf8f", "#001510"];

// Define valid routes as a const array for type safety
const VALID_ROUTES = [
  "ScanQRCode",
  "WiFiSecurity",
  "ScanSite",
  "SystemSecurity",
  "DataBreachSecurity",
  "AIAgent",
] as const;

type ValidRoute = (typeof VALID_ROUTES)[number];

interface Feature {
  id: string;
  label: string;
  redirect: ValidRoute;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    id: "1",
    label: "Scan QR Code",
    redirect: "ScanQRCode",
    icon: <Ionicons name="qr-code-outline" size={28} color="#fff" />,
  },
  {
    id: "2",
    label: "WiFi Security",
    redirect: "WiFiSecurity",
    icon: <Ionicons name="wifi-outline" size={28} color="#fff" />,
  },
  {
    id: "3",
    label: "Scan Website",
    redirect: "ScanSite",
    icon: <Feather name="globe" size={28} color="#fff" />,
  },
  {
    id: "4",
    label: "System Security",
    redirect: "SystemSecurity",
    icon: <MaterialIcons name="security" size={28} color="#fff" />,
  },
  {
    id: "5",
    label: "Data Breach Security",
    redirect: "DataBreachSecurity",
    icon: <Feather name="lock" size={28} color="#fff" />,
  },
  {
    id: "6",
    label: "Bot-X",
    redirect: "AIAgent",
    icon: <Ionicons name="logo-android" size={28} color="#fff" />,
  },
];

function navigateToFeatureScreen(feature: Feature) {
  // Use relative path for expo-router compatibility
  router.push({ pathname: `../(features)/${feature.redirect}` });
}

export default function SecurityGrid() {
  return (
    <FlatList
      data={features}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FeatureCard
          icon={item.icon}
          label={item.label}
          gradientColors={CARD_GRADIENT}
          style={styles.card}
          onPress={() => navigateToFeatureScreen(item)}
        />
      )}
      contentContainerStyle={styles.grid}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 100,
    height: 120,
    margin: 5,
  },
});
