import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@/src/constants/api";

const { width } = Dimensions.get("window");

export default function DataBreachSecurity() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [breaches, setBreaches] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter an email or username");
      return;
    }

    setError("");
    setLoading(true);
    setBreaches([]);

    try {
      const response = await fetch(`${API_URL}/breach/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setBreaches(data.breaches);

      setLoading(false);
    } catch (err) {
      setError("Unable to fetch breach data. Please try again.");
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "#ff4d4d";
      case "high":
        return "#FF6B35";
      case "medium":
        return "#FFD700";
      case "low":
        return "#00ffcc";
      default:
        return "#888";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "alert-circle";
      case "high":
        return "warning";
      case "medium":
        return "shield-half";
      case "low":
        return "shield-checkmark";
      default:
        return "help-circle";
    }
  };

  const renderBreach = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.duration(600).delay(index * 200)}
      style={styles.breachCard}
    >
      <View style={styles.breachHeader}>
        <View style={styles.breachTitleContainer}>
          <Text style={styles.breachName}>{item.Name}</Text>
          <Text style={styles.breachDomain}>{item.Domain}</Text>
        </View>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: `${getSeverityColor(item.Severity)}20` },
          ]}
        >
          <Ionicons
            name={getSeverityIcon(item.Severity)}
            size={16}
            color={getSeverityColor(item.Severity)}
          />
          <Text
            style={[
              styles.severityText,
              { color: getSeverityColor(item.Severity) },
            ]}
          >
            {item.Severity}
          </Text>
        </View>
      </View>

      <View style={styles.breachDateContainer}>
        <Ionicons name="calendar-outline" size={14} color="#888" />
        <Text style={styles.breachDate}>Breached: {item.BreachDate}</Text>
      </View>

      <Text style={styles.breachDescription}>{item.Description}</Text>

      {item.CompromisedData && (
        <View style={styles.compromisedSection}>
          <Text style={styles.compromisedTitle}>Compromised Data:</Text>
          <View style={styles.dataTags}>
            {item.CompromisedData.map((data, idx) => (
              <View key={idx} style={styles.dataTag}>
                <Ionicons name="warning-outline" size={12} color="#FFD700" />
                <Text style={styles.dataTagText}>{data}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.breachFooter}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="key-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.actionText}>Enable 2FA</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const StatsSection = ({ breaches }) => (
    <Animated.View
      entering={FadeInDown.duration(800)}
      style={styles.statsContainer}
    >
      <LinearGradient
        colors={["#00bf8f", "#007a5c", "#001510"]}
        style={styles.statsCard}
      >
        <Text style={styles.statsTitle}>Breach Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{breaches.length}</Text>
            <Text style={styles.statLabel}>Total Breaches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {
                breaches.filter(
                  (b) => b.Severity === "Critical" || b.Severity === "High"
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Critical Issues</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {breaches.reduce(
                (acc, breach) => acc + (breach.CompromisedData?.length || 0),
                0
              )}
            </Text>
            <Text style={styles.statLabel}>Data Types</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <Animated.View entering={FadeInDown.duration(800)}>
            <LinearGradient
              colors={["#00bf8f", "#007a5c", "#001510"]}
              style={styles.headerCard}
            >
              <View style={styles.headerIconContainer}>
                <Ionicons name="shield-checkmark" size={42} color="#fff" />
                <View style={styles.scanBadge}>
                  <Text style={styles.scanBadgeText}>SECURE</Text>
                </View>
              </View>
              <Text style={styles.title}>Data Breach Scanner</Text>
              <Text style={styles.subtitle}>
                Check if your accounts have been exposed in known data breaches
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Search Section */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.searchSection}
          >
            <View style={styles.inputContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Enter email or username..."
                placeholderTextColor="#888"
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            {error ? (
              <Animated.View
                entering={FadeInUp.duration(500)}
                style={styles.errorCard}
              >
                <Ionicons name="warning-outline" size={20} color="#ff4d4d" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <TouchableOpacity
              style={[styles.scanButton, loading && styles.scanButtonDisabled]}
              onPress={handleSearch}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ["#666", "#444"] : ["#00bf8f", "#007a5c"]}
                style={styles.scanButtonGradient}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.scanButtonText}>
                      Scanning Breaches...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="scan-outline" size={22} color="#fff" />
                    <Text style={styles.scanButtonText}>Scan for Breaches</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Results Section */}
          {breaches.length > 0 && <StatsSection breaches={breaches} />}

          <View style={styles.resultsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>
                  Scanning breach databases...
                </Text>
              </View>
            ) : breaches.length === 0 ? (
              <Animated.View
                entering={FadeInUp.duration(600)}
                style={styles.emptyState}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={64}
                  color="rgba(0,191,143,0.3)"
                />
                <Text style={styles.emptyStateTitle}>No Breaches Found</Text>
                <Text style={styles.emptyStateText}>
                  Enter an email address or username above to check for data
                  breaches
                </Text>
              </Animated.View>
            ) : (
              <FlatList
                data={breaches}
                keyExtractor={(item) => item.Name}
                renderItem={renderBreach}
                scrollEnabled={false}
                contentContainerStyle={styles.breachList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Security Tips */}
          {breaches.length === 0 && !loading && (
            <Animated.View
              entering={FadeInUp.duration(600).delay(400)}
              style={styles.tipsCard}
            >
              <Text style={styles.tipsTitle}>🔒 Security Tips</Text>
              <View style={styles.tipsGrid}>
                <View style={styles.tipItem}>
                  <Ionicons name="key-outline" size={16} color="#00ffcc" />
                  <Text style={styles.tipText}>Use unique passwords</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color="#00ffcc"
                  />
                  <Text style={styles.tipText}>Enable 2FA everywhere</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="mail-outline" size={16} color="#00ffcc" />
                  <Text style={styles.tipText}>Monitor breach alerts</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="refresh-outline" size={16} color="#00ffcc" />
                  <Text style={styles.tipText}>Update passwords regularly</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const COLORS = { primary: "#00bf8f" };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 30 },

  // Header
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

  // Search Section
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    height: 56,
    fontSize: 16,
    fontWeight: "500",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,77,77,0.1)",
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  scanButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonDisabled: {
    opacity: 0.7,
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

  // Stats Section
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  // Results
  resultsContainer: {
    flex: 1,
    minHeight: 400,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    opacity: 0.6,
  },
  emptyStateTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  breachList: {
    paddingHorizontal: 20,
  },

  // Breach Card
  breachCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  breachHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  breachTitleContainer: {
    flex: 1,
  },
  breachName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  breachDomain: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
    textTransform: "uppercase",
  },
  breachDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  breachDate: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  breachDescription: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  compromisedSection: {
    marginBottom: 16,
  },
  compromisedTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  dataTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dataTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  dataTagText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  breachFooter: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,191,143,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,191,143,0.3)",
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  // Tips Section
  tipsCard: {
    backgroundColor: "rgba(0,191,143,0.08)",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
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
