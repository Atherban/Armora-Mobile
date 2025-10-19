import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import UrlInput from "../../src/components/atoms/UrlInput";
import { API_URL } from "@/src/constants/api";
import COLORS from "@/src/constants/colors";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";

const { width } = Dimensions.get("window");

const SEGMENTS = [
  {
    color: "#00ffcc",
    range: [70, 100],
    label: "Safe",
    icon: "shield-checkmark",
  },
  { color: "#FFD700", range: [40, 70], label: "Suspicious", icon: "warning" },
  { color: "#ff4d4d", range: [0, 40], label: "Unsafe", icon: "alert-circle" },
];

const THREAT_MESSAGES = {
  Safe: "This website appears safe based on current security checks. Always verify before sharing sensitive data.",
  Suspicious:
    "This website shows some suspicious characteristics. Proceed with caution.",
  Unsafe:
    "This website may pose security risks such as phishing, malware, or insecure content.",
};

const SecurityGauge = ({ score, pointerAnim }) => {
  const rotate = pointerAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["-90deg", "90deg"], // smoother, semicircular sweep
  });

  const getColor = (val: number) => {
    if (val < 40) return "#ff4d4d";
    if (val < 70) return "#FFD700";
    return "#00ffcc";
  };

  const color = getColor(score);
  const label = score < 40 ? "Unsafe" : score < 70 ? "Suspicious" : "Safe";

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={250} height={140} viewBox="0 0 250 140">
        <Defs>
          <SvgGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#ff4d4d" />
            <Stop offset="50%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#00ffcc" />
          </SvgGradient>
        </Defs>

        {/* Arc Background */}
        <Path
          d="M20 120 A100 100 0 0 1 230 120"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />

        {/* Colored Gauge Arc */}
        <Path
          d="M20 120 A100 100 0 0 1 230 120"
          stroke="url(#gaugeGradient)"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>

      {/* Rotating Pointer */}
      <Animated.View
        style={[
          styles.pointer,
          { transform: [{ rotate }], backgroundColor: color },
        ]}
      />

      {/* Center Circle Overlay */}
      <View style={styles.pointerCenter} />

      {/* Score Text */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{score}%</Text>
        <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
      </View>
    </View>
  );
};

const ScanButton = ({ loading, onPress, disabled }) => (
  <Animated.View entering={FadeInDown.duration(600).delay(200)}>
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.scanButton,
        (disabled || loading) && styles.scanButtonDisabled,
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={loading ? ["#666", "#444"] : ["#00bf8f", "#007a5c"]}
        style={styles.scanButtonGradient}
      >
        {loading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.scanButtonText}>Scanning Website...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#fff" />
            <Text style={styles.scanButtonText}>Start Security Scan</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

const ResultRow = ({ icon, label, value, color = "#fff" }) => (
  <View style={styles.resultRow}>
    <View style={styles.rowIconContainer}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.resultLabel}>{label}</Text>
    <Text style={[styles.resultValue, color !== "#fff" && { color }]}>
      {value}
    </Text>
  </View>
);

const CheckDetail = ({ title, value, fallback = "Not available" }) => (
  <View style={styles.checkDetail}>
    <Text style={styles.checkTitle}>{title}</Text>
    <Text style={styles.checkValue}>{value || fallback}</Text>
  </View>
);

