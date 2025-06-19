import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface ChartData {
  labels: string[];
  datasets: {
    newUsers: number[];
    revenue: number[];
    withdrawals: number[];
  };
}

interface StatsChartProps {
  chartData: ChartData;
  title?: string;
  dataType: 'newUsers' | 'revenue' | 'withdrawals';
  height?: number;
}

// Format dates to be more readable
const formatLabels = (labels: string[]) => {
  return labels.map(label => {
    const date = new Date(label);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
};

const StatsChart: React.FC<StatsChartProps> = ({ 
  chartData, 
  title = "Statistics", 
  dataType, 
  height = 300 
}) => {
  // Set color based on data type
  const getLineColor = () => {
    switch (dataType) {
      case 'newUsers':
        return 'rgb(59, 130, 246)'; // Blue
      case 'revenue':
        return 'rgb(34, 197, 94)'; // Green
      case 'withdrawals':
        return 'rgb(249, 115, 22)'; // Orange
      default:
        return 'rgb(59, 130, 246)'; // Default blue
    }
  };

  // Format data for chart
  const data = {
    labels: formatLabels(chartData.labels),
    datasets: [
      {
        label: dataType === 'newUsers' 
          ? 'New Users' 
          : dataType === 'revenue' 
            ? 'Revenue ($)' 
            : 'Withdrawals ($)',
        data: chartData.datasets[dataType],
        borderColor: getLineColor(),
        backgroundColor: `${getLineColor()}33`, // Add transparency
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (dataType === 'newUsers') {
              return `${label}: ${value}`;
            } else {
              return `${label}: $${value.toFixed(2)}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (dataType === 'newUsers') {
              return value;
            } else {
              return `$${value}`;
            }
          }
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default StatsChart; 