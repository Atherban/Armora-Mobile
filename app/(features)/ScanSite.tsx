import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import UrlInput from "../../src/components/atoms/UrlInput";
import { styles } from "../../src/assets/styles/scan.styles";
import { API_URL } from "@/src/constants/api";

const SEGMENTS = [
  { color: "#4CAF50", range: [70, 100], label: "Safe" },
  { color: "#FFD54F", range: [40, 70], label: "Suspicious" },
  { color: "#E57373", range: [0, 40], label: "Unsafe" },
];

export default function ScanSiteScreen() {
  const [url, setUrl] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pointerAnim = useRef(new Animated.Value(0)).current;

  const animateGauge = (score: number) => {
    Animated.timing(pointerAnim, {
      toValue: score,
      duration: 1200,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setScanResult(null);
    try {
      const res = await axios.post(`${API_URL}/scan`, { url });
      const result = res.data;
      setScanResult(result);
      animateGauge(result.confidence || 0);
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const rotate = pointerAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["-90deg", "90deg"],
  });

  const score = scanResult?.confidence || 0;
  const segment =
    SEGMENTS.find((s) => score >= s.range[0] && score <= s.range[1]) ||
    SEGMENTS[0];

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (scanResult) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
  }, [scanResult]);

  const threatMessage =
    scanResult?.status === "Unsafe"
      ? "This website may pose security risks such as phishing, malware, or insecure content."
      : "This website appears safe based on current checks. Always verify before sharing sensitive data.";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>URL Security Scanner</Text>
        <Text style={[styles.descText, { textAlign: "center" }]}>
          Advanced threat detection that analyzes URLs & sites for multiple
          security risks.
        </Text>

        {/* 🧭 Gauge */}
        <View style={styles.gaugeWrapper}>
          <View style={styles.gaugeContainer}>
            <Svg width="100%" height="100%" viewBox="0 0 260 160">
              <Path
                d="M30 130 A100 100 0 0 1 110 50"
                stroke="#E57373"
                strokeWidth={15}
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M110 50 A100 100 0 0 1 150 50"
                stroke="#FFD54F"
                strokeWidth={15}
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M150 50 A100 100 0 0 1 230 130"
                stroke="#4CAF50"
                strokeWidth={15}
                fill="none"
                strokeLinecap="round"
              />
            </Svg>

            <Animated.View
              style={[
                styles.pointer,
                {
                  transform: [{ rotate }],
                  backgroundColor: segment.color,
                },
              ]}
            />
            <View style={styles.pointerCenter} />
          </View>
          <Text style={[styles.statusLabel, { color: segment.color }]}>
            {segment.label}
          </Text>
        </View>

        {/* 🌐 Input */}
        <UrlInput value={url} onChangeText={setUrl} />

        {/* 🚀 Scan Button */}
        <TouchableOpacity
          style={[styles.scanButton, loading && { opacity: 0.6 }]}
          onPress={handleScan}
          disabled={loading}
        >
          <LinearGradient
            colors={["#00bf8f", "#007b5e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanGradient}
          >
            <Ionicons
              name="shield-checkmark-outline"
              color="#fff"
              size={20}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.scanText}>
              {loading ? "Scanning..." : "Scan Now"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 🧾 Result Card */}
        {scanResult && (
          <View style={styles.resultCard}>
            <Text style={styles.cardTitle}>Scan Report</Text>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={segment.color}
              />
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, { color: segment.color }]}>
                {scanResult.status}
              </Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="warning-outline" size={18} color="#FFD54F" />
              <Text style={styles.label}>Threat Level:</Text>
              <Text style={styles.value}>{scanResult.threatLevel}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="stats-chart-outline" size={18} color="#4CAF50" />
              <Text style={styles.label}>Confidence:</Text>
              <Text style={styles.value}>{scanResult.confidence}%</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="flame-outline" size={18} color="#E57373" />
              <Text style={styles.label}>Severity:</Text>
              <Text style={styles.value}>{scanResult.severity}</Text>
            </View>

            {/* Detailed Section */}
            <View style={styles.detailsBlock}>
              <Text style={styles.subHeader}>🔐 HTTPS / SSL Check</Text>
              <Text style={styles.descText}>
                {scanResult.checks?.ssl || "Not available"}
              </Text>

              <Text style={styles.subHeader}>🌐 DNS Resolution</Text>
              <Text style={styles.descText}>
                {scanResult.checks?.dns || "No DNS data"}
              </Text>

              <Text style={styles.subHeader}>🏷️ TLD Analysis</Text>
              <Text style={styles.descText}>
                {scanResult.checks?.tld || "No TLD info"}
              </Text>

              <Text style={styles.subHeader}>🧭 Google Safe Browsing</Text>
              <Text style={styles.descText}>
                {scanResult.checks?.google || "No Safe Browsing result"}
              </Text>

              <Text style={styles.subHeader}>📋 Summary</Text>
              <Text style={styles.descText}>
                {scanResult.status === "Safe"
                  ? "This website appears to be safe based on DNS, HTTPS, and content checks."
                  : "Potential threats detected. Review the threat type and avoid sharing personal data on this site."}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