const ScanResultCard = ({ scanResult, fadeAnim }) => {
  const score = scanResult?.confidence || 0;
  const segment =
    SEGMENTS.find((s) => score >= s.range[0] && score <= s.range[1]) ||
    SEGMENTS[0];
  const threatMessage =
    THREAT_MESSAGES[scanResult.status] || THREAT_MESSAGES.Safe;

  return (
    <Animated.View
      entering={FadeInDown.duration(800).delay(200)}
      style={styles.resultCard}
    >
      {/* SECURITY STATUS HEADER */}
      <LinearGradient
        colors={["rgba(0,191,143,0.1)", "rgba(0,21,16,0.1)"]}
        style={[styles.statusHeader, { borderLeftColor: segment.color }]}
      >
        <View style={styles.statusContent}>
          <Ionicons name={segment.icon} size={28} color={segment.color} />
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusText, { color: segment.color }]}>
              {scanResult.status} Website
            </Text>
            <Text style={styles.statusSubtext}>
              {scanResult.status === "Safe"
                ? "This website appears secure"
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
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Severity</Text>
          <Text style={styles.metricValue}>{scanResult.severity}</Text>
        </View>
      </View>

      {/* CONFIDENCE METER */}
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceLabel}>Security Confidence</Text>
          <Text style={styles.confidencePercent}>{scanResult.confidence}%</Text>
        </View>
        <View style={styles.meterContainer}>
          <LinearGradient
            colors={["#ff4d4d", "#FFD700", COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.meterFill, { width: `${scanResult.confidence}%` }]}
          />
        </View>
      </View>

      {/* THREAT ALERT */}
      <View
        style={[styles.alertBanner, { backgroundColor: `${segment.color}15` }]}
      >
        <Ionicons name={segment.icon} size={20} color={segment.color} />
        <Text style={[styles.alertText, { color: segment.color }]}>
          {threatMessage}
        </Text>
      </View>

      {/* SECURITY CHECKS */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>🔍 Security Analysis</Text>

        <View style={styles.securityChecks}>
          <CheckDetail
            title="🔐 HTTPS / SSL Check"
            value={scanResult.checks?.ssl}
          />

          <CheckDetail
            title="🌐 DNS Resolution"
            value={scanResult.checks?.dns}
            fallback="No DNS data available"
          />

          <CheckDetail
            title="🏷️ TLD Analysis"
            value={scanResult.checks?.tld}
            fallback="No TLD information"
          />

          <CheckDetail
            title="🧭 Safe Browsing"
            value={scanResult.checks?.google}
            fallback="No browsing data available"
          />
        </View>

        {/* SECURITY SUMMARY */}
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.summaryTitle}>Security Summary</Text>
          </View>
          <Text style={styles.summaryText}>
            {scanResult.status === "Safe"
              ? "This website appears to be safe based on comprehensive security checks including SSL verification, DNS analysis, and threat database lookups."
              : "Potential security threats have been detected. We recommend avoiding this website and not sharing any personal or sensitive information."}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default function ScanSiteScreen() {
  const [url, setUrl] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pointerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateGauge = (score: number) => {
    Animated.timing(pointerAnim, {
      toValue: score,
      duration: 1200,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleScan = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL to scan");
      return;
    }

    try {
      setError("");
      setLoading(true);
      setScanResult(null);
      fadeAnim.setValue(0);

      const res = await axios.post(`${API_URL}/scan`, { url });
      const result = res.data;
      setScanResult(result);
      animateGauge(result.confidence || 0);

      // Animate result card appearance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      setError("Failed to scan website. Please check the URL and try again.");
      console.error("Scan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const score = scanResult?.confidence || 0;

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
              <Ionicons name="globe-outline" size={42} color="#fff" />
              <View style={styles.scanBadge}>
                <Text style={styles.scanBadgeText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.title}>URL Security Scanner</Text>
            <Text style={styles.subtitle}>
              Advanced threat detection that analyzes URLs & websites for
              multiple security risks and vulnerabilities
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* SECURITY GAUGE */}
        <SecurityGauge score={score} pointerAnim={pointerAnim} />

        {/* INPUT SECTION */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.inputSection}
        >
          <UrlInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com"
            style={styles.urlInput}
          />
        </Animated.View>

        {/* SCAN BUTTON */}
        <ScanButton
          loading={loading}
          onPress={handleScan}
          disabled={!url.trim()}
        />

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

        {/* SCAN RESULTS */}
        {scanResult && (
          <ScanResultCard scanResult={scanResult} fadeAnim={fadeAnim} />
        )}

        {/* SECURITY TIPS */}
        {!scanResult && !loading && (
          <Animated.View
            entering={FadeInUp.duration(600).delay(400)}
            style={styles.tipsCard}
          >
            <Text style={styles.tipsTitle}>🔒 Website Security Tips</Text>
            <View style={styles.tipsGrid}>
              <View style={styles.tipItem}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#00ffcc"
                />
                <Text style={styles.tipText}>Always check for HTTPS</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color="#00ffcc"
                />
                <Text style={styles.tipText}>Verify SSL certificates</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color="#00ffcc"
                />
                <Text style={styles.tipText}>Avoid suspicious URLs</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="eye-outline" size={16} color="#00ffcc" />
                <Text style={styles.tipText}>Check domain reputation</Text>
              </View>
            </View>
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
  gaugeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  pointer: {
    position: "absolute",
    width: 3,
    height: 80,
    bottom: 20,
    backgroundColor: "#00ffcc",
    transformOrigin: "bottom center",
  },
  pointerCenter: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    bottom: 12,
  },
  scoreContainer: {
    position: "absolute",
    bottom: 35,
    alignItems: "center",
  },
  scoreText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  gaugeWrapper: {
    width: width * 0.7,
    height: 180,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  inputSection: {
    width: width * 0.92,
    marginBottom: 16,
  },
  urlInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
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
    opacity: 0.5,
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
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },
  detailsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  securityChecks: {
    gap: 16,
    marginBottom: 20,
  },
  checkDetail: {
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  checkTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  checkValue: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
  },
  summarySection: {
    backgroundColor: "rgba(0,191,143,0.05)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,191,143,0.1)",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  summaryText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowIconContainer: {
    width: 24,
    alignItems: "center",
  },
  resultLabel: {
    color: "#888",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  resultValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
