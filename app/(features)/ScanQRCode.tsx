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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function ScanQRCode() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [securityLevel, setSecurityLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [riskType, setRiskType] = useState<"safe" | "warning" | "danger">(
    "safe"
  );

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color="#00bf8f" size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#001510", "#00bf8f"]}
          style={styles.permissionCard}
        >
          <Ionicons name="camera-outline" size={64} color="#fff" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Armorax needs camera access to scan QR codes and analyze their
            security. Your privacy is protected - we only process the QR
            content.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permissionButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#00bf8f", "#007a5c"]}
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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScanResult(data);
    setLoading(true);

    setTimeout(() => {
      let level = "Unknown/Check Carefully";
      let risk: "safe" | "warning" | "danger" = "warning";

      if (data.startsWith("https://")) {
        level = "Secure Website Link";
        risk = "safe";
      } else if (data.startsWith("http://")) {
        level = "Unencrypted Website Link";
        risk = "warning";
      } else if (data.match(/^[0-9]+$/)) {
        level = "Numeric Code (Low Risk)";
        risk = "safe";
      } else if (data.includes("password") || data.includes("login")) {
        level = "Potential Credential Risk";
        risk = "danger";
      } else if (data.startsWith("tel:") || data.startsWith("mailto:")) {
        level = "Contact Action (Safe)";
        risk = "safe";
      }

      setSecurityLevel(level);
      setRiskType(risk);
      setLoading(false);
    }, 1500);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "safe":
        return "#00ffcc";
      case "warning":
        return "#FFD700";
      case "danger":
        return "#ff4d4d";
      default:
        return "#888";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "safe":
        return "shield-checkmark";
      case "warning":
        return "warning";
      case "danger":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!scanned ? (
        // SCANNER VIEW
        <View style={styles.scannerContainer}>
          <Animated.View
            entering={FadeInUp.duration(800)}
            style={styles.headerSection}
          >
            <LinearGradient
              colors={["#00bf8f", "#001510"]}
              style={styles.headerCard}
            >
              <View style={styles.headerIcon}>
                <Ionicons name="qr-code-outline" size={32} color="#fff" />
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.title}>QR Security Scanner</Text>
              <Text style={styles.subtitle}>
                Scan any QR code to instantly analyze security risks and
                potential threats
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

              {/* Scanner Overlay */}
              <View style={styles.scannerOverlay}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>

              <View style={styles.scanLine} />
            </View>

            <Text style={styles.scanInstruction}>
              Position QR code within the frame
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(500).delay(400)}
            style={styles.tipsSection}
          >
            <View style={styles.tipsCard}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#00bf8f"
              />
              <Text style={styles.tipsTitle}>QR Safety Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipText}>
                  • Verify sender before scanning
                </Text>
                <Text style={styles.tipText}>
                  • Check URL destinations carefully
                </Text>
                <Text style={styles.tipText}>
                  • Avoid QR codes in public places
                </Text>
                <Text style={styles.tipText}>
                  • Use trusted QR code generators
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      ) : (
        // RESULTS VIEW
        <Animated.View
          entering={SlideInDown.duration(700)}
          style={styles.resultsContainer}
        >
          <ScrollView
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.resultHeader}>
              <LinearGradient
                colors={["#00bf8f", "#001510"]}
                style={styles.resultHeaderCard}
              >
                <Ionicons
                  name={getRiskIcon(riskType)}
                  size={48}
                  color={getRiskColor(riskType)}
                />
                <Text style={styles.resultTitle}>Scan Complete</Text>
                <Text style={styles.resultSubtitle}>
                  QR code analyzed for security risks
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.resultDetails}>
              {/* Security Status */}
              <View style={styles.securityStatusCard}>
                <View style={styles.statusHeader}>
                  <Text style={styles.statusLabel}>Security Assessment</Text>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(riskType) },
                    ]}
                  >
                    <Ionicons
                      name={getRiskIcon(riskType)}
                      size={14}
                      color="#000"
                    />
                    <Text style={styles.riskBadgeText}>{securityLevel}</Text>
                  </View>
                </View>

                {loading ? (
                  <View style={styles.loadingSection}>
                    <ActivityIndicator size="large" color="#00bf8f" />
                    <Text style={styles.loadingText}>
                      Analyzing security risks...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.securityDetails}>
                    <Text style={styles.securityDescription}>
                      {riskType === "safe"
                        ? "This QR code appears to be safe based on our analysis."
                        : riskType === "warning"
                        ? "Proceed with caution. This QR code may pose some risks."
                        : "High risk detected. Avoid interacting with this QR code."}
                    </Text>
                  </View>
                )}
              </View>

              {/* Scanned Content */}
              <View style={styles.contentCard}>
                <View style={styles.cardHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#00bf8f"
                  />
                  <Text style={styles.cardTitle}>Scanned Content</Text>
                </View>
                <View style={styles.contentBox}>
                  <Text style={styles.contentText} selectable>
                    {scanResult}
                  </Text>
                </View>
                <Text style={styles.contentType}>
                  Type:{" "}
                  {scanResult?.startsWith("http")
                    ? "Website URL"
                    : scanResult?.startsWith("tel")
                    ? "Phone Number"
                    : scanResult?.startsWith("mailto")
                    ? "Email Address"
                    : "Text Content"}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsGrid}>
                {scanResult && scanResult.startsWith("http") && !loading && (
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => Linking.openURL(scanResult)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#00bf8f", "#007a5c"]}
                      style={styles.primaryActionGradient}
                    >
                      <Ionicons name="open-outline" size={20} color="#fff" />
                      <Text style={styles.primaryActionText}>Open Link</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={() => {
                    setScanned(false);
                    setScanResult(null);
                    setSecurityLevel(null);
                    setRiskType("safe");
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="scan-outline" size={20} color="#00bf8f" />
                  <Text style={styles.secondaryActionText}>
                    Scan Another QR
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Additional Info */}
              <View style={styles.infoCard}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#00bf8f"
                />
                <Text style={styles.infoTitle}>Security Tips</Text>
                <Text style={styles.infoText}>
                  Always verify QR codes from unknown sources. Avoid scanning
                  codes in public places that could lead to phishing sites.
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  permissionText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  permissionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  scannerContainer: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  headerIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00ffcc",
    marginRight: 4,
  },
  liveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
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
    lineHeight: 20,
  },
  scannerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  scannerFrame: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(0,191,143,0.3)",
  },
  scanner: {
    width: "100%",
    height: "100%",
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00bf8f",
    borderTopLeftRadius: 20,
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
    borderTopRightRadius: 20,
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
    borderBottomLeftRadius: 20,
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
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: "absolute",
    top: "50%",
    left: "10%",
    right: "10%",
    height: 2,
    backgroundColor: "#00bf8f",
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  scanInstruction: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  tipsSection: {
    marginBottom: 16,
  },
  tipsCard: {
    backgroundColor: "rgba(0,191,143,0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,191,143,0.3)",
  },
  tipsTitle: {
    color: "#00bf8f",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    lineHeight: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  resultsContent: {
    padding: 16,
  },
  resultHeader: {
    marginBottom: 20,
  },
  resultHeaderCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  resultTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 4,
  },
  resultSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
  },
  resultDetails: {
    gap: 16,
  },
  securityStatusCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskBadgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 4,
  },
  loadingSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#00bf8f",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  securityDetails: {
    paddingVertical: 8,
  },
  securityDescription: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
  },
  contentCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  contentBox: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contentText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
  },
  contentType: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
  actionsGrid: {
    gap: 12,
  },
  primaryAction: {
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    backgroundColor: "rgba(0,191,143,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,191,143,0.3)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryActionText: {
    color: "#00bf8f",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "rgba(0,191,143,0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,191,143,0.3)",
  },
  infoTitle: {
    color: "#00bf8f",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  infoText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    lineHeight: 16,
  },
});
