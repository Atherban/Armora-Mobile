import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import axios from "axios";
import { API_URL } from "@/src/constants/api";
import { LinearGradient } from "expo-linear-gradient";

const AppPermissionAnalyzer = () => {
  const [pkg, setPkg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeApp = async () => {
    if (!pkg.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API_URL}/analyze-apps`, {
        packageName: pkg,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#000", "#0a0a0a", "#101010"]}
      style={styles.container}
    >
      <Text style={styles.title}>App Permission Analyzer</Text>
      <Text style={styles.subtitle}>
        Enter an Android package name to check for potential threats
      </Text>

      <TextInput
        placeholder="e.g., com.example.myapp"
        placeholderTextColor="#666"
        style={styles.input}
        value={pkg}
        onChangeText={setPkg}
      />

      <TouchableOpacity
        onPress={analyzeApp}
        style={styles.button}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Analyzing..." : "Scan App"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator color="#00bf8f" style={{ marginTop: 16 }} />
      )}

      {result && (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.card}>
          <Text
            style={[
              styles.resultTitle,
              { color: result.risk === "Danger" ? "#ff4d4f" : "#00bf8f" },
            ]}
          >
            {result.risk} ({result.confidence}%)
          </Text>
          <Text style={styles.resultText}>{result.description}</Text>
          <Text style={styles.pkgText}>{result.packageName}</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

export default AppPermissionAnalyzer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  title: {
    color: "#00bf8f",
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    borderColor: "#00bf8f",
    borderWidth: 1,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#00bf8f",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#151515",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#00bf8f",
  },
  resultTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  resultText: { color: "#ccc", fontSize: 14, lineHeight: 20 },
  pkgText: { color: "#666", fontSize: 12, marginTop: 6 },
});
