import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';

const LineChart = ({ data, width, height }) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find min and max values for scaling
  const allValues = data.flatMap(d => [d.deposits, d.withdraws]);
  const maxValue = Math.max(...allValues, 0);
  const minValue = Math.min(...allValues, 0);
  const valueRange = maxValue - minValue || 1;

  // Scale functions
  const scaleX = (index) => (index / (data.length - 1)) * chartWidth + padding;
  const scaleY = (value) => height - padding - ((value - minValue) / valueRange) * chartHeight;

  // Generate path for deposits line
  const depositsPath = data.map((d, i) => {
    const x = scaleX(i);
    const y = scaleY(d.deposits);
    return i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  // Generate path for withdraws line
  const withdrawsPath = data.map((d, i) => {
    const x = scaleX(i);
    const y = scaleY(d.withdraws);
    return i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  // Generate path for balance line
  const balancePath = data.map((d, i) => {
    const x = scaleX(i);
    const y = scaleY(d.balance);
    return i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * chartHeight;
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

        {/* Zero line */}
        {minValue < 0 && (
          <Line
            x1={padding}
            y1={scaleY(0)}
            x2={width - padding}
            y2={scaleY(0)}
            stroke="#666666"
            strokeWidth="2"
          />
        )}

        {/* Deposits line */}
        <Path
          d={depositsPath}
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Withdraws line */}
        <Path
          d={withdrawsPath}
          stroke="#F44336"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Balance line */}
        <Path
          d={balancePath}
          stroke="#FFD700"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = scaleX(i);
          return (
            <React.Fragment key={i}>
              <Circle
                cx={x}
                cy={scaleY(d.deposits)}
                r="4"
                fill="#4CAF50"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <Circle
                cx={x}
                cy={scaleY(d.withdraws)}
                r="4"
                fill="#F44336"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <Circle
                cx={x}
                cy={scaleY(d.balance)}
                r="4"
                fill="#FFD700"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </React.Fragment>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 4) === 0 || i === data.length - 1) {
            return (
              <SvgText
                key={i}
                x={scaleX(i)}
                y={height - 10}
                fontSize="12"
                fill="#CCCCCC"
                textAnchor="middle"
              >
                {d.monthLabel}
              </SvgText>
            );
          }
          return null;
        })}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, i) => {
          const value = minValue + ratio * valueRange;
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
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFD700' }]} />
          <Text style={styles.legendText}>Balance</Text>
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
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '500',
  },
});

export default LineChart;