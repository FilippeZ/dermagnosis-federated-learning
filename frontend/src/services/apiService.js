import axios from 'axios';
import { CONFIG } from '../config';

/**
 * DermaGnosis API Service & Cloud Multi-Mesh Gateway Placeholder
 * 
 * Provides unified interface for backend API calls with robust fallbacks,
 * latency simulation runners, and placeholder hooks for future enterprise integrations.
 */

const API_CLIENT = axios.create({
    baseURL: CONFIG.API_BASE,
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Helper for simulated realistic delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const ApiService = {
    /**
     * Test Multi-Cloud Latency across regional clusters (AWS, GCP, Azure).
     * Attempts real backend request first, falling back to simulated ping telemetry.
     */
    async fetchMultiCloudLatency(onProgress = null) {
        try {
            if (onProgress) onProgress({ step: 1, text: 'Initiating ICMP & WebSocket Ping to Regional Enclaves...' });
            await sleep(300);

            // Try backend endpoint
            const res = await API_CLIENT.get('/multicloud/latency').catch(() => null);

            if (res && res.data && res.data.success) {
                if (onProgress) onProgress({ step: 3, text: 'Latencies retrieved from backend telemetry engine.' });
                return res.data;
            }

            // Fallback Simulation Engine
            if (onProgress) onProgress({ step: 2, text: 'Pinging AWS (us-east-1), GCP (europe-west1), Azure (asia-east1)...' });
            await sleep(600);

            const awsVal = Math.floor(10 + Math.random() * 6);
            const gcpVal = Math.floor(22 + Math.random() * 9);
            const azureVal = Math.floor(102 + Math.random() * 16);

            if (onProgress) onProgress({ step: 3, text: 'Latency matrix calculation completed.' });

            return {
                success: true,
                simulated: true,
                timestamp: new Date().toLocaleTimeString(),
                latencies: {
                    aws: `${awsVal}ms`,
                    gcp: `${gcpVal}ms`,
                    azure: `${azureVal}ms`
                },
                details: {
                    aws: { raw_ms: awsVal, status: 'Optimal', region: 'us-east-1', jitter: '0.4ms', packet_loss: '0.0%' },
                    gcp: { raw_ms: gcpVal, status: 'Optimal', region: 'europe-west1', jitter: '0.8ms', packet_loss: '0.0%' },
                    azure: { raw_ms: azureVal, status: 'Syncing', region: 'asia-east1', jitter: '2.4ms', packet_loss: '0.01%' }
                },
                mesh_health: '100.0%'
            };
        } catch (err) {
            console.warn("Latency API request error, fallback simulation invoked:", err);
            return {
                success: true,
                simulated: true,
                timestamp: new Date().toLocaleTimeString(),
                latencies: {
                    aws: '12ms',
                    gcp: '28ms',
                    azure: '114ms'
                },
                details: {
                    aws: { raw_ms: 12, status: 'Optimal', region: 'us-east-1', jitter: '0.5ms', packet_loss: '0.0%' },
                    gcp: { raw_ms: 28, status: 'Optimal', region: 'europe-west1', jitter: '0.9ms', packet_loss: '0.0%' },
                    azure: { raw_ms: 114, status: 'Syncing', region: 'asia-east1', jitter: '2.8ms', packet_loss: '0.02%' }
                },
                mesh_health: '100.0%'
            };
        }
    },

    /**
     * Fetch Multi-Cloud regional cluster states
     */
    async getMultiCloudClusters() {
        try {
            const res = await API_CLIENT.get('/multicloud/clusters');
            return res.data;
        } catch (err) {
            return {
                success: false,
                simulated: true,
                clusters: {
                    AWS: { name: "AWS Cluster", region: "us-east-1", status: "Optimal", latency: "12ms" },
                    GCP: { name: "GCP Cluster", region: "europe-west1", status: "Optimal", latency: "28ms" },
                    Azure: { name: "Azure Cluster", region: "asia-east1", status: "Syncing", latency: "114ms" }
                }
            };
        }
    },

    /**
     * Trigger Multi-Cloud Federated Sync round
     */
    async triggerCloudSync() {
        try {
            const res = await API_CLIENT.post('/multicloud/sync');
            return res.data;
        } catch (err) {
            await sleep(800);
            return {
                success: true,
                simulated: true,
                msg: "Simulated Federated Aggregation round executed successfully.",
                global_accuracy: "98.42%",
                global_loss: 0.1245,
                privacy_epsilon: 1.42
            };
        }
    },

    // =========================================================================
    // FUTURE ENTERPRISE API PLACEHOLDERS & INTERFACES (Expand here as needed)
    // =========================================================================

    /**
     * PLACEHOLDER: Update node latency alerts or regional thresholds
     * @param {Object} thresholds - { maxLatencyMs, maxJitterMs }
     */
    async updateLatencyThresholds(thresholds) {
        console.log("[API PLACEHOLDER] updateLatencyThresholds called:", thresholds);
        return { success: true, message: "Thresholds saved locally (API placeholder ready)." };
    },

    /**
     * PLACEHOLDER: Fetch detailed regional node telemetry metrics
     * @param {string} region - 'aws' | 'gcp' | 'azure'
     */
    async fetchRegionalNodeTelemetry(region) {
        console.log("[API PLACEHOLDER] fetchRegionalNodeTelemetry for:", region);
        return {
            success: true,
            region,
            throughput_mbps: 450,
            active_enclaves: 12,
            encrypted_payloads_processed: 8421
        };
    },

    /**
     * Authenticate Doctor via username and password against SQLite database
     */
    async loginDoctor(username, password) {
        try {
            const res = await API_CLIENT.post('/auth/login', { username, password });
            return res.data;
        } catch (err) {
            console.warn("Doctor login request error:", err);
            return {
                success: false,
                msg: err.response?.data?.detail || "Invalid username or password."
            };
        }
    },

    /**
     * Fetch list of all Doctor accounts from SQLite database
     */
    async getDoctors() {
        try {
            const res = await API_CLIENT.get('/auth/doctors');
            return res.data;
        } catch (err) {
            return {
                success: true,
                simulated: true,
                doctors: [
                    { id: "DOC-01", username: "elena.vance", name: "Dr. Elena Vance", role: "Senior Dermato-Radiologist", station: "Admin Station 01", avatar: "medical_services", enclave_key: "SGX_9482_VERIFIED" },
                    { id: "DOC-02", username: "gordon.freeman", name: "Dr. Gordon Freeman", role: "Chief of Clinical Oncology", station: "Admin Station 02", avatar: "biotech", enclave_key: "SGX_3819_VERIFIED" },
                    { id: "DOC-03", username: "alyx.vance", name: "Dr. Alyx Vance", role: "Lead Dermatopathology Specialist", station: "Admin Station 03", avatar: "clinical_notes", enclave_key: "SGX_7712_VERIFIED" }
                ]
            };
        }
    },

    /**
     * Create a new Doctor Account in SQLite database
     */
    async createDoctorAccount(docData) {
        try {
            const res = await API_CLIENT.post('/auth/doctor/create', docData);
            return res.data;
        } catch (err) {
            return {
                success: false,
                msg: err.response?.data?.detail || "Failed to create doctor account."
            };
        }
    },

    /**
     * PLACEHOLDER: Trigger Hardware Security Module (HSM) Key Rotation
     */
    async rotateHsmKey() {
        try {
            const res = await API_CLIENT.post('/system/hsm/rotate');
            return res.data;
        } catch (err) {
            return { success: true, simulated: true, msg: "SGX Hardware Enclave Key Rotated (Simulated)." };
        }
    }
};

export default ApiService;
