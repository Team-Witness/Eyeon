"use client"

import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import LiveFeedGrid from "./components/LiveFeedGrid"
import ThreatLevelIndicator from "./components/ThreatLevelIndicator"
import AlertsPanel from "./components/AlertsPanel"
import HistoryTimeline from "./components/HistoryTimeline"
import AlertModal from "./components/AlertModal"
import { ToastContainer, useToast } from "./components/Toast"
import { useWebSocket } from "./hooks/useWebSocket"
import { useSimulatedWebSocket } from "./hooks/useSimulatedWebSocket"
import { fetchDashboardData, updateAlertStatus } from "./utils/api"
import { timeAgo } from "./utils/timeUtils"
import type { Alert, CameraFeed, ThreatLevel, HistoryEvent } from "./types/dashboard"

export default function Dashboard() {
  // State management
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>([])
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>({
    score: 0,
    label: "Loading...",
    level: "low",
    lastUpdated: new Date().toISOString(),
  })
  const [history, setHistory] = useState<HistoryEvent[]>([])
  const [modalAlert, setModalAlert] = useState<Alert | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [backendConnected, setBackendConnected] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Toast notifications
  const { toasts, addToast, removeToast, success, error, warning, info } = useToast()

  // WebSocket connection
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/live-feed/"
  const {
    isConnected,
    lastMessage,
    connectionAttempts,
    connectionError,
    reconnect: reconnectWebSocket,
  } = useWebSocket(WS_URL)

  // Simulated WebSocket for development
  const { lastMessage: simulatedMessage } = useSimulatedWebSocket(!backendConnected && !loading)

  // Initial data fetch with better error handling
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setLoadError(null)
        console.log("🔄 Loading dashboard data...")

        const data = await fetchDashboardData()
        console.log("✅ Dashboard data loaded")

        setAlerts(data.alerts || [])
        setCameraFeeds(data.cameraFeeds || [])
        setThreatLevel(
          data.threatLevel || {
            score: 0,
            label: "All Clear",
            level: "low",
            lastUpdated: new Date().toISOString(),
          },
        )
        setHistory(data.history || [])
        setLastUpdate(new Date())

        // Check if we got real backend data (not mock data)
        const isRealData = data.alerts.length > 0 && !data.alerts[0].id.startsWith("ALT-")
        setBackendConnected(isRealData)

        if (isRealData) {
          success("🔗 Backend Connected", "Successfully connected to AVZDAX backend")
        } else {
          info("🎭 Demo Mode Active", "Using simulated data - backend not available")
        }
      } catch (error) {
        console.error("❌ Failed to load dashboard data:", error)
        setBackendConnected(false)
        setLoadError(error instanceof Error ? error.message : "Failed to load data")
        warning("📡 Backend Offline", "Running in demo mode with simulated data")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()

    // Set up periodic data refresh (every 30 seconds)
    const refreshInterval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(refreshInterval)
  }, [])

  // Handle real WebSocket messages
  useEffect(() => {
    if (!lastMessage) return

    console.log("📨 Processing WebSocket message:", lastMessage.type)
    handleWebSocketMessage(lastMessage)
  }, [lastMessage])

  // Handle simulated WebSocket messages for development
  useEffect(() => {
    if (!simulatedMessage || backendConnected) return

    console.log("🎭 Processing simulated message:", simulatedMessage.type)
    handleWebSocketMessage(simulatedMessage)
  }, [simulatedMessage, backendConnected])

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "new_alert":
        const newAlert = message.payload as Alert
        setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]) // Keep max 50 alerts

        // Show modal for high-priority alerts
        if (newAlert.threatScore > 75) {
          setModalAlert(newAlert)
          setIsModalOpen(true)
        }

        // Show toast notification
        warning("🚨 New Threat Detected!", `${newAlert.type} detected on ${newAlert.cameraId}`)
        break

      case "threat_update":
        const updatedThreatLevel = message.payload
        setThreatLevel(updatedThreatLevel)

        if (updatedThreatLevel.score > 80) {
          warning("⚠️ High Threat Level", `Threat level increased to ${updatedThreatLevel.score}`)
        }
        break

      case "camera_status":
        const cameraUpdate = message.payload
        setCameraFeeds((prev) =>
          prev.map((feed) =>
            feed.id === cameraUpdate.cameraId
              ? {
                  ...feed,
                  status: cameraUpdate.status,
                  lastActivity: cameraUpdate.lastActivity,
                }
              : feed,
          ),
        )

        if (cameraUpdate.status === "inactive") {
          warning("📹 Camera Offline", `Camera ${cameraUpdate.cameraId} has gone offline`)
        }
        break
    }

    setLastUpdate(new Date())
  }

  // Alert action handlers
  const handleAcknowledge = async (alertId: string) => {
    try {
      await updateAlertStatus(alertId, "acknowledged")
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === alertId ? { ...alert, status: "acknowledged" as const } : alert)),
      )
      success("✅ Alert Acknowledged", "Alert has been marked as acknowledged")
    } catch (error) {
      console.error("Failed to acknowledge alert:", error)
      error("❌ Update Failed", "Failed to acknowledge alert. Please try again.")
    }
  }

  const handleEscalate = async (alertId: string) => {
    try {
      await updateAlertStatus(alertId, "escalated")
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === alertId ? { ...alert, status: "escalated" as const } : alert)),
      )
      warning("🚨 Alert Escalated", "Alert has been escalated to security team")
    } catch (error) {
      console.error("Failed to escalate alert:", error)
      error("❌ Escalation Failed", "Failed to escalate alert. Please try again.")
    }
  }

  const handleFalsePositive = async (alertId: string) => {
    try {
      await updateAlertStatus(alertId, "false_positive")
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === alertId ? { ...alert, status: "false_positive" as const } : alert)),
      )
      info("ℹ️ Marked as False Positive", "Alert has been marked as false positive")
    } catch (error) {
      console.error("Failed to mark as false positive:", error)
      error("❌ Update Failed", "Failed to mark alert as false positive. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar isConnected={isConnected} connectionError={connectionError} onReconnectWebSocket={reconnectWebSocket} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Bar */}
        <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Last updated: {timeAgo(lastUpdate.toISOString())}</span>
            <span
              className={`px-2 py-1 rounded text-xs ${
                backendConnected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {backendConnected ? "Live Mode" : "Demo Mode"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Alerts: {alerts.length}</span>
            <span>Cameras: {cameraFeeds.length}</span>
          </div>
        </div>

        {/* Development Notice */}
        {!backendConnected && !loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Demo Mode Active</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Backend not available. Showing simulated surveillance data with live updates.</p>
                  {loadError && (
                    <p className="mt-1 text-xs text-blue-600">
                      <strong>Error details:</strong> {loadError}
                    </p>
                  )}
                  <p className="mt-1">
                    <strong>For backend integration:</strong> Ensure NestJS server is running and environment variables
                    are set.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Row - Threat Level */}
        <div className="mb-8">
          <ThreatLevelIndicator threatLevel={threatLevel} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Live Feeds */}
          <div className="lg:col-span-2">
            <LiveFeedGrid feeds={cameraFeeds} loading={loading} />
          </div>

          {/* Right Column - Alerts */}
          <div className="lg:col-span-1">
            <AlertsPanel
              alerts={alerts}
              loading={loading}
              onAcknowledge={handleAcknowledge}
              onEscalate={handleEscalate}
              onFalsePositive={handleFalsePositive}
            />
          </div>
        </div>

        {/* Bottom Row - History */}
        <div>
          <HistoryTimeline events={history} loading={loading} />
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        alert={modalAlert}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAcknowledge={handleAcknowledge}
        onEscalate={handleEscalate}
        onFalsePositive={handleFalsePositive}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
