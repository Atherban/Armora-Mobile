import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Text,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, SlideInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "@/src/constants/api";

const { width } = Dimensions.get("window");
const COLORS = { primary: "#00bf8f" };

export default function ScanQRCode() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [qrAnalysis, setQrAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ===== HANDLE CAMERA PERMISSION =====
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000", "#000"]} style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={64} color="#fff" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Armorax needs camera access to scan QR codes and analyze their
            security. Your privacy is protected.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permissionButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, "#007a5c"]}
              style={styles.permissionButtonGradient}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.permissionButtonText}>
                Allow Camera Access
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ===== SCAN HANDLER =====
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setScanResult(data);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/qr/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data }),
      });

      const result = await response.json();

      if (response.ok && result?.analysis) {
        setQrAnalysis(result.analysis);
      } else {
        Alert.alert("Analysis Failed", "Could not analyze the QR code.");
        setQrAnalysis(null);
      }
    } catch (err) {
      console.error("QR Analysis Error:", err);
      Alert.alert("Error", "Unable to analyze this QR code right now.");
    } finally {
      setLoading(false);
    }
  };

  // ===== UI HELPERS =====
  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "#00ffcc";
      case "medium":
        return "#FFD700";
      case "high":
        return "#ff4d4d";
      default:
        return "#888";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "shield-checkmark";
      case "medium":
        return "warning";
      case "high":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  // ===== MAIN RENDER =====
  return (
    <SafeAreaView style={styles.container}>
      {!scanned ? (
        // ===== SCANNER VIEW =====
        <View style={styles.scannerContainer}>
          <Animated.View
            entering={FadeInUp.duration(800)}
            style={styles.headerSection}
          >
            <LinearGradient
              colors={[COLORS.primary, "#001510"]}
              style={styles.headerCard}
            >
              <Ionicons name="qr-code-outline" size={32} color="#fff" />
              <Text style={styles.title}>QR Security Scanner</Text>
              <Text style={styles.subtitle}>
                Scan any QR code to instantly analyze security risks
              </Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(600).delay(200)}
            style={styles.scannerSection}
          >
            <View style={styles.scannerFrame}>
              <CameraView
                style={styles.scanner}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
              <View style={styles.scanLine} />
            </View>
            <Text style={styles.scanInstruction}>
              Position QR code within the frame
            </Text>
          </Animated.View>
        </View>
      ) : (
        // ===== RESULT VIEW =====
        <Animated.View entering={SlideInDown.duration(700)}>
          <ScrollView contentContainerStyle={styles.resultsContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>
                  Analyzing security risks...
                </Text>
              </View>
            ) : (
              qrAnalysis && (
                <View>
                  {/* HEADER */}
                  <LinearGradient
                    colors={[COLORS.primary, "#001510"]}
                    style={styles.resultHeaderCard}
                  >
                    <Ionicons
                      name={getRiskIcon(qrAnalysis.riskLevel)}
                      size={48}
                      color={getRiskColor(qrAnalysis.riskLevel)}
                    />
                    <Text style={styles.resultTitle}>Scan Complete</Text>
                    <Text style={styles.resultSubtitle}>
                      Risk Level: {qrAnalysis.riskLevel?.toUpperCase()}
                    </Text>
                  </LinearGradient>

                  {/* BASIC DETAILS */}
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Scanned URL:</Text>
                    <Text style={styles.infoValue} selectable>
                      {qrAnalysis.scannedUrl}
                    </Text>

                    <Text style={styles.infoLabel}>Domain:</Text>
                    <Text style={styles.infoValue}>{qrAnalysis.domain}</Text>

                    <Text style={styles.infoLabel}>Protocol:</Text>
                    <Text style={styles.infoValue}>{qrAnalysis.protocol}</Text>

                    <Text style={styles.infoLabel}>IP Address:</Text>
                    <Text style={styles.infoValue}>{qrAnalysis.ipAddress}</Text>

                    <Text style={styles.infoLabel}>SSL Valid:</Text>
                    <Text style={styles.infoValue}>
                      {qrAnalysis.sslValid ? "✅ Yes" : "❌ No"}
                    </Text>

                    <Text style={styles.infoLabel}>HTTP Status:</Text>
                    <Text style={styles.infoValue}>
                      {qrAnalysis.httpStatus}
                    </Text>
                  </View>

                  {/* WHOIS DETAILS */}
                  <View style={styles.infoCard}>
                    <Text style={styles.cardHeaderText}>WHOIS Information</Text>
                    <Text style={styles.infoValue}>
                      Registrar: {qrAnalysis.whois?.registrar}
                    </Text>
                    <Text style={styles.infoValue}>
                      Country: {qrAnalysis.whois?.country}
                    </Text>
                    <Text style={styles.infoValue}>
                      Created On: {qrAnalysis.whois?.creationDate}
                    </Text>
                  </View>

                  {/* FLAGS */}
                  <View style={styles.infoCard}>
                    <Text style={styles.cardHeaderText}>Threat Indicators</Text>
                    <Text style={styles.infoValue}>
                      Suspicious: {qrAnalysis.isSuspicious ? "⚠️ Yes" : "✅ No"}
                    </Text>
                    <Text style={styles.infoValue}>
                      Phishing Detected:{" "}
                      {qrAnalysis.isPhishing ? "🚨 Yes" : "✅ No"}
                    </Text>
                  </View>

                  {/* RECOMMENDATIONS */}
                  {qrAnalysis.recommendations?.length > 0 && (
                    <View style={styles.infoCard}>
                      <Text style={styles.cardHeaderText}>Recommendations</Text>
                      {qrAnalysis.recommendations.map(
                        (tip: string, idx: number) => (
                          <Text key={idx} style={styles.tipText}>
                            • {tip}
                          </Text>
                        )
                      )}
                    </View>
                  )}

                  {/* TIMESTAMP */}
                  <Text style={styles.timestamp}>
                    ⏱ Scanned at:{" "}
                    {new Date(qrAnalysis.timestamp).toLocaleString()}
                  </Text>

                  {/* ACTION BUTTONS */}
                  <View style={styles.actionsGrid}>
                    {scanResult?.startsWith("http") && (
                      <TouchableOpacity
                        style={styles.primaryAction}
                        onPress={() => Linking.openURL(scanResult)}
                      >
                        <LinearGradient
                          colors={[COLORS.primary, "#007a5c"]}
                          style={styles.primaryActionGradient}
                        >
                          <Ionicons
                            name="open-outline"
                            size={20}
                            color="#fff"
                          />
                          <Text style={styles.primaryActionText}>
                            Open Link
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.secondaryAction}
                      onPress={() => {
                        setScanned(false);
                        setScanResult(null);
                        setQrAnalysis(null);
                      }}
                    >
                      <Ionicons
                        name="scan-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                      <Text style={styles.secondaryActionText}>
                        Scan Another QR
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            )}
          </ScrollView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  permissionCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    margin: 16,
    borderRadius: 24,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginVertical: 8,
    textAlign: "center",
  },
  permissionText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  permissionButton: { width: "100%", borderRadius: 16, overflow: "hidden" },
  permissionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  scannerContainer: { flex: 1, padding: 16 },
  headerSection: { marginBottom: 24 },
  headerCard: { borderRadius: 20, padding: 24, alignItems: "center" },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
  },
  scannerSection: { alignItems: "center" },
  scannerFrame: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(0,191,143,0.3)",
    marginBottom: 16,
  },
  scanner: { width: "100%", height: "100%" },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00bf8f",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#00bf8f",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00bf8f",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#00bf8f",
  },
  scanLine: {
    position: "absolute",
    top: "50%",
    left: "10%",
    right: "10%",
    height: 2,
    backgroundColor: "#00bf8f",
  },
  scanInstruction: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
  resultsContent: { padding: 16 },
  resultHeaderCard: { borderRadius: 20, padding: 24, alignItems: "center" },
  resultTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
  },
  resultSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  infoLabel: {
    color: "#00bf8f",
    fontWeight: "700",
    marginTop: 6,
  },
  infoValue: {
    color: "#fff",
    fontSize: 14,
  },
  cardHeaderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  tipText: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  timestamp: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
  loadingContainer: { alignItems: "center", marginTop: 50 },
  loadingText: { color: COLORS.primary, marginTop: 12 },
  actionsGrid: { marginTop: 16 },
  primaryAction: { borderRadius: 16, overflow: "hidden", marginBottom: 10 },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
  },
  secondaryActionText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
