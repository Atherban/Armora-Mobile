import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";

export default function ScanQRCode() {
  // Camera permission hook from Expo
  const [permission, requestPermission] = useCameraPermissions();

  // State variables for scan control and results
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [securityLevel, setSecurityLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // While checking for permission, show nothing
  if (!permission) {
    return <View />;
  }

  // Show permission request UI if not granted
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#00bf8f" size="large" />
        <Text style={styles.text}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.openBtn}>
          <Text style={styles.openBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Handles the QR code scanning logic
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScanResult(data);
    setLoading(true);

    // Simulate a short analysis delay for better UX
    setTimeout(() => {
      // Basic pattern-based classification
      if (data.startsWith("https://") || data.startsWith("http://")) {
        setSecurityLevel("Safe Link");
      } else if (data.match(/^[0-9]+$/)) {
        setSecurityLevel("Numeric Code (Low Risk)");
      } else {
        setSecurityLevel("Unknown/Check Carefully");
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* SCANNER VIEW */}
      {!scanned ? (
        <View style={styles.scannerWrapper}>
          <Animated.Text style={styles.heading}>Scan a QR Code</Animated.Text>

          {/* Live camera feed for scanning */}
          <CameraView
            style={styles.scanner}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarCodeScanned}
          />

          <Animated.Text style={styles.infoText}>
            Point your camera at a QR code to assess its security instantly.
          </Animated.Text>
        </View>
      ) : (
        /* RESULT VIEW */
        <View style={styles.resultWrapper}>
          <Ionicons
            name="shield-checkmark"
            size={48}
            color="#00bf8f"
            style={{ marginBottom: 16 }}
          />

          {/* Result Header */}
          <Animated.Text style={styles.resultLabel}>Scan Result</Animated.Text>
          <Animated.Text style={styles.resultText}>{scanResult}</Animated.Text>

          {/* Show analysis spinner or result */}
          {loading ? (
            <ActivityIndicator
              color="#00bf8f"
              size="large"
              style={{ marginVertical: 16 }}
            />
          ) : (
            <Animated.Text style={styles.securityLevel}>
              {securityLevel}
            </Animated.Text>
          )}

          {/* Open scanned link (if it’s a URL) */}
          {scanResult && scanResult.startsWith("http") && !loading && (
            <TouchableOpacity
              style={styles.openBtn}
              onPress={() => Linking.openURL(scanResult)}
            >
              <Ionicons name="open-outline" size={20} color="#fff" />
              <Animated.Text style={styles.openBtnText}>
                Open Link
              </Animated.Text>
            </TouchableOpacity>
          )}

          {/* Rescan button to reset the state */}
          <TouchableOpacity
            style={styles.rescanBtn}
            onPress={() => {
              setScanned(false);
              setScanResult(null);
              setSecurityLevel(null);
            }}
          >
            <Ionicons name="refresh" size={20} color="#00bf8f" />
            <Animated.Text style={styles.rescanBtnText}>
              Scan Another
            </Animated.Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Root container: centers everything and provides padding
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  // Wrapper for camera scanner UI
  scannerWrapper: {
    width: "100%",
    alignItems: "center",
  },

  // Heading displayed above the scanner
  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    letterSpacing: 1.1,
  },

  // Camera frame styling
  scanner: {
    width: 260,
    height: 260,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
  },

  // Helper text under the camera view
  infoText: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },

  // Result view container
  resultWrapper: {
    flex: 1,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 16,
  },

  // Label above result text
  resultLabel: {
    color: "#aaa",
    fontSize: 15,
    marginBottom: 6,
  },

  // Main scanned result text
  resultText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },

  // Security classification text
  securityLevel: {
    color: "#00bf8f",
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },

  // Button for opening scanned link
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00bf8f",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  openBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },

  // Button for rescanning QR code
  rescanBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    padding: 8,
  },
  rescanBtnText: {
    color: "#00bf8f",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },

  // Permission request message
  text: {
    marginVertical: 16,
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
});
