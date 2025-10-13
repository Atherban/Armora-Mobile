import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

// --- Interface to represent analyzed app data structure ---
interface AnalyzedApp {
  name: string;
  permissions: string[];
  risk: "Danger" | "Medium" | "Safe";
}

// --- Constants for consistent design styling ---
const ACCENT = "#00bf8f";
const DARK_BG = "#000";
const CARD_BG = "#151515";
const SPACING = 18;

// --- Mock function to simulate analyzing installed apps (fake async delay) ---
const mockAnalyzeApps = () => {
  const apps: AnalyzedApp[] = [
    {
      name: "BankingApp",
      permissions: ["CAMERA", "LOCATION", "STORAGE"],
      risk: "Danger",
    },
    { name: "GamePro", permissions: ["STORAGE"], risk: "Medium" },
    { name: "Notes", permissions: [], risk: "Safe" },
    { name: "SocialX", permissions: ["CONTACTS", "LOCATION"], risk: "Medium" },
    { name: "VPNGuard", permissions: ["NONE"], risk: "Safe" },
    { name: "UnknownApp", permissions: ["SMS", "CALL_LOG"], risk: "Danger" },
  ];

  // Simulates a delay before returning analyzed app data
  return new Promise<AnalyzedApp[]>((resolve) =>
    setTimeout(() => resolve(apps), 1500)
  );
};

export default function AppPermissions() {
  // --- State management ---
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalyzedApp[]>([]);

  // --- Handler to trigger app scan (simulated) ---
  const handleScan = async () => {
    setLoading(true);
    const analyzedApps = await mockAnalyzeApps();
    setResults(analyzedApps);
    setLoading(false);
  };

  // --- Categorize analyzed apps based on risk level ---
  const dangerApps = results.filter((a) => a.risk === "Danger");
  const mediumApps = results.filter((a) => a.risk === "Medium");
  const safeApps = results.filter((a) => a.risk === "Safe");

  // --- Function to render each risk category section dynamically ---
  const renderRiskSection = (
    title: string,
    data: AnalyzedApp[],
    color: string,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View style={{ marginBottom: 28 }}>
      {/* Section Header */}
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>

      {/* Empty state when no apps found in this risk category */}
      {data.length === 0 ? (
        <Text style={styles.emptyText}>
          No {title.toLowerCase()} apps found.
        </Text>
      ) : (
        // Render app list with smooth fade-in animation
        data.map((app) => (
          <Animated.View
            entering={FadeInDown.duration(400)}
            key={app.name}
            style={[styles.appCard, { borderLeftColor: color }]}
          >
            {/* Card Header (icon + name) */}
            <View style={styles.cardHeader}>
              <Ionicons name={icon} size={20} color={color} />
              <Text style={[styles.appName, { color }]}>{app.name}</Text>
            </View>

            {/* Permissions List */}
            <Text style={styles.permText}>
              Permissions: {app.permissions.join(", ") || "None"}
            </Text>
          </Animated.View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Title Section --- */}
        <Animated.View entering={FadeInUp.duration(600)}>
          <Text style={styles.title}>App Analysis</Text>
          <Text style={styles.subtitle}>
            Scan your installed apps to assess their security level instantly.
          </Text>
        </Animated.View>

        {/* --- Scan Button --- */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.center}>
          <TouchableOpacity
            style={[styles.scanButton, loading && { opacity: 0.6 }]}
            onPress={handleScan}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Scan Installed Apps"
          >
            <Ionicons name="shield-checkmark" color={ACCENT} size={22} />
            <Text style={styles.scanButtonText}>
              {loading ? "Scanning..." : "Scan Installed Apps"}
            </Text>
          </TouchableOpacity>

          {/* Loader indicator while scanning */}
          {loading && (
            <ActivityIndicator color={ACCENT} style={{ marginTop: 12 }} />
          )}
        </Animated.View>

        {/* --- Results Section --- */}
        <Animated.View entering={FadeInDown.duration(700)} style={{ flex: 1 }}>
          {/* Subtle gradient overlay for smooth transition effect */}
          <LinearGradient
            colors={["#000", "rgba(0,0,0,0.5)", "transparent"]}
            style={{
              position: "absolute",
              zIndex: 1,
              top: -20,
              height: 60,
              width: "100%",
            }}
          />

          {/* ScrollView to display categorized app results */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            {/* Render risk-level sections dynamically once results are loaded */}
            {results.length > 0 && (
              <>
                {renderRiskSection("Danger", dangerApps, "#ff4d4f", "alert")}
                {renderRiskSection("Medium", mediumApps, "#ffa940", "warning")}
                {renderRiskSection(
                  "Safe",
                  safeApps,
                  ACCENT,
                  "shield-checkmark"
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- Layout Containers ---
  safeArea: { flex: 1, backgroundColor: DARK_BG },
  container: { flex: 1, padding: SPACING, backgroundColor: DARK_BG, gap: 12 },

  // --- Header Text ---
  title: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    color: ACCENT,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textShadowColor: ACCENT,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    marginTop: 6,
    color: "#ccc",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    maxWidth: 340,
    alignSelf: "center",
  },

  // --- Button Styles ---
  center: { alignItems: "center", marginVertical: 24 },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    justifyContent: "center",
    gap: 10,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // --- Section & Card Styles ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
    marginLeft: 6,
  },
  appCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  appName: {
    fontSize: 16,
    fontWeight: "600",
  },
  permText: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 4,
  },
});
