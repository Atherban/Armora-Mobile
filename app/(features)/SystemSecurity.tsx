import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import Score from "../../src/components/molecules/Score";
import styles from "../../src/assets/styles/security.style";
import { useScoreStore } from "../../src/store/score.store.js";
import COLORS from "@/src/constants/colors";

const DeviceSecurityScreen = () => {
  const { deviceSecurity, isLoading, error, analyzeDeviceSecurity } =
    useScoreStore();

  useEffect(() => {
    analyzeDeviceSecurity();
  }, []);

  const handleRefresh = async () => {
    await analyzeDeviceSecurity();
  };

  // Determine gauge color based on numeric score (0-10)
  const getGaugeColor = (score: number) => {
    if (score >= 8) return "#3ec46d"; // green
    if (score >= 5) return "#f7c873"; // yellow/orange
    return "#e14b5a"; // red
  };

  // Determine threat level text color
  const getThreatColor = (threatLevel: string) => {
    switch (threatLevel) {
      case "High":
        return "#e14b5a";
      case "Medium":
        return "#f7c873";
      case "Low":
        return "#3ec46d";
      default:
        return "#ccc";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={styles.header}>Device Security Dashboard</Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 60 }}
          />
        ) : error ? (
          <Text
            style={{ color: "#e14b5a", marginTop: 40, textAlign: "center" }}
          >
            {error}
          </Text>
        ) : (
          <>
            {/* Score Gauge */}
            <Animatable.View
              animation="pulse"
              iterationCount={1}
              duration={800}
              style={{ alignItems: "center", marginVertical: 20 }}
            >
              <Score
                score={deviceSecurity.score}
                outOf={10}
                color={getGaugeColor(deviceSecurity.score)} // <-- dynamic color
              />
            </Animatable.View>

            {/* Summary Card */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={100}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>System Overview</Text>

              {/* Threat Level */}
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Threat Level:</Text>
                <Text
                  style={{
                    color: getThreatColor(deviceSecurity.checks?.threatLevel),
                    fontWeight: "bold",
                  }}
                >
                  {deviceSecurity.checks?.threatLevel || "Unknown"}
                </Text>
              </View>

              {/* Root/Jailbreak */}
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Root/Jailbreak:</Text>
                <Text
                  style={{
                    color: deviceSecurity.checks?.rooted
                      ? "#e14b5a"
                      : "#3ec46d",
                    fontWeight: "bold",
                  }}
                >
                  {deviceSecurity.checks?.rooted ? "Detected" : "Secure"}
                </Text>
              </View>

              {/* Open Ports */}
              <View style={{ marginTop: 12 }}>
                <Text style={styles.cardSubTitle}>Open Ports:</Text>
                {deviceSecurity.checks?.openPorts?.length > 0 ? (
                  <FlatList
                    data={deviceSecurity.checks.openPorts}
                    keyExtractor={(item) => item.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <View
                        style={{
                          backgroundColor: "#001510",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          marginRight: 8,
                        }}
                      >
                        <Text
                          style={{ color: COLORS.primary, fontWeight: "bold" }}
                        >
                          Port {item}
                        </Text>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={{ color: "#3ec46d" }}>
                    No open ports detected
                  </Text>
                )}
              </View>

              {/* Recommendations */}
              {deviceSecurity.checks?.recommendations?.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.cardSubTitle}>Recommendations:</Text>
                  {deviceSecurity.checks.recommendations.map(
                    (rec: string, idx: number) => (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: "#111",
                          padding: 8,
                          borderRadius: 6,
                          marginTop: 4,
                        }}
                      >
                        <Text style={{ color: "#f7c873" }}>• {rec}</Text>
                      </View>
                    )
                  )}
                </View>
              )}

              {/* Device Info */}
              <View style={{ marginTop: 12 }}>
                <Text style={styles.cardSubTitle}>Device Info:</Text>
                <Text style={{ color: "#ccc" }}>
                  Platform: {deviceSecurity.checks?.platform || "Unknown"}
                </Text>
                <Text style={{ color: "#ccc" }}>
                  Model: {deviceSecurity.checks?.model || "Unknown"}
                </Text>
                <Text style={{ color: "#ccc" }}>
                  OS Version: {deviceSecurity.checks?.osVersion || "Unknown"}
                </Text>
                <Text style={{ color: "#ccc" }}>
                  Emulator: {deviceSecurity.checks?.isEmulator ? "Yes" : "No"}
                </Text>
                <Text style={{ color: "#ccc" }}>
                  Developer Mode:{" "}
                  {deviceSecurity.checks?.developerMode
                    ? "Enabled"
                    : "Disabled"}
                </Text>
                <Text style={{ color: "#ccc" }}>
                  Last Checked: {deviceSecurity.lastChecked || "N/A"}
                </Text>
              </View>
            </Animatable.View>

            {/* Re-Analyze Button */}
            <TouchableOpacity
              style={styles.scanButtonWrapper}
              activeOpacity={0.9}
              onPress={analyzeDeviceSecurity}
            >
              <LinearGradient
                colors={[COLORS.primary, "#001510"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scanButton}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.scanButtonText}>Re-Analyze Device</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeviceSecurityScreen;
