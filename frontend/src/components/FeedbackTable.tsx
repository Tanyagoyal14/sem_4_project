function FeedbackTable({ data }: any) {

  return (
    <table className="w-full bg-white rounded-xl shadow">

      <thead className="bg-gray-200">
        <tr>
          <th className="p-3">Feedback</th>
          <th>Sentiment</th>
          <th>Industry</th>
        </tr>
      </thead>

      <tbody>

        {data.map((item:any,index:number)=>(
          <tr key={index} className="border-t">

            <td className="p-3">{item.feedback}</td>
            <td>{item.sentiment}</td>
            <td>{item.industry}</td>

          </tr>
        ))}

      </tbody>

    </table>
  );
}

export default FeedbackTable;