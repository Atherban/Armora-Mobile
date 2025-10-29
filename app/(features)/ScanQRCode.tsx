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
import Animated, {
  FadeInUp,
  FadeInDown,
  SlideInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "@/src/constants/api";

const { width } = Dimensions.get("window");
const COLORS = { primary: "#00bf8f" };

// ======================
// Type Definitions
// ======================
interface QRAnalysis {
  scannedUrl: string;
  domain: string;
  protocol: string;
  ipAddress: string;
  sslValid: boolean;
  riskLevel: string;
  isSuspicious: boolean;
  isPhishing: boolean;
  whois: {
    registrar: string;
    creationDate: string;
    country: string;
  };
  httpStatus: string | number;
  recommendations: string[];
  timestamp: string;
}

interface QRAnalysisResponse {
  success?: boolean;
  message?: string;
  analysis?: QRAnalysis;
  data?: QRAnalysis;
}

function isQRAnalysis(obj: any): obj is QRAnalysis {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.riskLevel === "string" &&
    typeof obj.scannedUrl === "string"
  );
}

// ======================
// Components
// ======================
const PermissionScreen = ({
  onRequestPermission,
}: {
  onRequestPermission: () => void;
}) => (
  <SafeAreaView style={styles.container}>
    <LinearGradient
      colors={["#00bf8f", "#007a5c", "#001510"]}
      style={styles.permissionCard}
    >
      <View style={styles.headerIconContainer}>
        <Ionicons name="camera-outline" size={64} color="#fff" />
        <View style={styles.scanBadge}>
          <Text style={styles.scanBadgeText}>ACCESS</Text>
        </View>
      </View>
      <Text style={styles.permissionTitle}>Camera Access Required</Text>
      <Text style={styles.permissionText}>
        Armorax needs camera access to scan QR codes and analyze their security.
        Your privacy is protected - we don&apos;t store any images or videos.
      </Text>
      <TouchableOpacity
        onPress={onRequestPermission}
        style={styles.permissionButton}
      >
        <LinearGradient
          colors={[COLORS.primary, "#007a5c"]}
          style={styles.permissionButtonGradient}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  </SafeAreaView>
);

const ScannerView = ({
  onScan,
  scanned,
}: {
  onScan: (data: any) => void;
  scanned: boolean;
}) => (
  <View style={styles.scannerContainer}>
    <Animated.View entering={FadeInDown.duration(800)}>
      <LinearGradient
        colors={["#00bf8f", "#007a5c", "#001510"]}
        style={styles.headerCard}
      >
        <View style={styles.headerIconContainer}>
          <Ionicons name="qr-code-outline" size={42} color="#fff" />
          <View style={styles.scanBadge}>
            <Text style={styles.scanBadgeText}>ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.title}>QR Security Scanner</Text>
        <Text style={styles.subtitle}>
          Scan any QR code to instantly analyze security risks and potential
          threats
        </Text>
      </LinearGradient>
    </Animated.View>

    <Animated.View
      entering={FadeInDown.duration(600).delay(200)}
      style={styles.scannerSection}
    >
      <View style={styles.scannerFrame}>
        <CameraView
          style={styles.scanner}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : onScan}
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
);

