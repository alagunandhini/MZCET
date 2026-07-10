import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Feedback() {
  const { sessionId } = useParams();
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetch(`https://ai-resumereview.onrender.com/feedback/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) return;
        setFeedback(data);
      });
  }, [sessionId]);

  if (!feedback) return <p>Analyzing interview...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-10 ">
      <div className="bg-white rounded-xl shadow p-8 max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-4">Interview Feedback</h1>

        <p className="mb-4">
          Overall Score: <b>{feedback.overallScore}/10</b>
        </p>

        <h3 className="font-semibold">Strengths</h3>
        <ul className="list-disc pl-5 mb-4">
          {feedback?.strengths?.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        <h3 className="font-semibold">Improvements</h3>
        <ul className="list-disc pl-5">
          {feedback?.improvements?.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

