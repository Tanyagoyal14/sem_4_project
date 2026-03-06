import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

function FeatureCarousel() {

  const slides = [
    {
      title: "Sentiment Analysis",
      text: "Detect positive, neutral and negative feedback using AI."
    },
    {
      title: "Industry Detection",
      text: "Identify which industry the feedback belongs to."
    },
    {
      title: "AI Insights",
      text: "Generate actionable business insights automatically."
    }
  ];

  return (

    <Swiper
      spaceBetween={50}
      slidesPerView={1}
      autoplay={{ delay: 3000 }}
      loop
    >

      {slides.map((slide, i) => (

        <SwiperSlide key={i}>

          <div className="bg-white/20 backdrop-blur-xl rounded-xl p-10 text-white text-center">

            <h2 className="text-3xl font-bold mb-4">
              {slide.title}
            </h2>

            <p>{slide.text}</p>

          </div>

        </SwiperSlide>

      ))}

    </Swiper>

  );

}

export default FeatureCarousel;