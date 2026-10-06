import BackgroundGlow from "../../effects/BackgroundGlow";
import Navbar from "./components/navbar/navbar";
import Hero from "./components/Hero/Hero";
import FeaturesPreview from "./components/FeaturesPreview/FeaturesPreview";
import HowItWorks from "./components/howitworks/howitworks";
import WhySection from "./components/whysection/whysection";
import Faq from "./components/Faq/Faq";
import CTA from "./components/CTA/CTA";
import Footer from "./components/Footer/Footer";

import "./Landing.css";

export default function Landing() {

  return (

    <div className="landing-page">
      <BackgroundGlow />

      <div className="landing-background"></div>

      <Navbar />

      <Hero />


      <FeaturesPreview />

      <HowItWorks />

      <WhySection />

      <Faq />

      <CTA />

      <Footer />

    </div>

  );

}