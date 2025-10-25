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
const COLORS = { primary: "#00bf8f" };

// Components
const HeaderSection = () => (
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
);

const SearchSection = ({ query, setQuery, error, loading, onSearch }) => (
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
        onSubmitEditing={onSearch}
      />
    </View>

    {error ? (
      <Animated.View entering={FadeInUp.duration(500)} style={styles.errorCard}>
        <Ionicons name="warning-outline" size={20} color="#ff4d4d" />
        <Text style={styles.errorText}>{error}</Text>
      </Animated.View>
    ) : null}

    <TouchableOpacity
      style={[styles.scanButton, loading && styles.scanButtonDisabled]}
      onPress={onSearch}
      disabled={loading}
    >
      <LinearGradient
        colors={loading ? ["#666", "#444"] : ["#00bf8f", "#007a5c"]}
        style={styles.scanButtonGradient}
      >
        {loading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.scanButtonText}>Scanning Breaches...</Text>
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
);

const StatsSection = ({ summary }) => {
  if (!summary) return null;

  return (
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
            <Text style={styles.statNumber}>{summary.totalBreaches}</Text>
            <Text style={styles.statLabel}>Total Breaches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{summary.criticalIssues}</Text>
            <Text style={styles.statLabel}>Critical Issues</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{summary.dataTypes}</Text>
            <Text style={styles.statLabel}>Data Types</Text>
          </View>
        </View>
        {summary.severityBreakdown && (
          <View style={styles.severityBreakdown}>
            <Text style={styles.breakdownTitle}>Severity Breakdown:</Text>
            <View style={styles.breakdownItems}>
              {Object.entries(summary.severityBreakdown).map(
                ([severity, count]) => (
                  <View key={severity} style={styles.breakdownItem}>
                    <View
                      style={[
                        styles.severityDot,
                        { backgroundColor: getSeverityColor(severity) },
                      ]}
                    />
                    <Text style={styles.breakdownText}>
                      {severity}: {count}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const BreachCard = ({ breach, index }) => {
  const severityColor = getSeverityColor(breach.severity);

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(index * 200)}
      style={styles.breachCard}
    >
      <View style={styles.breachHeader}>
        <View style={styles.breachTitleContainer}>
          <Text style={styles.breachEmail}>{breach.email}</Text>
          <Text style={styles.breachSource}>{breach.source}</Text>
        </View>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: `${severityColor}20` },
          ]}
        >
          <Ionicons
            name={getSeverityIcon(breach.severity)}
            size={16}
            color={severityColor}
          />
          <Text style={[styles.severityText, { color: severityColor }]}>
            {breach.severity}
          </Text>
        </View>
      </View>

      <View style={styles.breachDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="key-outline" size={16} color="#888" />
          <Text style={styles.detailLabel}>Password:</Text>
          <Text style={styles.detailValue}>{breach.passwordMasked}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="lock-closed-outline" size={16} color="#888" />
          <Text style={styles.detailLabel}>Hash Type:</Text>
          <Text style={styles.detailValue}>{breach.hashType}</Text>
        </View>

        {breach.sha1 && (
          <View style={styles.detailRow}>
            <Ionicons name="code-outline" size={16} color="#888" />
            <Text style={styles.detailLabel}>SHA1:</Text>
            <Text
              style={styles.detailValue}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {breach.sha1}
            </Text>
          </View>
        )}

        {breach.hash && (
          <View style={styles.detailRow}>
            <Ionicons name="fingerprint-outline" size={16} color="#888" />
            <Text style={styles.detailLabel}>Hash:</Text>
            <Text
              style={styles.detailValue}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {breach.hash}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.breachSummary}>{breach.summary}</Text>

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
};

const RecommendationsSection = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(600)}
      style={styles.recommendationsCard}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name="bulb-outline" size={20} color="#FFD700" />
        <Text style={styles.sectionTitle}>Security Recommendations</Text>
      </View>
      <View style={styles.recommendationsList}>
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationBullet} />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const SecurityTipsSection = () => (
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
        <Ionicons name="lock-closed-outline" size={16} color="#00ffcc" />
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
);

const EmptyState = () => (
  <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyState}>
    <Ionicons
      name="shield-checkmark-outline"
      size={64}
      color="rgba(0,191,143,0.3)"
    />
    <Text style={styles.emptyStateTitle}>No Breaches Found</Text>
    <Text style={styles.emptyStateText}>
      Enter an email address or username above to check for data breaches
    </Text>
  </Animated.View>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Scanning breach databases...</Text>
  </View>
);

// Utility Functions
const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case "high":
      return "#ff4d4d";
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

// Main Component
export default function DataBreachSecurity() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter an email or username");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/breach/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch breach data");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to fetch breach data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasResults = result && result.success && result.breaches.length > 0;
  const showEmptyState =
    !loading && (!result || !result.breaches || result.breaches.length === 0);
  const showTips = !loading && (!result || result.breaches.length === 0);

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
          <HeaderSection />

          {/* Search Section */}
          <SearchSection
            query={query}
            setQuery={setQuery}
            error={error}
            loading={loading}
            onSearch={handleSearch}
          />

          {/* Results Section */}
          {hasResults && <StatsSection summary={result.summary} />}

          <View style={styles.resultsContainer}>
            {loading ? (
              <LoadingState />
            ) : showEmptyState ? (
              <EmptyState />
            ) : hasResults ? (
              <>
                <FlatList
                  data={result.breaches}
                  keyExtractor={(item, index) => `${item.email}-${index}`}
                  renderItem={({ item, index }) => (
                    <BreachCard breach={item} index={index} />
                  )}
                  scrollEnabled={false}
                  contentContainerStyle={styles.breachList}
                  showsVerticalScrollIndicator={false}
                />
                <RecommendationsSection
                  recommendations={result.recommendations}
                />
              </>
            ) : null}
          </View>

          {/* Security Tips */}
          {showTips && <SecurityTipsSection />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    marginBottom: 16,
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
  severityBreakdown: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 16,
  },
  breakdownTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  breakdownItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  breakdownText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
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
    marginBottom: 16,
  },
  breachTitleContainer: {
    flex: 1,
  },
  breachEmail: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  breachSource: {
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
  breachDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    marginRight: 8,
    width: 80,
  },
  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  breachSummary: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: "italic",
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

  // Recommendations
  recommendationsCard: {
    backgroundColor: "rgba(255,215,0,0.05)",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
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
