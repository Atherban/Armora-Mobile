import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

const BASE_URLS = {
  WEB: "http://localhost:5000",
  ANDROID: "http://10.0.2.2:5000",
  IOS: "http://localhost:5000",
  LAN: "http://192.168.29.165:5000", // 👈 your machine IP
};

const BASE_URL =
  Platform.OS === "android"
    ? BASE_URLS.LAN // Use LAN for Android physical device
    : Platform.OS === "ios"
    ? BASE_URLS.LAN // Use LAN for iPhone device
    : BASE_URLS.WEB;

const ScanWebsiteScreen = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [confidenceValue, setConfidenceValue] = useState(0);

  const progress = useSharedValue(0);
  console.log("🔗 Connecting to:", `${BASE_URL}/api/scan`);

  const handleScan = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setConfidenceValue(0);
    progress.value = 0;

    try {
      const response = await axios.post(`${BASE_URL}/api/scan`, { url });
      setResult(response.data);

      // animate confidence %
      let target = response.data.confidence || 0;
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setConfidenceValue(current);
      }, 20);

      progress.value = withDelay(300, withTiming(1, { duration: 800 }));
    } catch (err: any) {
      console.error("Scan error:", err.response?.data || err.message);
      setError("Failed to scan website.");
    } finally {
      setLoading(false);
    }
  };

  const glowStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: withTiming(progress.value ? 1 : 0.8) }],
  }));

  // pick gradient by severity
  const gradientColors =
    result?.severity === "High"
      ? (["#ff3b3b", "#000"] as const)
      : result?.severity === "Medium"
      ? (["#ff8800", "#000"] as const)
      : result?.severity === "Low"
      ? (["#ffee00", "#000"] as const)
      : (["#00bf8f", "#000"] as const);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accentBarShadowWrapper}>
          <Animated.View
            entering={FadeIn.duration(900)}
            style={styles.accentBar}
          />
        </View>

        <Animated.Text entering={FadeInUp.duration(800)} style={styles.title}>
          Website Safety Scanner
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          style={styles.cardShadowWrapper}
        >
          <LinearGradient
            colors={["#00bf8f", "#000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.innerCard}>
              <TextInput
                style={styles.input}
                placeholder="Enter website URL (e.g. youtube.com)"
                placeholderTextColor="#888"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
              />

              <TouchableOpacity style={styles.button} onPress={handleScan}>
                <Text style={styles.buttonText}>
                  {loading ? "Scanning..." : "Scan Now"}
                </Text>
              </TouchableOpacity>

              {loading && (
                <View style={styles.loadingBarContainer}>
                  <LinearGradient
                    colors={["#00bf8f", "#005f46"]}
                    style={styles.loadingBar}
                  />
                  <Text style={styles.loadingText}>Analyzing threats...</Text>
                </View>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Result card */}
        {result && (
          <Animated.View
            entering={FadeInDown.duration(800).delay(400)}
            style={[styles.resultShadowWrapper]}
          >
            <Animated.View style={[styles.resultCard, glowStyle]}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resultGradient}
              >
                <View style={styles.innerResultCard}>
                  <Text style={styles.resultTitle}>Scan Results</Text>

                  <Animated.Text
                    entering={FadeInUp.duration(700).delay(200)}
                    style={[
                      styles.statusText,
                      {
                        color: result.status === "Safe" ? "#00bf8f" : "#ff3b3b",
                      },
                    ]}
                  >
                    🛡️ {result.status}
                  </Animated.Text>

                  <Animated.Text
                    entering={FadeInUp.duration(700).delay(300)}
                    style={styles.detailText}
                  >
                    🌐 {result.url}
                  </Animated.Text>

                  <Animated.Text
                    entering={FadeInUp.duration(700).delay(400)}
                    style={styles.detailText}
                  >
                    ⚠️ Threat: {result.threatLevel}
                  </Animated.Text>

                  <Animated.Text
                    entering={FadeInUp.duration(700).delay(500)}
                    style={styles.confidenceText}
                  >
                    🔍 Confidence: {confidenceValue}%
                  </Animated.Text>

                  {/* Severity */}
                  {result.severity && (
                    <Text
                      style={[
                        styles.severityText,
                        result.severity === "High"
                          ? { color: "#ff3b3b" }
                          : result.severity === "Medium"
                          ? { color: "#ff8800" }
                          : result.severity === "Low"
                          ? { color: "#ffee00" }
                          : { color: "#00bf8f" },
                      ]}
                    >
                      🚨 Severity: {result.severity}
                    </Text>
                  )}

                  {/* Checks summary */}
                  {result.checks && (
                    <View style={{ marginTop: 20, width: "100%" }}>
                      <Text style={styles.checkTitle}>🧩 Detailed Checks</Text>
                      {Object.entries(result.checks).map(([key, value]) => (
                        <Text key={key} style={styles.checkItem}>
                          • {key.toUpperCase()}:{" "}
                          <Text style={{ color: "#aaa" }}>
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </Text>
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default ScanWebsiteScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 8,
  },
  accentBarShadowWrapper: {
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 24,
  },
  accentBar: {
    width: 120,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#00bf8f",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 28,
    textAlign: "center",
    letterSpacing: 1.1,
  },
  cardShadowWrapper: {
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    borderRadius: 32,
    alignSelf: "center",
    marginBottom: 22,
  },
  gradientBorder: {
    borderRadius: 32,
    padding: 3,
  },
  innerCard: {
    backgroundColor: "#000",
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#00bf8f44",
    backgroundColor: "#0a0a0a",
    color: "white",
    padding: 12,
    borderRadius: 12,
    width: 300,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#00bf8f",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loadingBarContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  loadingBar: {
    width: 200,
    height: 6,
    borderRadius: 4,
  },
  loadingText: {
    color: "#aaa",
    marginTop: 8,
    fontSize: 14,
  },
  error: {
    color: "red",
    marginTop: 16,
    textAlign: "center",
  },
  resultShadowWrapper: {
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 20,
    borderRadius: 28,
  },
  resultCard: {
    borderRadius: 28,
    overflow: "hidden",
  },
  resultGradient: {
    borderRadius: 28,
    padding: 3,
  },
  innerResultCard: {
    backgroundColor: "#000",
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  resultTitle: {
    color: "#00bf8f",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  statusText: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  detailText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  confidenceText: {
    color: "#00bf8f",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  severityText: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 10,
  },
  checkTitle: {
    color: "#00bf8f",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 6,
  },
  checkItem: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 3,
  },
});
