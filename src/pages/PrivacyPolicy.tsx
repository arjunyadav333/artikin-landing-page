import React from "react";
import LegalHeader from "@/components/landing/LegalHeader";
import LegalFooter from "@/components/landing/LegalFooter";
import { Link } from "react-router-dom";
import { Shield, ChevronRight } from "lucide-react";

const PrivacyPolicy = () => {
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
    { id: "about", title: "1. About Artikin" },
    { id: "data", title: "2. Information We Collect" },
    { id: "use", title: "3. How We Use Your Information" },
    { id: "share", title: "4. How Information Is Shared" },
    { id: "public", title: "5. Public Profiles and Content" },
    { id: "communication", title: "6. Messaging and Communication" },
    { id: "retention", title: "7. Data Retention" },
    { id: "account-deletion", title: "8. Account Deletion" },
    { id: "children", title: "9. Children's Privacy" },
    { id: "security", title: "10. Security" },
    { id: "changes", title: "11. Changes to This Policy" },
    { id: "contact", title: "12. Contact Information" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-700">
      <LegalHeader />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-slate-500 font-medium mb-8">Effective Date: March 5, 2026</p>
            <div className="text-lg text-slate-600 max-w-3xl mx-auto space-y-4 text-left">
              <p>
                At Artikin, we believe that transparency about how we collect and use data is essential. Artikin is a
                platform designed to connect artists, creators, organizations, and hirers so they can collaborate,
                showcase portfolios, share creative work, and discover professional opportunities.
              </p>
              <p>
                This Privacy Policy explains what information we collect, how it is used, and how it may be shared
                when you use the Artikin mobile application and related services.
              </p>
              <p>
                By creating an account or using the Artikin platform, you agree to the collection and use of
                information in accordance with this Privacy Policy.
              </p>
            </div>
          </header>

          {/* Table of Contents */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-blue-600 mb-16">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
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
            <section className="scroll-mt-24" id="about">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                1. About Artikin
              </h2>
              <div className="space-y-4">
                <p>Artikin is a professional networking and creative platform where artists and creators can build portfolios, share their work, and connect with other professionals. Organizations and hirers can discover artists, post job opportunities, and collaborate with creative professionals.</p>
                <p>Users may create portfolios, upload images or videos, publish posts, interact with other users through comments and shares, send messages, apply for job opportunities, and connect with professionals within the platform.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="data">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <p>When you create an account or interact with the Artikin platform, we may collect information that you provide directly. This may include personal details such as your name, email address, mobile phone number, and profile information such as biography, profile image, skills, or professional details.</p>
                <p>Users may also upload portfolio content including images, artwork, projects, or videos to showcase their creative work. If you apply for jobs or submit project proposals through the platform, related information may also be collected.</p>
                <p>In addition to the information you provide directly, we may automatically collect certain technical information when you use the application, such as device type, operating system, IP address, and usage activity within the app.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="use">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                3. How We Use Your Information
              </h2>
              <div className="space-y-4">
                <p>Artikin uses the information collected from users to operate and improve the platform. This includes creating and managing user accounts, enabling artists to display portfolios, helping users connect with professionals, allowing organizations to post job opportunities, and enabling users to apply for jobs or collaborations.</p>
                <p>Information may also be used to personalize the user experience, recommend relevant content, improve platform functionality, maintain security, and provide customer support.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="share">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                4. How Information Is Shared
              </h2>
              <div className="space-y-4">
                <p>Artikin does not sell personal information to third parties. However, certain information may be shared with other users when content is posted publicly or when users interact with one another on the platform.</p>
                <p>We may also work with trusted service providers who help us operate the platform, such as hosting providers, analytics services, or infrastructure providers. These service providers are required to protect user data and only use it for the purpose of supporting our services.</p>
                <p>In certain circumstances, information may also be disclosed if required by law or when necessary to protect the rights, security, or integrity of the platform and its users.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="public">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                5. Public Profiles and Content
              </h2>
              <div className="space-y-4">
                <p>Your profile information and portfolio content may be visible to other users depending on your privacy settings. Content such as posts, images, videos, comments, and interactions may also be visible to other users within the platform.</p>
                <p>Users should avoid sharing sensitive personal information that they do not wish to be publicly visible.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="communication">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                6. Messaging and Communication
              </h2>
              <div className="space-y-4">
                <p>Artikin allows users to communicate with each other through messaging and connection requests. Message information may be processed to deliver messages, maintain platform security, prevent spam, and improve communication features.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="retention">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                7. Data Retention
              </h2>
              <div className="space-y-4">
                <p>We retain user information for as long as the account remains active or as necessary to provide services and comply with legal obligations. Some information may be retained for security, fraud prevention, or operational purposes.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="account-deletion">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                8. Account Deletion
              </h2>
              <div className="space-y-4">
                <p>Users may request account deletion from within the application settings or directly through our <Link to="/account-deletion" className="text-blue-600 hover:underline font-semibold">Account Deletion Page</Link>. When a deletion request is made, the account will be deactivated immediately. If the user logs in within thirty days, the account may be restored.</p>
                <p>After thirty days, the account and associated data will be permanently deleted from the platform.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="children">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                9. Children's Privacy
              </h2>
              <div className="space-y-4">
                <p>Artikin is not intended for individuals under the age of thirteen. We do not knowingly collect personal information from children. If such information is discovered, it will be removed promptly.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="security">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                10. Security
              </h2>
              <div className="space-y-4">
                <p>We implement reasonable technical and organizational measures designed to protect user information from unauthorized access, misuse, or disclosure. However, no online system can guarantee absolute security.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="changes">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                11. Changes to This Policy
              </h2>
              <div className="space-y-4">
                <p>We may update this Privacy Policy from time to time. When updates occur, the effective date at the top of this document will be updated. Continued use of the platform after such updates indicates acceptance of the revised policy.</p>
              </div>
            </section>

            <section className="scroll-mt-24" id="contact">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                12. Contact Information
              </h2>
              <div className="space-y-4">
                <p>If you have any questions regarding this Privacy Policy or the handling of your information, you may contact us at:</p>
                <p className="font-semibold">Email: <a href="mailto:support@artikin.com" className="text-blue-600 hover:underline">support@artikin.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default PrivacyPolicy;
