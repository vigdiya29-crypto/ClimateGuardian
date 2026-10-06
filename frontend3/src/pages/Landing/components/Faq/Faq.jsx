import "./FAQ.css";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQ() {

const [active, setActive] = useState(0);

const faqData = [

{
question:"How does AQI Prediction work?",
answer:"ClimateGuardian uses machine learning models trained on environmental datasets to predict future Air Quality Index based on temperature, humidity, wind speed and pollution trends."
},

{
question:"How is my Carbon Footprint calculated?",
answer:"The calculator estimates emissions using travel habits, electricity usage, fuel consumption and everyday lifestyle activities based on internationally accepted emission factors."
},

{
question:"Can I generate sustainability reports?",
answer:"Yes. ClimateGuardian automatically creates clean and professional reports summarizing AQI predictions, carbon footprint and AI-powered environmental recommendations."
},

{
question:"Is my environmental data secure?",
answer:"Absolutely. Your personal information is never shared with third parties. Only the required environmental inputs are processed securely."
},

{
question:"Is ClimateGuardian free to use?",
answer:"Yes. Core features are available for free. Future premium plans may include advanced AI analytics and enterprise sustainability tools."
}

];

return(

<section id="faq" className="faq-section">
<div className="faq-header">

<span className="faq-tag">
FAQ
</span>

<h2>
Frequently Asked
<br/>
<span>Questions</span>
</h2>

<p>
Everything you need to know about ClimateGuardian and how our AI-powered sustainability platform works.
</p>

</div>

<div className="faq-container">

{
faqData.map((item,index)=>(

<div
className={`faq-item ${active===index?"active":""}`}
key={index}
onClick={()=>setActive(active===index?-1:index)}
>

<div className="faq-question">

<h3>{item.question}</h3>

<span className="faq-icon">
  {active === index ? (
    <Minus size={19} strokeWidth={2.5} />
  ) : (
    <Plus size={19} strokeWidth={2.5} />
  )}
</span>

</div>

<div className="faq-answer">

<p>{item.answer}</p>

</div>

</div>

))
}

</div>

</section>

);

}