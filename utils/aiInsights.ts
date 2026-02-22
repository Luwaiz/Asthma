import { apiService } from '@/services/api';

export interface Insight {
    status: string;
    trend: string;
    color: string;
}

export const fetchAIInsights = async (): Promise<Insight> => {
    try {
        const insights = await apiService.getAIInsights();
        if (insights) {
            return insights;
        }
    } catch (error) {
        console.error("fetchAIInsights Error:", error);
    }

    return {
        status: "Insights Unavailable",
        trend: "We couldn't reach the AI service right now. Please check your connection.",
        color: "gray"
    };
};

export interface HealthStatus {
    label: string;
    description: string;
    color: string;
}

export const fetchAIHealthStatus = async (): Promise<HealthStatus> => {
    try {
        const status = await apiService.getAIHealthStatus();
        if (status) {
            return status;
        }
    } catch (error) {
        console.error("fetchAIHealthStatus Error:", error);
    }

    return {
        label: "Status Unknown",
        description: "Unable to retrieve your health status at the moment.",
        color: "gray"
    };
};
