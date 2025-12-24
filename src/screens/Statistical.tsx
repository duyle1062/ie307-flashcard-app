import React, { useCallback, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";
import { useAuth } from "../shared/context/AuthContext";
import { StatisticalService, DashboardData } from "../features/usage/services/StatisticalService";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function Statistical() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const stats = await StatisticalService.getDashboardData(user.uid);
      setData(stats);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      <Text style={styles.screenTitle}>Statistics</Text>

      {/* 1. Tổng quan Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Review Activity</Text>
        <View style={styles.statsGrid}>
          <StatBox 
            label="Today" 
            value={data?.reviewStats.today_count || 0} 
            color={Colors.blue} 
            icon="today-outline" 
          />
          <StatBox 
            label="This Week" 
            value={data?.reviewStats.week_count || 0} 
            color={Colors.green} 
            icon="calendar-outline" 
          />
          <StatBox 
            label="All Time" 
            value={data?.reviewStats.total_count || 0} 
            color={Colors.secondary} 
            icon="infinite-outline" 
          />
        </View>
      </View>

      {/* 2. Giờ học vàng */}
      {data?.mostFrequentHour && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <Ionicons name="time" size={24} color={Colors.primary} />
             <Text style={styles.cardTitle}>Golden Hour</Text>
          </View>
          <Text style={styles.goldenHourText}>
            You focus best around{" "}
            <Text style={styles.highlightText}>
              {data.mostFrequentHour.hour}:00 - {data.mostFrequentHour.hour + 1}:00
            </Text>
          </Text>
          <Text style={styles.subText}>
            Based on {data.mostFrequentHour.count} study sessions
          </Text>
        </View>
      )}

      {/* 3. Top Collections (Biểu đồ thanh đơn giản) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Collections</Text>
        <View style={styles.card}>
           {data?.topCollections.length === 0 ? (
             <Text style={styles.emptyText}>No data yet. Start learning!</Text>
           ) : (
             data?.topCollections.map((item, index) => {
               const maxVal = data.topCollections[0].review_count || 1;
               const percent = (item.review_count / maxVal) * 100;
               
               return (
                 <View key={item.id} style={styles.barContainer}>
                   <View style={styles.barLabelContainer}>
                     <Text style={styles.barLabel} numberOfLines={1}>{item.name}</Text>
                     <Text style={styles.barValue}>{item.review_count} revs</Text>
                   </View>
                   <View style={styles.barBackground}>
                     <View style={[styles.barFill, { width: `${percent}%` }]} />
                   </View>
                 </View>
               );
             })
           )}
        </View>
      </View>

      {/* 4. Top Hardest Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Reviewed Cards (Hardest)</Text>
        {data?.topCards.length === 0 ? (
           <View style={styles.card}>
             <Text style={styles.emptyText}>No reviews yet.</Text>
           </View>
        ) : (
          data?.topCards.map((card, index) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardFront} numberOfLines={1}>{card.front}</Text>
                <Text style={styles.cardCollection}>{card.collection_name}</Text>
              </View>
              <View style={styles.reviewBadge}>
                <Text style={styles.reviewBadgeText}>{card.review_count}</Text>
              </View>
            </View>
          ))
        )}
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const StatBox = ({ label, value, color, icon }: any) => (
  <View style={[styles.statBox, Shadows.light]}>
    <Ionicons name={icon} size={24} color={color} style={{ marginBottom: 4 }} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60, // Space for header
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.title,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.subText,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: (width - 40 - 24) / 3, // (Screen - padding - gap) / 3
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.medium,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.title,
    marginLeft: 8,
  },
  goldenHourText: {
    fontSize: 16,
    color: Colors.title,
    marginBottom: 4,
  },
  highlightText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 18,
  },
  subText: {
    fontSize: 12,
    color: Colors.gray,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.gray,
    fontStyle: "italic",
    padding: 10,
  },
  // Bar Chart Styles
  barContainer: {
    marginBottom: 12,
  },
  barLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 14,
    color: Colors.title,
    fontWeight: "500",
    flex: 1,
  },
  barValue: {
    fontSize: 12,
    color: Colors.subText,
  },
  barBackground: {
    height: 8,
    backgroundColor: Colors.silver,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  // List Styles
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    ...Shadows.light,
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.tertiary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.title,
  },
  cardInfo: {
    flex: 1,
  },
  cardFront: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.title,
  },
  cardCollection: {
    fontSize: 12,
    color: Colors.gray,
  },
  reviewBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
  },
});
