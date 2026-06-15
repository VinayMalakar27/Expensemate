import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { getAnalytics } from '../services/api';

const screenWidth = Dimensions.get('window').width;
const COLORS = ['#6C63FF', '#FF5252', '#4CAF50', '#FF9800', '#00BCD4', '#E91E63'];

export default function AnalyticsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalytics(period);
      setData(res.data);
    } catch (err) {
      console.log('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  const maxExpense = Math.max(...(data?.monthlyComparison?.map(m => m.expense) || [1]));

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics 📊</Text>
      </View>

      {/* Period Toggle */}
      <View style={styles.periodToggle}>
        {['week', 'month', 'year', 'all'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: '#4CAF50' }]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>
            ₹{data?.totalIncome?.toLocaleString() || 0}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#FF5252' }]}>
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={[styles.summaryAmount, { color: '#FF5252' }]}>
            ₹{data?.totalExpense?.toLocaleString() || 0}
          </Text>
        </View>
      </View>

      {/* Monthly Bar Chart - Custom */}
      {data?.monthlyComparison?.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Expenses</Text>
          <View style={styles.barChart}>
            {data.monthlyComparison.slice(-6).map((item, index) => (
              <View key={index} style={styles.barItem}>
                <Text style={styles.barAmount}>
                  {item.expense > 999 ? `${(item.expense/1000).toFixed(1)}k` : item.expense}
                </Text>
                <View style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    {
                      height: Math.max(4, (item.expense / maxExpense) * 120),
                      backgroundColor: COLORS[index % COLORS.length]
                    }
                  ]} />
                </View>
                <Text style={styles.barLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Daily Trend */}
      {data?.dailyTrend?.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Daily Trend (Last 7 days)</Text>
          {data.dailyTrend.slice(-7).map((item, index) => (
            <View key={index} style={styles.trendRow}>
              <Text style={styles.trendDate}>{item.date}</Text>
              <View style={styles.trendBars}>
                {item.income > 0 && (
                  <View style={styles.trendBarRow}>
                    <Text style={styles.trendLabel}>Inc</Text>
                    <View style={[styles.trendBar, {
                      width: Math.max(4, (item.income / Math.max(...data.dailyTrend.map(d => Math.max(d.income, d.expense)))) * 150),
                      backgroundColor: '#4CAF50'
                    }]} />
                    <Text style={styles.trendAmount}>₹{item.income}</Text>
                  </View>
                )}
                {item.expense > 0 && (
                  <View style={styles.trendBarRow}>
                    <Text style={styles.trendLabel}>Exp</Text>
                    <View style={[styles.trendBar, {
                      width: Math.max(4, (item.expense / Math.max(...data.dailyTrend.map(d => Math.max(d.income, d.expense)))) * 150),
                      backgroundColor: '#FF5252'
                    }]} />
                    <Text style={styles.trendAmount}>₹{item.expense}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Category Breakdown */}
      {data?.categoryBreakdown?.length > 0 && (
        <View style={styles.categoryContainer}>
          <Text style={styles.chartTitle}>Category Breakdown</Text>
          {data.categoryBreakdown.map((cat, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryLeft}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={styles.categoryAmount}>₹{cat.amount?.toLocaleString()}</Text>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (cat.amount / data.totalExpense) * 100)}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }
                  ]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  periodToggle: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodBtnActive: {
    backgroundColor: '#6C63FF',
  },
  periodText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  summaryRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  summaryLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 16,
  },
  chartTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barAmount: {
    color: '#999',
    fontSize: 10,
    marginBottom: 4,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  barLabel: {
    color: '#999',
    fontSize: 11,
    marginTop: 6,
  },
  trendRow: {
    marginBottom: 12,
  },
  trendDate: {
    color: '#999',
    fontSize: 11,
    marginBottom: 4,
  },
  trendBars: {
    gap: 4,
  },
  trendBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendLabel: {
    color: '#666',
    fontSize: 10,
    width: 24,
  },
  trendBar: {
    height: 8,
    borderRadius: 4,
  },
  trendAmount: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  categoryContainer: {
    marginHorizontal: 24,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  categoryAmount: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#2E2E3E',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
});