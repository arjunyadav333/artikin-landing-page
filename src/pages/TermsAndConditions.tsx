import React from "react";
import LegalHeader from "@/components/landing/LegalHeader";
import LegalFooter from "@/components/landing/LegalFooter";
import { FileText, ChevronRight } from "lucide-react";

const TermsAndConditions = () => {
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const toc = [
    { id: "use", title: "1. Use of the Platform" },
    { id: "account", title: "2. User Accounts" },
    { id: "content", title: "3. User Content" },
    { id: "conduct", title: "4. Acceptable Use" },
    { id: "jobs", title: "5. Jobs and Opportunities" },
    { id: "communication", title: "6. Messaging and Communication" },
    { id: "termination", title: "7. Account Suspension or Termination" },
    { id: "intellectual", title: "8. Intellectual Property" },
    { id: "liability", title: "9. Limitation of Liability" },
    { id: "changes", title: "10. Changes to Terms" },
    { id: "contact", title: "11. Contact" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-700">
      <LegalHeader />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-slate-500 font-medium mb-8">Effective Date: March 5, 2026</p>
            <div className="text-lg text-slate-600 max-w-3xl mx-auto space-y-4 text-left">
              <p>
                Welcome to Artikin. These Terms and Conditions govern your access to and use of the Artikin mobile
                application and related services. Artikin is a professional platform where artists can showcase
                their work, create portfolios, connect with other creators, and explore job opportunities.
              </p>
              <p>
                Organizations and hirers can discover artists, post opportunities, and collaborate with creative
                professionals.
              </p>
              <p>
                By creating an account or using the Artikin platform, you agree to comply with these Terms and
                Conditions. If you do not agree with these terms, you should not use the platform.
              </p>
            </div>
          </header>

          {/* Table of Contents */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-blue-600 mb-16">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Table of Contents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toc.map((item) => (
                <a 
                  key={item.id} 
                  href={`#${item.id}`} 
                  className="flex items-center text-blue-600 font-medium hover:underline group"
                >
                  <ChevronRight className="w-4 h-4 mr-1 transition-transform group-hover:translate-x-1" />
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-12 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
            <section className="scroll-mt-24" id="use">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                1. Use of the Platform
              </h2>
              <div className="space-y-4">
                <p>Artikin provides a platform where artists can create portfolios, upload artwork, share posts, and connect with other professionals. Organizations and hirers may use the platform to discover artists, post job opportunities, and collaborate with creators.</p>
                <p>You agree to use the platform only for lawful purposes and in accordance with these Terms.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="account">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                2. User Accounts
              </h2>
              <div className="space-y-4">
                <p>To access certain features of Artikin, you must create an account. When creating an account, you agree to provide accurate and complete information.</p>
                <p>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="content">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                3. User Content
              </h2>
              <div className="space-y-4">
                <p>Users may upload content including images, videos, portfolios, posts, comments, and other materials. By posting content on Artikin, you confirm that you have the necessary rights or permissions to share that content.</p>
                <p>You retain ownership of your content, but you grant Artikin a license to display and distribute that content within the platform for the purpose of operating and improving the service.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="conduct">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                4. Acceptable Use
              </h2>
              <div className="space-y-4">
                <p>Users must use the Artikin platform responsibly and must not upload or share harmful or illegal content.</p>
                <p>The following types of content and behavior are strictly prohibited on Artikin:</p>
                <ul className="list-none space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Content that contains nudity, pornography, or sexually explicit material.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Content that promotes illegal activities or violates applicable laws.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Harassment, hate speech, abusive behavior, or threats toward other users.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Violence or content that promotes harm to others.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Spam, misleading information, or fraudulent activity.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Content that infringes copyrights, trademarks, or intellectual property rights.</span>
                  </li>
                </ul>
                <p>Artikin reserves the right to remove content and suspend or terminate accounts that violate these rules.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="jobs">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                5. Jobs and Opportunities
              </h2>
              <div className="space-y-4">
                <p>Artikin allows organizations and hirers to post job opportunities and allows artists to apply for those opportunities. Artikin does not guarantee employment, project completion, or payment between users.</p>
                <p>All agreements between artists and hirers are made directly between those parties.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="communication">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                6. Messaging and Communication
              </h2>
              <div className="space-y-4">
                <p>Users may communicate with each other through messaging and connection features. Users are responsible for their communications and must interact respectfully with other users.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="termination">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                7. Account Suspension or Termination
              </h2>
              <div className="space-y-4">
                <p>Artikin reserves the right to suspend or terminate accounts that violate these Terms, misuse the platform, or engage in harmful or illegal behavior.</p>
                <p>Users may also choose to delete their account through the application settings.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="intellectual">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                8. Intellectual Property
              </h2>
              <div className="space-y-4">
                <p>All platform design, branding, and technology associated with Artikin remain the property of Artikin. Users may not copy, distribute, or reproduce any part of the platform without permission.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="liability">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                9. Limitation of Liability
              </h2>
              <div className="space-y-4">
                <p>Artikin provides the platform on an “as-is” basis. We do not guarantee uninterrupted service, accuracy of user content, or successful collaborations between users.</p>
                <p>Artikin is not responsible for disputes, agreements, or transactions between artists and hirers.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="changes">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                10. Changes to Terms
              </h2>
              <div className="space-y-4">
                <p>Artikin may update these Terms and Conditions from time to time. When changes occur, the effective date will be updated.</p>
                <p>Continued use of the platform after changes indicates acceptance of the updated Terms.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="contact">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                11. Contact
              </h2>
              <div className="space-y-4">
                <p>If you have questions about these Terms and Conditions, you may contact us at:</p>
                <p className="font-semibold">Email: support@artikin.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default TermsAndConditions;
