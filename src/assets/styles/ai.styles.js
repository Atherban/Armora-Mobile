import { StyleSheet, Dimensions, Platform } from "react-native";
import COLORS from "@/src/constants/colors";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Header Section
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
  },
  headerCard: {
    borderRadius: 24,
    padding: 24,
    paddingVertical: 28,
    shadowColor: "#00ffcc",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 204, 0.1)",
    position: "relative",
    overflow: "hidden",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginTop: 16,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 255, 204, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    gap: 32,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#00ffcc",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },

  // Action Section
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  analyzeButton: {
    borderRadius: 16,
    shadowColor: "#00ffcc",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 204, 0.2)",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Error Display
  errorCard: {
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4d",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.2)",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },

  // Results Container
  resultsContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },

  // Security Score Card
  scoreCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  scoreLevel: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 20,
  },
  scoreLevelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scoreMeter: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 4,
  },

  // Priority Section
  prioritySection: {
    backgroundColor: "rgba(255, 77, 77, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  priorityItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4d",
  },
  priorityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  priorityDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
    marginBottom: 8,
  },
  priorityAction: {
    alignSelf: "flex-end",
  },
  priorityActionText: {
    fontSize: 12,
    color: "#00ffcc",
    fontWeight: "600",
  },

  // Quick Actions
  quickActions: {
    marginBottom: 8,
  },
  actionsScroll: {
    marginTop: 12,
  },
  quickAction: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    width: 160,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 16,
  },

  // Export Button
  exportButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  exportButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Threat Section
  threatSection: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  threatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  threatInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  threatCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  threatDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  threatLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  threatLevelText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  threatScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    minWidth: 40,
    textAlign: "right",
  },

  // Cards
  summaryCard: {
    backgroundColor: "rgba(0, 255, 204, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 204, 0.1)",
  },
  recommendationsCard: {
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.1)",
  },
  newsCard: {
    backgroundColor: "rgba(0, 191, 143, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 191, 143, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  summaryText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 22,
    fontWeight: "500",
  },

  // Recommendations
  recommendationItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000",
    textTransform: "uppercase",
  },
  recommendationDetails: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
  },

  // News
  newsItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  newsHeadline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
    lineHeight: 20,
  },
  newsSource: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontStyle: "italic",
  },

  // Chat Section
  chatSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  chatTrigger: {
    borderRadius: 16,
    overflow: "hidden",
  },
  chatTriggerGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 204, 0.2)",
    borderRadius: 16,
  },
  chatTriggerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  chatTriggerText: {
    flex: 1,
  },
  chatTriggerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00ffcc",
    marginBottom: 4,
  },
  chatTriggerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },

  // Chat Container
  chatContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    height: 500,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  chatHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatarText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  chatStatus: {
    fontSize: 12,
    color: "#00ffcc",
    fontWeight: "500",
  },
  closeChat: {
    padding: 4,
  },

  // Chat Messages
  chatMessages: {
    flex: 1,
    padding: 20,
  },
  welcomeMessage: {
    alignItems: "center",
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  // Quick Questions
  quickQuestions: {
    width: "100%",
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  quickQuestion: {
    backgroundColor: "rgba(0, 255, 204, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 204, 0.2)",
  },
  quickQuestionText: {
    fontSize: 14,
    color: "#00ffcc",
    fontWeight: "500",
    textAlign: "center",
  },

  // Message Styles
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  messageAvatarText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "800",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "rgba(0, 255, 204, 0.15)",
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 204, 0.3)",
  },
  aiBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  messageText: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
    alignSelf: "flex-end",
  },

  // Thinking Indicator
  thinkingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  thinkingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },

  // Chat Input
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 255, 204, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 204, 0.3)",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
