import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function IndustryChart({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="industry" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="confidence" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default IndustryChart;