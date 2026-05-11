import { Plus, Minus, HelpCircle, Gift, Search, Users, ShieldCheck } from "lucide-react";

const visualFaqs = [
  {
    icon: Gift,
    question: "Is it free?",
    answer: "Artikin is free to join and build your basic portfolio. Premium features are available for advanced growth.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Search,
    question: "Find jobs?",
    answer: "Browse our live Opportunities board daily for casting calls, freelance gigs, and collaborations.",
    color: "bg-amber-50 text-amber-600"
  },
  {
    icon: Users,
    question: "Hire artists?",
    answer: "Organizations can search our database and invite artists directly to projects or send inquiries.",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    icon: ShieldCheck,
    question: "Is it secure?",
    answer: "Your portfolio and personal data are protected with industry-standard encryption and privacy controls.",
    color: "bg-purple-50 text-purple-600"
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-blue-500 mb-6">
            Quick Answers
          </h2>
          <div className="w-24 h-1 bg-blue-500/20 mt-2 rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {visualFaqs.map((faq, index) => (
            <div 
              key={index}
              className="group p-8 rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 hover:shadow-blue-500/10 hover:-translate-y-3 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className={`w-20 h-20 rounded-3xl ${faq.color} flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                <faq.icon size={40} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                {faq.question}
              </h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm italic">
            Have a different question? <button className="text-blue-600 font-bold hover:underline">Contact our support team</button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
