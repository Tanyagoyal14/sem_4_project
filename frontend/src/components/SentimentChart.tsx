import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data=[
  {time:"10:00",positive:4,negative:1},
  {time:"11:00",positive:5,negative:2},
  {time:"12:00",positive:7,negative:3},
  {time:"13:00",positive:9,negative:4}
]

function SentimentChart(){

  return(

    <ResponsiveContainer width="100%" height={300}>

      <LineChart data={data}>

        <XAxis dataKey="time"/>
        <YAxis/>
        <Tooltip/>

        <Line type="monotone" dataKey="positive" stroke="#22c55e"/>
        <Line type="monotone" dataKey="negative" stroke="#ef4444"/>

      </LineChart>

    </ResponsiveContainer>

  )

}

export default SentimentChart