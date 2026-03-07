import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Landing() {

  const [showText, setShowText] = useState(false);

  useEffect(() => {

    // delay text appearance so user watches video first
    const timer = setTimeout(() => {
      setShowText(true);
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);

  }, []);

  return (

    <div className="relative min-h-screen flex items-center justify-center text-white">

      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source src="/feedback-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Animated Text Container */}
      <div
        className={`relative z-10 text-center px-10 py-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl transition-all duration-1000 ${
          showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >

        <h1 className="text-5xl font-bold mb-6">
          AI Feedback Intelligence
        </h1>

        <p className="text-lg mb-8 max-w-xl mx-auto">
          Transform customer feedback into actionable insights using NLP and Generative AI.
        </p>

        <Link
          to="/app/dashboard"
          className="bg-pink-500 hover:bg-pink-600 px-8 py-3 rounded-xl text-lg font-semibold transition"
        >
          Launch Dashboard
        </Link>

      </div>

    </div>

  );

}

export default Landing;