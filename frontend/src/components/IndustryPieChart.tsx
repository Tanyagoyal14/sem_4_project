import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#6366f1","#ec4899","#22c55e","#f59e0b"];

function IndustryPieChart({data}:any){

  if(!data) return null

  return(

    <ResponsiveContainer width="100%" height={300}>

      <PieChart>

        <Pie
          data={data}
          dataKey="confidence"
          nameKey="industry"
          outerRadius={110}
          label
        >

          {data.map((entry:any,index:number)=>(
            <Cell key={index} fill={COLORS[index % COLORS.length]}/>
          ))}

        </Pie>

        <Tooltip/>
        <Legend/>

      </PieChart>

    </ResponsiveContainer>

  )

}

export default IndustryPieChart