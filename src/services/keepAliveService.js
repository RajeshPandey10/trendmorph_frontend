import SummaryApi from "../api/SummaryApi";

class KeepAliveService {
  constructor() {
    this.intervals = new Map();
    this.isRunning = false;
  }

  // Start keep-alive for all backend services
  startKeepAlive() {
    if (this.isRunning) {
      console.log("Keep-alive service is already running");
      return;
    }

    this.isRunning = true;
    console.log("🔄 Starting keep-alive service for all backends...");

    // Keep Django webscraping backend alive (every 10 minutes)
    const webscrapingInterval = setInterval(async () => {
      try {
        await SummaryApi.keepWebscrapingAlive();
      } catch (error) {
        console.error("Django webscraping keep-alive failed:", error);
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Keep Node.js backend alive (every 12 minutes)
    const nodeBackendInterval = setInterval(async () => {
      try {
        await SummaryApi.healthCheck();
        console.log("Node.js backend keep-alive successful");
      } catch (error) {
        console.error("Node.js backend keep-alive failed:", error);
      }
    }, 12 * 60 * 1000); // 12 minutes

    // Keep image caption service alive (every 15 minutes)
    const imageCaptionInterval = setInterval(async () => {
      try {
        await SummaryApi.checkImageCaptionService();
        console.log("Image caption service keep-alive successful");
      } catch (error) {
        console.error("Image caption service keep-alive failed:", error);
      }
    }, 15 * 60 * 1000); // 15 minutes

    // Store intervals for cleanup
    this.intervals.set("webscraping", webscrapingInterval);
    this.intervals.set("nodejs", nodeBackendInterval);
    this.intervals.set("imageCaption", imageCaptionInterval);

    // Initial health checks
    this.performInitialHealthChecks();
  }

  // Perform initial health checks
  async performInitialHealthChecks() {
    console.log("🏥 Performing initial health checks...");

    try {
      const [webscrapingHealth, nodeHealth, imageCaptionHealth] =
        await Promise.allSettled([
          SummaryApi.keepWebscrapingAlive(),
          SummaryApi.healthCheck(),
          SummaryApi.checkImageCaptionService(),
        ]);

      console.log("Health check results:", {
        webscraping: webscrapingHealth.status === "fulfilled" ? "✅" : "❌",
        nodejs: nodeHealth.status === "fulfilled" ? "✅" : "❌",
        imageCaption: imageCaptionHealth.status === "fulfilled" ? "✅" : "❌",
      });
    } catch (error) {
      console.error("Initial health checks failed:", error);
    }
  }

  // Stop keep-alive service
  stopKeepAlive() {
    if (!this.isRunning) {
      console.log("Keep-alive service is not running");
      return;
    }

    console.log("🛑 Stopping keep-alive service...");

    // Clear all intervals
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`Cleared ${name} keep-alive interval`);
    }

    this.intervals.clear();
    this.isRunning = false;
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeServices: Array.from(this.intervals.keys()),
    };
  }
}

// Create singleton instance
const keepAliveService = new KeepAliveService();

export default keepAliveService;
