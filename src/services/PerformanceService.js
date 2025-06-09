// src/services/PerformanceService.js

class PerformanceService {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_PERFORMANCE === 'true';
  }

  // ===== PERFORMANCE MEASUREMENT =====

  // Start measuring performance
  startMeasure(name) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    this.metrics.set(name, { startTime, endTime: null, duration: null });
    
    // Use Performance API if available
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  // End measuring performance
  endMeasure(name) {
    if (!this.isEnabled) return;
    
    const endTime = performance.now();
    const metric = this.metrics.get(name);
    
    if (metric) {
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      
      // Use Performance API if available
      if (performance.mark && performance.measure) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
      
      // Log slow operations
      if (metric.duration > 1000) { // > 1 second
        console.warn(`🐌 Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
      
      return metric.duration;
    }
    
    return null;
  }

  // Get performance metrics
  getMetrics() {
    const results = {};
    this.metrics.forEach((value, key) => {
      results[key] = value;
    });
    return results;
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }

  // ===== RESOURCE MONITORING =====

  // Monitor resource loading
  monitorResourceLoading() {
    if (!this.isEnabled || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 2000) { // > 2 seconds
            console.warn(`🐌 Slow resource loading: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    } catch (error) {
      console.error('Failed to setup resource monitoring:', error);
    }
  }

  // Monitor navigation timing
  monitorNavigation() {
    if (!this.isEnabled || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('📊 Navigation timing:', {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            totalTime: entry.loadEventEnd - entry.fetchStart
          });
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', observer);
    } catch (error) {
      console.error('Failed to setup navigation monitoring:', error);
    }
  }

  // Monitor largest contentful paint
  monitorLCP() {
    if (!this.isEnabled || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('📊 Largest Contentful Paint:', lastEntry.startTime.toFixed(2) + 'ms');
        
        if (lastEntry.startTime > 2500) { // > 2.5 seconds
          console.warn('🐌 Poor LCP performance detected');
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    } catch (error) {
      console.error('Failed to setup LCP monitoring:', error);
    }
  }

  // Monitor first input delay
  monitorFID() {
    if (!this.isEnabled || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('📊 First Input Delay:', entry.processingStart - entry.startTime + 'ms');
          
          if (entry.processingStart - entry.startTime > 100) { // > 100ms
            console.warn('🐌 Poor FID performance detected');
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      console.error('Failed to setup FID monitoring:', error);
    }
  }

  // ===== MEMORY MONITORING =====

  // Monitor memory usage
  monitorMemory() {
    if (!this.isEnabled || !performance.memory) return;

    const memInfo = performance.memory;
    const memoryUsage = {
      used: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
      total: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) // MB
    };

    console.log('📊 Memory usage:', memoryUsage);

    // Warn if memory usage is high
    if (memoryUsage.used / memoryUsage.limit > 0.8) {
      console.warn('🚨 High memory usage detected:', memoryUsage);
    }

    return memoryUsage;
  }

  // ===== NETWORK MONITORING =====

  // Monitor network requests
  monitorNetworkRequests() {
    if (!this.isEnabled) return;

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log slow requests
        if (duration > 3000) { // > 3 seconds
          console.warn(`🐌 Slow network request: ${url} took ${duration.toFixed(2)}ms`);
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(`❌ Network request failed: ${url} after ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
  }

  // ===== COMPONENT PERFORMANCE =====

  // Measure component render time
  measureComponentRender(componentName, renderFunction) {
    if (!this.isEnabled) return renderFunction();

    this.startMeasure(`component-${componentName}`);
    const result = renderFunction();
    this.endMeasure(`component-${componentName}`);
    
    return result;
  }

  // ===== BUNDLE ANALYSIS =====

  // Analyze bundle size
  analyzeBundleSize() {
    if (!this.isEnabled) return;

    // Get all script tags
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
      if (script.src.includes('static/js/')) {
        // Estimate size based on typical compression ratios
        console.log('📦 Script loaded:', script.src);
      }
    });

    console.log('📊 Total scripts loaded:', scripts.length);
  }

  // ===== INITIALIZATION =====

  // Initialize all monitoring
  init() {
    if (!this.isEnabled) {
      console.log('📊 Performance monitoring disabled');
      return;
    }

    console.log('📊 Initializing performance monitoring...');
    
    this.monitorResourceLoading();
    this.monitorNavigation();
    this.monitorLCP();
    this.monitorFID();
    this.monitorNetworkRequests();
    
    // Monitor memory every 30 seconds
    setInterval(() => {
      this.monitorMemory();
    }, 30000);

    // Analyze bundle on load
    if (document.readyState === 'complete') {
      this.analyzeBundleSize();
    } else {
      window.addEventListener('load', () => {
        this.analyzeBundleSize();
      });
    }
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.clearMetrics();
  }

  // ===== REPORTING =====

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      memory: this.monitorMemory(),
      userAgent: navigator.userAgent,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };

    console.log('📊 Performance Report:', report);
    return report;
  }

  // Send report to analytics service
  sendReport(report = null) {
    if (!this.isEnabled) return;

    const performanceReport = report || this.generateReport();
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, Mixpanel, etc.
      // analytics.track('performance_report', performanceReport);
    }

    return performanceReport;
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

// Auto-initialize
if (typeof window !== 'undefined') {
  performanceService.init();
}

export default performanceService;
