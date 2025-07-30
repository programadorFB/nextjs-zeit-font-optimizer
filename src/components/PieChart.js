import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

const PieChart = ({ data, width, height }) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const radius = Math.min(width, height) / 2 - 40;
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate total amount
  const totalAmount = data.reduce((sum, item) => sum + item.withdraws, 0);

  // Colors for different categories
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  // Calculate angles for each slice
  let currentAngle = -90; // Start from top
  const slices = data.map((item, index) => {
    const percentage = (item.withdraws / totalAmount) * 100;
    const sliceAngle = (item.withdraws / totalAmount) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    
    currentAngle += sliceAngle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      color: colors[index % colors.length]
    };
  });

  // Convert angle to radians
  const toRadians = (angle) => (angle * Math.PI) / 180;

  // Calculate path for each slice
  const createPath = (startAngle, endAngle, outerRadius, innerRadius = 0) => {
    const startAngleRad = toRadians(startAngle);
    const endAngleRad = toRadians(endAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    return [
      'M', centerX, centerY,
      'L', x1, y1,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 1, x2, y2,
      'Z'
    ].join(' ');
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Draw pie slices */}
        {slices.map((slice, index) => (
          <Path
            key={index}
            d={createPath(slice.startAngle, slice.endAngle, radius)}
            fill={slice.color}
            stroke="#000000"
            strokeWidth="2"
          />
        ))}
        
        {/* Draw labels */}
        {slices.map((slice, index) => {
          // Only show label if percentage is significant enough
          if (slice.percentage < 5) return null;
          
          const midAngle = (slice.startAngle + slice.endAngle) / 2;
          const midAngleRad = toRadians(midAngle);
          const labelRadius = radius * 0.7;
          
          const labelX = centerX + labelRadius * Math.cos(midAngleRad);
          const labelY = centerY + labelRadius * Math.sin(midAngleRad);
          
          return (
            <SvgText
              key={`label-${index}`}
              x={labelX}
              y={labelY}
              fontSize="12"
              fill="#000000"
              textAnchor="middle"
              fontWeight="bold"
            >
              {slice.percentage.toFixed(0)}%
            </SvgText>
          );
        })}
        
        {/* Center circle for donut effect */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.4}
          fill="#000000"
          stroke="#333333"
          strokeWidth="2"
        />
        
        {/* Total amount in center */}
        <SvgText
          x={centerX}
          y={centerY - 8}
          fontSize="14"
          fill="#CCCCCC"
          textAnchor="middle"
          fontWeight="bold"
        >
          Total
        </SvgText>
        <SvgText
          x={centerX}
          y={centerY + 8}
          fontSize="16"
          fill="#FFD700"
          textAnchor="middle"
          fontWeight="bold"
        >
          ${Math.round(totalAmount)}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PieChart;