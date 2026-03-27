interface LoginEvent {
  userId?: string;
  email: string;
  timestamp: number;
  ip?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  method: 'email' | 'social' | '2fa';
  socialProvider?: string;
  sessionId?: string;
  responseTime: number;
}

interface LoginMetrics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  averageResponseTime: number;
  loginMethods: {
    email: number;
    social: number;
    '2fa': number;
  };
  socialProviders: {
    google: number;
    github: number;
    facebook: number;
    twitter: number;
  };
  failureReasons: Record<string, number>;
  hourlyLogins: Record<number, number>;
  dailyLogins: Record<string, number>;
}

class LoginAnalytics {
  private events: LoginEvent[] = [];
  private readonly STORAGE_KEY = 'unishop_login_analytics';
  private readonly MAX_EVENTS = 1000;

  constructor() {
    this.loadEvents();
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load login analytics:', error);
      this.events = [];
    }
  }

  private saveEvents(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save login analytics:', error);
    }
  }

  private getClientInfo(): { ip?: string; userAgent?: string } {
    return {
      userAgent: navigator.userAgent,
      ip: undefined // Would need backend to get real IP
    };
  }

  trackLogin(event: Omit<LoginEvent, 'timestamp' | 'ip' | 'userAgent' | 'responseTime'>): void {
    const startTime = performance.now();
    
    const loginEvent: LoginEvent = {
      ...event,
      timestamp: Date.now(),
      responseTime: 0, // Will be updated after login completes
      ...this.getClientInfo()
    };

    // Add to events
    this.events.push(loginEvent);

    // Limit events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    this.saveEvents();
  }

  updateLoginResponseTime(email: string, responseTime: number): void {
    const event = this.events
      .reverse()
      .find(e => e.email === email && e.responseTime === 0);
    
    if (event) {
      event.responseTime = responseTime;
      this.saveEvents();
    }
  }

  trackLoginSuccess(email: string, userId?: string, method: 'email' | 'social' | '2fa' = 'email', socialProvider?: string): void {
    this.trackLogin({
      email,
      userId,
      success: true,
      method,
      socialProvider
    });
  }

  trackLoginFailure(email: string, failureReason: string, method: 'email' | 'social' | '2fa' = 'email', socialProvider?: string): void {
    this.trackLogin({
      email,
      success: false,
      failureReason,
      method,
      socialProvider
    });
  }

  getMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): LoginMetrics {
    const now = Date.now();
    let timeLimit: number;

    switch (timeRange) {
      case '1h':
        timeLimit = now - (60 * 60 * 1000);
        break;
      case '24h':
        timeLimit = now - (24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeLimit = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeLimit = now - (30 * 24 * 60 * 60 * 1000);
        break;
    }

    const filteredEvents = this.events.filter(event => event.timestamp >= timeLimit);

    const metrics: LoginMetrics = {
      totalLogins: filteredEvents.length,
      successfulLogins: filteredEvents.filter(e => e.success).length,
      failedLogins: filteredEvents.filter(e => !e.success).length,
      uniqueUsers: new Set(filteredEvents.map(e => e.email)).size,
      averageResponseTime: filteredEvents.reduce((sum, e) => sum + e.responseTime, 0) / filteredEvents.length || 0,
      loginMethods: {
        email: filteredEvents.filter(e => e.method === 'email').length,
        social: filteredEvents.filter(e => e.method === 'social').length,
        '2fa': filteredEvents.filter(e => e.method === '2fa').length
      },
      socialProviders: {
        google: filteredEvents.filter(e => e.socialProvider === 'google').length,
        github: filteredEvents.filter(e => e.socialProvider === 'github').length,
        facebook: filteredEvents.filter(e => e.socialProvider === 'facebook').length,
        twitter: filteredEvents.filter(e => e.socialProvider === 'twitter').length
      },
      failureReasons: {},
      hourlyLogins: {},
      dailyLogins: {}
    };

    // Calculate failure reasons
    filteredEvents
      .filter(e => !e.success && e.failureReason)
      .forEach(e => {
        metrics.failureReasons[e.failureReason!] = (metrics.failureReasons[e.failureReason!] || 0) + 1;
      });

    // Calculate hourly logins
    filteredEvents.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      metrics.hourlyLogins[hour] = (metrics.hourlyLogins[hour] || 0) + 1;
    });

    // Calculate daily logins
    filteredEvents.forEach(e => {
      const day = new Date(e.timestamp).toISOString().split('T')[0];
      metrics.dailyLogins[day] = (metrics.dailyLogins[day] || 0) + 1;
    });

    return metrics;
  }

  getSecurityAlerts(): Array<{
    type: 'brute_force' | 'suspicious_location' | 'high_failure_rate';
    message: string;
    severity: 'low' | 'medium' | 'high';
    data: any;
  }> {
    const alerts = [];
    const last24h = this.getMetrics('24h');

    // Check for brute force attacks
    const failureCounts: Record<string, number> = {};
    this.events
      .filter(e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000 && !e.success)
      .forEach(e => {
        failureCounts[e.email] = (failureCounts[e.email] || 0) + 1;
      });

    Object.entries(failureCounts).forEach(([email, count]) => {
      if (count >= 5) {
        alerts.push({
          type: 'brute_force',
          message: `Phát hiện tấn công brute force vào tài khoản: ${email}`,
          severity: count >= 10 ? 'high' : 'medium',
          data: { email, failureCount: count }
        });
      }
    });

    // Check for high failure rate
    if (last24h.totalLogins > 0) {
      const failureRate = last24h.failedLogins / last24h.totalLogins;
      if (failureRate > 0.5) {
        alerts.push({
          type: 'high_failure_rate',
          message: `Tỷ lệ đăng nhập thất bại cao: ${(failureRate * 100).toFixed(1)}%`,
          severity: failureRate > 0.7 ? 'high' : 'medium',
          data: { failureRate: failureRate * 100 }
        });
      }
    }

    return alerts;
  }

  clearEvents(): void {
    this.events = [];
    this.saveEvents();
  }

  exportData(): string {
    return JSON.stringify({
      events: this.events,
      metrics: this.getMetrics('30d'),
      alerts: this.getSecurityAlerts(),
      exportDate: new Date().toISOString()
    }, null, 2);
  }
}

export const loginAnalytics = new LoginAnalytics();
