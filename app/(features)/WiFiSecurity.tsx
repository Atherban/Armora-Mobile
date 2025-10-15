import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Network from "expo-network";
import * as Location from "expo-location";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@/src/constants/api";
import COLORS from "@/src/constants/colors";

const { width } = Dimensions.get("window");

export default function WiFiSecurityScreen() {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [wifiInfo, setWifiInfo] = useState<any>(null);
  const [error, setError] = useState("");

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission is required to scan Wi-Fi networks.");
      return false;
    }
    return true;
  };

  const handleScan = async () => {
    try {
      setError("");
      setLoading(true);
      setScanResult(null);

      const permissionGranted = await requestPermissions();
      if (!permissionGranted) return;

      const network = await Network.getNetworkStateAsync();
      const ip = await Network.getIpAddressAsync();

      const wifiData = {
        ssid: "Unavailable in Expo Go",
        ipAddress: ip,
        isConnected: network.isConnected,
        type: network.type,
      };

      setWifiInfo(wifiData);

      const res = await axios.post(`${API_URL}/wifi-scan`, wifiData);
      setScanResult({
        ...res.data,
        encryption: "WPA2-Personal", // Mocked until native API support
        signalStrength: Math.floor(Math.random() * 60) + 40, // Random 40-100%
        timestamp: new Date().toLocaleString(),
        networkVisibility: ip.startsWith("192.168") ? "Private" : "Public",
      });
    } catch (err: any) {
      setError("Failed to scan Wi-Fi network. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Safe":
        return "#00ffcc";
      case "Unsafe":
        return "#ff4d4d";
      default:
        return "#FFD700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Safe":
        return "shield-checkmark";
      case "Unsafe":
        return "warning";
      default:
        return "alert-circle-outline";
    }
  };

  const getSignalQuality = (strength: number) => {
    if (strength > 80) return "Excellent";
    if (strength > 60) return "Good";
    if (strength > 40) return "Fair";
    return "Weak";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#00bf8f", "#001510"]}
          style={styles.headerCard}
        >
          <Ionicons name="wifi" size={60} color="#fff" />
          <Text style={styles.title}>Wi-Fi Security Scanner</Text>
          <Text style={styles.subtitle}>
            Analyze your connection for potential risks
          </Text>
        </LinearGradient>

        {/* BUTTON */}
        <TouchableOpacity
          onPress={handleScan}
          disabled={loading}
          style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
        >
          <LinearGradient
            colors={["#00bf8f", "#007a5c"]}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Scan Now</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* INFO CARD */}
        {wifiInfo && (
          <Animated.View entering={FadeInDown.duration(700)}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>📡 Connection Info</Text>
              {[
                ["SSID", wifiInfo.ssid],
                ["IP Address", wifiInfo.ipAddress],
                ["Type", wifiInfo.type],
                ["Connected", wifiInfo.isConnected ? "Yes ✅" : "No ❌"],
              ].map(([label, value], idx) => (
                <View key={idx} style={styles.infoItem}>
                  <Text style={styles.infoKey}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* RESULT CARD */}
        {scanResult && (
          <Animated.View
            entering={FadeInDown.duration(800).delay(200)}
            style={[
              styles.resultCard,
              { borderColor: getStatusColor(scanResult.status) },
            ]}
          >
            <View style={styles.statusHeader}>
              <Ionicons
                name={getStatusIcon(scanResult.status)}
                size={32}
                color={getStatusColor(scanResult.status)}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(scanResult.status) },
                ]}
              >
                {scanResult.status}
              </Text>
            </View>

            <Text style={styles.threatText}>
              Threat: {scanResult.threatLevel}
            </Text>
            <Text style={styles.confidence}>
              Confidence: {scanResult.confidence}%
            </Text>

            {/* ADDITIONAL DETAILS */}
            <View style={styles.extraInfo}>
              <Text style={styles.sectionTitle}>🔐 Additional Details</Text>
              <Text style={styles.detailText}>
                Encryption: {scanResult.encryption}
              </Text>
              <Text style={styles.detailText}>
                Signal Strength: {scanResult.signalStrength}% (
                {getSignalQuality(scanResult.signalStrength)})
              </Text>
              <Text style={styles.detailText}>
                Network Type: {scanResult.networkVisibility}
              </Text>
              <Text style={styles.detailText}>
                Last Scan: {scanResult.timestamp}
              </Text>

              {/* RISK BAR */}
              <View style={styles.riskBarContainer}>
                <LinearGradient
                  colors={["#ff4d4d", "#FFD700", COLORS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.riskBar,
                    { width: `${scanResult.confidence}%` },
                  ]}
                />
              </View>
            </View>

            {/* RECOMMENDATIONS */}
            {scanResult.recommendations?.length > 0 && (
              <View style={{ marginTop: 15 }}>
                <Text style={styles.sectionTitle}>💡 Recommendations</Text>
                {scanResult.recommendations.map((r: string, i: number) => (
                  <Text key={i} style={styles.recommendationText}>
                    • {r}
                  </Text>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerCard: {
    width: width * 0.9,
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 30,
    shadowColor: "#00bf8f",
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#aaa", fontSize: 14, marginTop: 5 },
  button: { width: width * 0.6, borderRadius: 12, marginTop: 10 },
  buttonGradient: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  error: { color: "#ff4d4d", marginTop: 16, textAlign: "center", fontSize: 14 },
  infoCard: {
    backgroundColor: "#111",
    borderRadius: 15,
    padding: 18,
    width: width * 0.9,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  sectionTitle: {
    color: "#00bf8f",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  infoKey: { color: "#888", fontSize: 13 },
  infoValue: { color: "#fff", fontSize: 13, fontWeight: "500" },
  resultCard: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1.5,
    borderRadius: 15,
    padding: 20,
    marginTop: 30,
    width: width * 0.9,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  statusText: { fontSize: 22, fontWeight: "700" },
  threatText: { color: "#ccc", fontSize: 14, marginVertical: 4 },
  confidence: { color: "#888", fontSize: 13 },
  extraInfo: { marginTop: 12 },
  detailText: { color: "#ddd", fontSize: 13, marginVertical: 2 },
  riskBarContainer: {
    marginTop: 10,
    height: 8,
    width: "100%",
    backgroundColor: "#222",
    borderRadius: 5,
    overflow: "hidden",
  },
  riskBar: { height: "100%", borderRadius: 5 },
  recommendationText: { color: "#fff", fontSize: 14, marginVertical: 2 },
});
