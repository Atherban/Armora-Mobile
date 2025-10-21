import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import Score from "../../src/components/molecules/Score";
import styles from "../../src/assets/styles/security.style";
import { useScoreStore } from "../../src/store/score.store.js";
import COLORS from "@/src/constants/colors";

const { width } = Dimensions.get("window");

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
    if (score >= 7) return COLORS.primary; // Bright green
    if (score >= 5) return "#FFD700"; // Gold/yellow
    return "#ff4d4d"; // Bright red
  };

  // Determine threat level text color
  const getThreatColor = (threatLevel: string) => {
    switch (threatLevel?.toLowerCase()) {
      case "high":
        return "#ff4d4d";
      case "medium":
        return "#FFD700";
      case "low":
        return COLORS.primary;
      default:
        return "#ccc";
    }
  };

  // Get security status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "secure":
      case "low":
        return "shield-checkmark";
      case "warning":
      case "medium":
        return "warning";
      case "danger":
      case "high":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    try {
      return (
        new Date(dateString).toLocaleDateString() +
        " " +
        new Date(dateString).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* HEADER SECTION */}
        <Animatable.View
          animation="fadeInDown"
          duration={800}
          style={styles.headerSection}
        >
          <LinearGradient
            colors={["#00bf8f", "#007a5c", "#001510"]}
            style={styles.headerCard}
          >
            <Ionicons name="phone-portrait-outline" size={36} color="#fff" />
            <Text style={styles.headerTitle}>Device Security</Text>
            <Text style={styles.headerSubtitle}>
              Comprehensive analysis of your device&apos;s security status and
              potential vulnerabilities
            </Text>
          </LinearGradient>
        </Animatable.View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Analyzing Device Security...</Text>
          </View>
        ) : error ? (
          <Animatable.View
            animation="fadeIn"
            duration={500}
            style={styles.errorCard}
          >
            <Ionicons name="warning-outline" size={24} color="#ff4d4d" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Analysis Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <TouchableOpacity
              onPress={analyzeDeviceSecurity}
              style={styles.retryButton}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
            </TouchableOpacity>
          </Animatable.View>
        ) : (
          <>
            {/* SECURITY SCORE SECTION */}
            <Animatable.View
              animation="pulse"
              iterationCount={1}
              duration={1000}
              style={styles.scoreSection}
            >
              <Score
                score={deviceSecurity.score}
                outOf={10}
                color={getGaugeColor(deviceSecurity.score)}
              />

              {/* Score Status */}
              <View style={styles.scoreStatus}>
                <LinearGradient
                  colors={
                    getGaugeColor(deviceSecurity.score) === COLORS.primary
                      ? [COLORS.primary, "#00b38f"]
                      : getGaugeColor(deviceSecurity.score) === "#FFD700"
                      ? ["#FFD700", "#ffaa00"]
                      : ["#ff4d4d", "#cc0000"]
                  }
                  style={styles.scoreBadge}
                >
                  <Ionicons
                    name={getStatusIcon(deviceSecurity.checks?.threatLevel)}
                    size={16}
                    color="#000"
                  />
                  <Text style={styles.scoreBadgeText}>
                    {deviceSecurity.score >= 8
                      ? "Excellent"
                      : deviceSecurity.score >= 5
                      ? "Moderate"
                      : "Poor"}
                  </Text>
                </LinearGradient>
                <Text style={styles.scoreDescription}>
                  {deviceSecurity.score >= 8
                    ? "Your device shows strong security measures"
                    : deviceSecurity.score >= 5
                    ? "Some security improvements recommended"
                    : "Immediate security attention required"}
                </Text>
              </View>
            </Animatable.View>

            {/* SECURITY OVERVIEW CARD */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={200}
              style={styles.overviewCard}
            >
              <View style={styles.cardHeader}>
                <Ionicons
                  name="analytics-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.cardTitle}>Security Overview</Text>
              </View>

              {/* Threat Level */}
              <View style={styles.statusItem}>
                <View style={styles.statusInfo}>
                  <Ionicons name="shield-outline" size={18} color="#888" />
                  <Text style={styles.statusLabel}>Threat Level</Text>
                </View>
                <View
                  style={[
                    styles.statusValue,
                    {
                      backgroundColor: `${getThreatColor(
                        deviceSecurity.checks?.threatLevel
                      )}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(deviceSecurity.checks?.threatLevel)}
                    size={14}
                    color={getThreatColor(deviceSecurity.checks?.threatLevel)}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: getThreatColor(
                          deviceSecurity.checks?.threatLevel
                        ),
                      },
                    ]}
                  >
                    {deviceSecurity.checks?.threatLevel || "Unknown"}
                  </Text>
                </View>
              </View>

              {/* Root/Jailbreak Status */}
              <View style={styles.statusItem}>
                <View style={styles.statusInfo}>
                  <Ionicons name="lock-closed-outline" size={18} color="#888" />
                  <Text style={styles.statusLabel}>Root/Jailbreak</Text>
                </View>
                <View
                  style={[
                    styles.statusValue,
                    {
                      backgroundColor: deviceSecurity.checks?.rooted
                        ? "#ff4d4d20"
                        : "#00ffcc20",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      deviceSecurity.checks?.rooted
                        ? "close-circle"
                        : "checkmark-circle"
                    }
                    size={14}
                    color={
                      deviceSecurity.checks?.rooted ? "#ff4d4d" : COLORS.primary
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: deviceSecurity.checks?.rooted
                          ? "#ff4d4d"
                          : COLORS.primary,
                      },
                    ]}
                  >
                    {deviceSecurity.checks?.rooted ? "Detected" : "Secure"}
                  </Text>
                </View>
              </View>

              {/* Open Ports Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.sectionTitle}>Open Ports</Text>
                </View>
                {deviceSecurity.checks?.openPorts?.length > 0 ? (
                  <FlatList
                    data={deviceSecurity.checks.openPorts}
                    keyExtractor={(item) => item.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.portsList}
                    renderItem={({ item }) => (
                      <View style={styles.portItem}>
                        <Text style={styles.portText}>Port {item}</Text>
                      </View>
                    )}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="checkmark-done-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.emptyStateText}>
                      No open ports detected
                    </Text>
                  </View>
                )}
              </View>
            </Animatable.View>

            {/* DEVICE INFORMATION CARD */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={300}
              style={styles.infoCard}
            >
              <View style={styles.cardHeader}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.cardTitle}>Device Information</Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="logo-android" size={16} color="#888" />
                  <Text style={styles.infoLabel}>Platform</Text>
                  <Text style={styles.infoValue}>
                    {deviceSecurity.checks?.platform || "Unknown"}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="phone-portrait" size={16} color="#888" />
                  <Text style={styles.infoLabel}>Model</Text>
                  <Text style={styles.infoValue}>
                    {deviceSecurity.checks?.model || "Unknown"}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="settings-outline" size={16} color="#888" />
                  <Text style={styles.infoLabel}>OS Version</Text>
                  <Text style={styles.infoValue}>
                    {deviceSecurity.checks?.osVersion || "Unknown"}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="desktop-outline" size={16} color="#888" />
                  <Text style={styles.infoLabel}>Emulator</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: deviceSecurity.checks?.isEmulator
                          ? "#ff4d4d"
                          : COLORS.primary,
                      },
                    ]}
                  >
                    {deviceSecurity.checks?.isEmulator ? "Yes" : "No"}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="construct-outline" size={16} color="#888" />
                  <Text style={styles.infoLabel}>Developer Mode</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: deviceSecurity.checks?.developerMode
                          ? "#FFD700"
                          : COLORS.primary,
                      },
                    ]}
                  >
                    {deviceSecurity.checks?.developerMode
                      ? "Enabled"
                      : "Disabled"}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={16} color="#888" />
                  <Text style={styles.infoLabel}>Last Checked</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(deviceSecurity.lastChecked)}
                  </Text>
                </View>
              </View>
            </Animatable.View>

            {/* RECOMMENDATIONS CARD */}
            {deviceSecurity.checks?.recommendations?.length > 0 && (
              <Animatable.View
                animation="fadeInUp"
                duration={600}
                delay={400}
                style={styles.recommendationsCard}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name="bulb-outline" size={24} color="#FFD700" />
                  <Text style={styles.cardTitle}>Security Recommendations</Text>
                </View>
                <View style={styles.recommendationsList}>
                  {deviceSecurity.checks.recommendations.map(
                    (rec: string, idx: number) => (
                      <View key={idx} style={styles.recommendationItem}>
                        <View style={styles.recommendationBullet} />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    )
                  )}
                </View>
              </Animatable.View>
            )}

            {/* RE-ANALYZE BUTTON */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={500}
              style={styles.actionSection}
            >
              <TouchableOpacity
                style={styles.scanButton}
                activeOpacity={0.8}
                onPress={analyzeDeviceSecurity}
              >
                <LinearGradient
                  colors={["#00bf8f", "#007a5c"]}
                  style={styles.scanButtonGradient}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.scanButtonText}>Re-analyze Device</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeviceSecurityScreen;
