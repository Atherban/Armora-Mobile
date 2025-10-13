// frontend/app/(features)/WiFiSecurity.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import * as Network from "expo-network";

const BACKEND_URL = "http://192.168.29.165:5000"; // 👈 your PC's LAN IP

interface WifiData {
  ssid: string;
  bssid?: string;
  ipAddress: string;
  isConnected: boolean;
  type?: string;
}

console.log("🧩 WiFiSecurityScreen rendered!");

const WifiSecurityScreen = () => {
  const [wifiInfo, setWifiInfo] = useState<WifiData | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionType, setConnectionType] = useState<string>("UNKNOWN");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  console.log("🧩 WiFiSecurityScreen rendered!");

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        console.log("🔑 Requesting Android permissions...");
        const granted = await Promise.race([
          PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Permission timeout")), 5000)
          ),
        ]);
        console.log("✅ Permissions done:", granted);
      } catch (err) {
        if (err instanceof Error) {
          console.warn("⚠️ Permission request error:", err.message);
        } else {
          console.warn("⚠️ Unknown error during permission request:", err);
        }
      }
    } else {
      console.log("ℹ️ iOS: Permissions not required for this feature.");
    }
  };

  const handleScan = async () => {
    console.log("⚙️ handleScan() started");
    setLoading(true);
    setError("");
    setScanResult(null);

    try {
      await requestPermissions();
      console.log("✅ Permissions done");

      // ✅ Fetch actual network info
      const state = await Network.getNetworkStateAsync();
      const ipAddress = await Network.getIpAddressAsync();

      const wifiData: WifiData = {
        ssid: "Unavailable in Expo Go",
        bssid: "N/A",
        ipAddress: ipAddress || "N/A",
        isConnected: state.isConnected ?? false,
        type: state.type ? state.type.toUpperCase() : "UNKNOWN",
      };

      // Store connection info for the badge
      setConnectionType(wifiData.type || "UNKNOWN");
      setIsConnected(wifiData.isConnected);

      setWifiInfo(wifiData);

      console.log("📡 Attempting to POST to:", `${BACKEND_URL}/api/wifi-scan`);
      console.log("📶 Wi-Fi Data:", wifiData);

      const res = await axios.post(`${BACKEND_URL}/api/wifi-scan`, wifiData);
      console.log("✅ Backend Response:", res.data);
      setScanResult(res.data);
    } catch (err: any) {
      console.error("❌ Wi-Fi scan error:", err.message);
      setError(err.message || "Failed to get Wi-Fi info.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Small helper to style the badge color
  const getBadgeStyle = () => {
    if (!isConnected) return [styles.badge, { backgroundColor: "#B22222" }]; // red
    if (connectionType === "WIFI")
      return [styles.badge, { backgroundColor: "#00bf8f" }]; // green
    if (connectionType === "CELLULAR")
      return [styles.badge, { backgroundColor: "#FFD700" }]; // yellow
    return [styles.badge, { backgroundColor: "#808080" }]; // gray
  };

  const getBadgeText = () => {
    if (!isConnected) return "🔴 No Connection";
    if (connectionType === "WIFI") return "🟢 Connected via Wi-Fi";
    if (connectionType === "CELLULAR") return "🟡 Using Mobile Data";
    return "⚪ Unknown Network";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Connection Badge */}
      <View style={getBadgeStyle()}>
        <Text style={styles.badgeText}>{getBadgeText()}</Text>
      </View>

      <Text style={styles.title}>Wi-Fi Security Scanner</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log("👆 Button pressed!");
          handleScan();
        }}
      >
        <Text style={styles.buttonText}>
          {loading ? "Scanning..." : "Scan Wi-Fi"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator color="#00bf8f" style={{ marginTop: 10 }} />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {wifiInfo && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Network Details</Text>
          <Text>SSID: {wifiInfo.ssid}</Text>
          <Text>BSSID: {wifiInfo.bssid}</Text>
          <Text>IP: {wifiInfo.ipAddress}</Text>
          <Text>Type: {wifiInfo.type}</Text>
        </View>
      )}

      {scanResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Security Analysis</Text>
          <Text>Status: {scanResult.status}</Text>
          <Text>Threat Level: {scanResult.threatLevel}</Text>
          <Text>Confidence: {scanResult.confidence}%</Text>
          {scanResult.recommendations?.map((r: string, i: number) => (
            <Text key={i}>• {r}</Text>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#00bf8f",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  button: { backgroundColor: "#00bf8f", padding: 14, borderRadius: 10 },
  buttonText: { color: "white", fontSize: 16 },
  error: { color: "red", marginTop: 12 },
  resultBox: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
  },
  resultTitle: {
    color: "#00bf8f",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default WifiSecurityScreen;