const AnalysisResults = ({
  qrAnalysis,
  loading,
  scanResult,
  onScanAnother,
}: {
  qrAnalysis: QRAnalysis | null;
  loading: boolean;
  scanResult: string | null;
  onScanAnother: () => void;
}) => {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyzing security risks...</Text>
      </View>
    );
  }

  if (!qrAnalysis) {
    return (
      <View style={styles.errorCard}>
        <Ionicons name="warning-outline" size={48} color="#ff4d4d" />
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorText}>
          No security analysis could be performed for this QR code. Please try
          again or scan a different code.
        </Text>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={onScanAnother}
        >
          <Ionicons name="scan-outline" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryActionText}>Scan Another QR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.resultsContent}>
      {/* Result Header */}
      <Animated.View entering={SlideInDown.duration(700)}>
        <LinearGradient
          colors={["#00bf8f", "#007a5c", "#001510"]}
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

        {/* URL Information */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="link-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>URL Information</Text>
          </View>
          <InfoRow
            label="Scanned URL"
            value={qrAnalysis.scannedUrl}
            selectable
          />
          <InfoRow label="Domain" value={qrAnalysis.domain} />
          <InfoRow label="Protocol" value={qrAnalysis.protocol} />
          <InfoRow label="IP Address" value={qrAnalysis.ipAddress} />
          <InfoRow
            label="SSL Valid"
            value={qrAnalysis.sslValid ? "✅ Yes" : "❌ No"}
            valueColor={qrAnalysis.sslValid ? "#00ffcc" : "#ff4d4d"}
          />
          <InfoRow
            label="HTTP Status"
            value={qrAnalysis.httpStatus?.toString()}
          />
        </View>

        {/* WHOIS Information */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="business-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.cardTitle}>WHOIS Information</Text>
          </View>
          <InfoRow
            label="Registrar"
            value={qrAnalysis.whois?.registrar || "N/A"}
          />
          <InfoRow label="Country" value={qrAnalysis.whois?.country || "N/A"} />
          <InfoRow
            label="Created On"
            value={qrAnalysis.whois?.creationDate || "N/A"}
          />
        </View>

        {/* Threat Analysis */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Threat Analysis</Text>
          </View>
          <InfoRow
            label="Suspicious Activity"
            value={qrAnalysis.isSuspicious ? "⚠️ Yes" : "✅ No"}
            valueColor={qrAnalysis.isSuspicious ? "#FFD700" : "#00ffcc"}
          />
          <InfoRow
            label="Phishing Detected"
            value={qrAnalysis.isPhishing ? "🚨 Yes" : "✅ No"}
            valueColor={qrAnalysis.isPhishing ? "#ff4d4d" : "#00ffcc"}
          />
        </View>

        {/* Recommendations */}
        {qrAnalysis.recommendations?.length > 0 && (
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb-outline" size={20} color="#FFD700" />
              <Text style={styles.cardTitle}>Security Recommendations</Text>
            </View>
            {qrAnalysis.recommendations.map((tip: string, idx: number) => (
              <View key={idx} style={styles.recommendationItem}>
                <View style={styles.recommendationBullet} />
                <Text style={styles.recommendationText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          ⏱ Scanned at: {new Date(qrAnalysis.timestamp).toLocaleString()}
        </Text>

        {/* Actions */}
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
                <Ionicons name="open-outline" size={20} color="#fff" />
                <Text style={styles.primaryActionText}>Open Link</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={onScanAnother}
          >
            <Ionicons name="scan-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryActionText}>Scan Another QR</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const InfoRow = ({
  label,
  value,
  valueColor = "#fff",
  selectable = false,
}: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      style={[styles.infoValue, { color: valueColor }]}
      selectable={selectable}
      numberOfLines={selectable ? undefined : 2}
    >
      {value}
    </Text>
  </View>
);

// ======================
// Main Component
// ======================
export default function ScanQRCode() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [qrAnalysis, setQrAnalysis] = useState<QRAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return <PermissionScreen onRequestPermission={requestPermission} />;
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setScanResult(data);
    setLoading(true);
    setQrAnalysis(null);

    try {
      const response = await fetch(`${API_URL}/qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data }),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        setLoading(false);
        Alert.alert("Analysis Failed", "Invalid response from server.");
        return;
      }

      if (!response.ok || result.error) {
        setLoading(false);
        Alert.alert(
          "Analysis Failed",
          result.error || result.message || "Could not analyze the QR code."
        );
        return;
      }

      const analysis = result.analysis || result;
      if (!isQRAnalysis(analysis)) {
        setLoading(false);
        Alert.alert("Analysis Failed", "No valid analysis data returned.");
        return;
      }

      setQrAnalysis(analysis);
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Unable to analyze this QR code right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanAnother = () => {
    setScanned(false);
    setScanResult(null);
    setQrAnalysis(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!scanned ? (
        <ScannerView onScan={handleBarCodeScanned} scanned={scanned} />
      ) : (
        <AnalysisResults
          qrAnalysis={qrAnalysis}
          loading={loading}
          scanResult={scanResult}
          onScanAnother={handleScanAnother}
        />
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  // Permission Screen
  permissionCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    margin: 20,
    borderRadius: 24,
  },
  headerIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  permissionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
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
    paddingVertical: 18,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

  // Scanner View
  scannerContainer: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    width: width * 0.92,
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 24,
    alignSelf: "center",
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
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
  scannerSection: {
    alignItems: "center",
  },
  scannerFrame: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(0,191,143,0.3)",
    marginBottom: 16,
    position: "relative",
  },
  scanner: {
    width: "100%",
    height: "100%",
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

  // Results
  resultsContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 40,
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: "600",
  },
  errorCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    margin: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  errorTitle: {
    color: "#ff4d4d",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  resultHeaderCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  resultTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 16,
  },
  resultSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    marginTop: 4,
  },

  // Info Cards
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  infoLabel: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },

  // Recommendations
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
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  // Timestamp
  timestamp: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },

  // Actions
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
    paddingVertical: 18,
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 17,
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
    paddingVertical: 18,
  },
  secondaryActionText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
});
