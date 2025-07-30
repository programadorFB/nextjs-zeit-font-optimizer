import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

const BarChart = ({ data, width, height }) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max value for scaling
  const maxValue = Math.max(...data.flatMap(d => [d.deposits, d.withdraws]), 0);
  const scale = chartHeight / (maxValue || 1);

  // Calculate bar width and spacing
  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.max(barGroupWidth * 0.3, 15);
  const barSpacing = 4;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + (1 - ratio) * chartHeight;
          return (
            <Line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#333333"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          );
        })}

        {/* X-axis */}
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#666666"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#666666"
          strokeWidth="2"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const xCenter = padding + (i + 0.5) * barGroupWidth;
          const depositsHeight = d.deposits * scale;
          const withdrawsHeight = d.withdraws * scale;

          return (
            <React.Fragment key={i}>
              {/* Deposits bar */}
              <Rect
                x={xCenter - barWidth - barSpacing / 2}
                y={height - padding - depositsHeight}
                width={barWidth}
                height={depositsHeight}
                fill="#4CAF50"
                rx="2"
              />

              {/* Withdraws bar */}
              <Rect
                x={xCenter + barSpacing / 2}
                y={height - padding - withdrawsHeight}
                width={barWidth}
                height={withdrawsHeight}
                fill="#F44336"
                rx="2"
              />

              {/* Month label */}
              <SvgText
                x={xCenter}
                y={height - padding + 20}
                fontSize="12"
                fill="#CCCCCC"
                textAnchor="middle"
              >
                {d.monthLabel}
              </SvgText>

              {/* Value labels on bars */}
              {depositsHeight > 20 && (
                <SvgText
                  x={xCenter - barWidth / 2 - barSpacing / 2}
                  y={height - padding - depositsHeight + 15}
                  fontSize="10"
                  fill="#FFFFFF"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  ${Math.round(d.deposits)}
                </SvgText>
              )}

              {withdrawsHeight > 20 && (
                <SvgText
                  x={xCenter + barWidth / 2 + barSpacing / 2}
                  y={height - padding - withdrawsHeight + 15}
                  fontSize="10"
                  fill="#FFFFFF"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  ${Math.round(d.withdraws)}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = ratio * maxValue;
          const y = padding + (1 - ratio) * chartHeight;
          return (
            <SvgText
              key={i}
              x={padding - 10}
              y={y + 4}
              fontSize="12"
              fill="#CCCCCC"
              textAnchor="end"
            >
              ${Math.round(value)}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  noDataText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '500',
  },
});

export default BarChart;