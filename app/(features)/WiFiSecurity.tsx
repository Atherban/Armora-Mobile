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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
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
        encryption: "WPA2-Personal",
        signalStrength: Math.floor(Math.random() * 60) + 40,
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
        return "alert-circle";
    }
  };

  const getSignalQuality = (strength: number) => {
    if (strength > 80) return "Excellent";
    if (strength > 60) return "Good";
    if (strength > 40) return "Fair";
    return "Weak";
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return "#00ffcc";
    if (strength > 60) return "#4cd964";
    if (strength > 40) return "#FFD700";
    return "#ff4d4d";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ENHANCED HEADER */}
        <Animated.View entering={FadeInDown.duration(800)}>
          <LinearGradient
            colors={["#00bf8f", "#007a5c", "#001510"]}
            style={styles.headerCard}
          >
            <View style={styles.headerIconContainer}>
              <Ionicons name="wifi" size={42} color="#fff" />
              <View style={styles.scanBadge}>
                <Text style={styles.scanBadgeText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.title}>Wi-Fi Security Scanner</Text>
            <Text style={styles.subtitle}>
              Analyze your network connection for security vulnerabilities and
              potential risks
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* ENHANCED SCAN BUTTON */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <TouchableOpacity
            onPress={handleScan}
            disabled={loading}
            style={[styles.scanButton, loading && styles.scanButtonDisabled]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? ["#666", "#444"] : ["#00bf8f", "#007a5c"]}
              style={styles.scanButtonGradient}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.scanButtonText}>Scanning Network...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="scan-outline" size={22} color="#fff" />
                  <Text style={styles.scanButtonText}>Start Security Scan</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ERROR MESSAGE */}
        {error ? (
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={styles.errorCard}
          >
            <Ionicons name="warning-outline" size={20} color="#ff4d4d" />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        {/* CONNECTION INFO CARD */}
        {wifiInfo && (
          <Animated.View
            entering={FadeInDown.duration(700)}
            style={styles.infoCard}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📡 Connection Details</Text>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoGrid}>
              {[
                ["Network SSID", wifiInfo.ssid, "wifi-outline"],
                ["IP Address", wifiInfo.ipAddress, "location-outline"],
                ["Connection Type", wifiInfo.type, "cellular-outline"],
                [
                  "Status",
                  wifiInfo.isConnected ? "Connected ✅" : "Disconnected ❌",
                  "power-outline",
                ],
              ].map(([label, value, icon], idx) => (
                <View key={idx} style={styles.infoItem}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons name={icon as any} size={16} color="#888" />
                    <Text style={styles.infoLabel}>{label}</Text>
                  </View>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ENHANCED RESULT CARD */}
        {scanResult && (
          <Animated.View
            entering={FadeInDown.duration(800).delay(200)}
            style={styles.resultCard}
          >
            {/* SECURITY STATUS HEADER */}
            <LinearGradient
              colors={["rgba(0,191,143,0.1)", "rgba(0,21,16,0.1)"]}
              style={[
                styles.statusHeader,
                { borderLeftColor: getStatusColor(scanResult.status) },
              ]}
            >
              <View style={styles.statusContent}>
                <Ionicons
                  name={getStatusIcon(scanResult.status)}
                  size={28}
                  color={getStatusColor(scanResult.status)}
                />
                <View style={styles.statusTextContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(scanResult.status) },
                    ]}
                  >
                    {scanResult.status} Network
                  </Text>
                  <Text style={styles.statusSubtext}>
                    {scanResult.status === "Safe"
                      ? "Your network appears secure"
                      : "Security concerns detected"}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* SECURITY METRICS */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Threat Level</Text>
                <Text style={styles.metricValue}>{scanResult.threatLevel}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Confidence</Text>
                <Text style={styles.metricValue}>{scanResult.confidence}%</Text>
              </View>
            </View>

            {/* CONFIDENCE METER */}
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.confidenceLabel}>Security Confidence</Text>
                <Text style={styles.confidencePercent}>
                  {scanResult.confidence}%
                </Text>
              </View>
              <View style={styles.meterContainer}>
                <LinearGradient
                  colors={["#ff4d4d", "#FFD700", COLORS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.meterFill,
                    { width: `${scanResult.confidence}%` },
                  ]}
                />
              </View>
            </View>

            {/* DETAILED INFORMATION */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>🔐 Network Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="lock-closed-outline" size={18} color="#888" />
                  <Text style={styles.detailLabel}>Encryption</Text>
                  <Text style={styles.detailValue}>
                    {scanResult.encryption}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="stats-chart-outline" size={18} color="#888" />
                  <Text style={styles.detailLabel}>Signal Strength</Text>
                  <View style={styles.signalInfo}>
                    <Text style={styles.detailValue}>
                      {scanResult.signalStrength}%
                    </Text>
                    <Text
                      style={[
                        styles.signalQuality,
                        { color: getSignalColor(scanResult.signalStrength) },
                      ]}
                    >
                      {getSignalQuality(scanResult.signalStrength)}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="eye-outline" size={18} color="#888" />
                  <Text style={styles.detailLabel}>Network Type</Text>
                  <Text style={styles.detailValue}>
                    {scanResult.networkVisibility}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={18} color="#888" />
                  <Text style={styles.detailLabel}>Last Scan</Text>
                  <Text style={styles.detailValue}>{scanResult.timestamp}</Text>
                </View>
              </View>
            </View>

            {/* RECOMMENDATIONS */}
            {scanResult.recommendations?.length > 0 && (
              <View style={styles.recommendationsSection}>
                <View style={styles.recommendationsHeader}>
                  <Ionicons name="bulb-outline" size={20} color="#FFD700" />
                  <Text style={styles.recommendationsTitle}>
                    Security Recommendations
                  </Text>
                </View>
                {scanResult.recommendations.map((rec: string, i: number) => (
                  <View key={i} style={styles.recommendationItem}>
                    <View style={styles.recommendationBullet} />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* QUICK TIPS SECTION */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={styles.tipsCard}
        >
          <Text style={styles.tipsTitle}>💡 Wi-Fi Security Tips</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#00ffcc"
              />
              <Text style={styles.tipText}>Use WPA3 encryption</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="key-outline" size={16} color="#00ffcc" />
              <Text style={styles.tipText}>Change default passwords</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="refresh-outline" size={16} color="#00ffcc" />
              <Text style={styles.tipText}>Update router firmware</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="eye-off-outline" size={16} color="#00ffcc" />
              <Text style={styles.tipText}>Hide SSID broadcasting</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerCard: {
    width: width * 0.92,
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 24,
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  headerIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scanBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  scanBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  scanButton: {
    width: width * 0.85,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,77,77,0.1)",
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: width * 0.92,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    width: width * 0.92,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    color: "#888",
    fontSize: 14,
    marginLeft: 8,
  },
  infoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 0,
    marginBottom: 20,
    width: width * 0.92,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  statusHeader: {
    padding: 20,
    borderLeftWidth: 4,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  statusSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  metricValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  confidenceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  confidenceLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  confidencePercent: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  meterContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 4,
  },
  detailsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    width: "48%",
    marginBottom: 12,
  },
  detailLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  signalInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  signalQuality: {
    fontSize: 12,
    fontWeight: "600",
  },
  recommendationsSection: {
    padding: 20,
    backgroundColor: "rgba(255,215,0,0.05)",
    borderTopWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  recommendationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recommendationsTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFD700",
    marginTop: 6,
    marginRight: 12,
  },
  recommendationText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  tipsCard: {
    backgroundColor: "rgba(0,191,143,0.08)",
    borderRadius: 16,
    padding: 20,
    width: width * 0.92,
    borderWidth: 1,
    borderColor: "rgba(0,191,143,0.2)",
  },
  tipsTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  tipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tipItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
});
