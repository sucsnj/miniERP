import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { VendaDiaria } from '../services/vendasService';
import { formatCurrency, formatCurrencyNumber } from '../utils/formatter';

interface SalesChartProps {
  data: VendaDiaria[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [range, setRange] = useState<30 | 7 | 3>(30);

  const sortedData = [...data].sort((a, b) => a.id - b.id);
  
  // Filtra os dados pelo alcance escolhido
  const chartData = sortedData
  .slice(-range)
  .map((sale) => ({
    data: sale.criado_em,
    valor: formatCurrencyNumber(sale.valor, 2),
  }));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Evolução Diária de Vendas</h2>

        <button
          type="button"
          onClick={() =>
            setChartType((prev) => (prev === 'line' ? 'bar' : 'line'))
          }
        >
          Trocar gráfico
        </button>

        <div className="range-buttons">
          <button onClick={() => setRange(30)}>30 vendas</button>
          <button onClick={() => setRange(7)}>7 vendas</button>
          <button onClick={() => setRange(3)}>3 vendas</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value), 2)} />
            <Line type="monotone" dataKey="valor" stroke="#8884d8" />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value), 2)} />
            <Bar dataKey="valor" fill="#8884d8" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
