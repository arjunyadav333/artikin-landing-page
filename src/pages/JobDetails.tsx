import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import JobHero from "@/components/careers/JobHero";
import HiringTimeline from "@/components/careers/HiringTimeline";
import ApplicationForm from "@/components/careers/ApplicationForm";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const jobData = {
  "eng-1": {
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote / Bengaluru",
    type: "Full Time",
    meta: {
      "Employment Type": "Full Time / Permanent",
      "Duration": "Indefinite",
      "Salary": "Industry Standard",
      "Conversion": "N/A"
    },
    summary: "This role focuses on building high-performance, scalable, and user-friendly features for the Artikin global creator platform.",
    responsibilities: [
      "Develop high-scale UI components and layouts",
      "Implement responsive and accessible frontend designs",
      "Optimize overall platform performance and latency",
      "Collaborate with backend and product engineering teams"
    ],
    requirements: [
      "5+ years of experience with React, Node.js, and TypeScript.",
      "Experience with high-performance web applications.",
      "Passion for the creative industry and artist empowerment."
    ],
    perks: ["Equity Ownership", "Remote-First", "Health Coverage", "Studio Budget"]
  },
  "des-1": {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full Time",
    meta: {
      "Employment Type": "Full Time / Permanent",
      "Duration": "Indefinite",
      "Salary": "Industry Standard",
      "Conversion": "N/A"
    },
    summary: "This role focuses on creating intuitive, beautiful, and professional-grade user interfaces for Artikin's creative tool ecosystem.",
    responsibilities: [
      "Design end-to-end user flows and high-fidelity prototypes",
      "Maintain and evolve our central design system",
      "Conduct user research with professional artists",
      "Ensure pixel-perfect implementation with engineering teams"
    ],
    requirements: [
      "3+ years in product design for professional software.",
      "Expertise in Figma and motion design.",
      "Strong visual craft and systems thinking."
    ],
    perks: ["Creative Freedom", "Remote-First", "Wellness Budget", "Art Gear Allowance"]
  },
  "mkt-1": {
    title: "Community Manager",
    department: "Marketing",
    location: "Mumbai",
    type: "Internship",
    meta: {
      "Internship Type": "Remote / On-site",
      "Duration": "3 Months",
      "Stipend": "Performance Based",
      "Conversion": "Performance-based full-time opportunity"
    },
    summary: "This role focuses on engaging with the Artikin community, managing social channels, and amplifying creator voices.",
    responsibilities: [
      "Moderate and grow our digital community channels",
      "Draft community-focused content and newsletters",
      "Coordinate digital events and artist showcases",
      "Gather community feedback for the product team"
    ],
    requirements: [
      "Passion for digital art and the creator economy.",
      "Excellent communication and social media skills.",
      "Creative mindset and ability to multitask."
    ],
    perks: ["Direct Mentorship", "Mumbai Hub Access", "Skill Workshops", "Networking"]
  },
  "ops-1": {
    title: "Operations Associate",
    department: "Operations",
    location: "Bengaluru",
    type: "Internship",
    meta: {
      "Internship Type": "Remote / On-site",
      "Duration": "6 Months",
      "Stipend": "Industry Standard",
      "Conversion": "Performance-based full-time opportunity"
    },
    summary: "This role focuses on optimizing internal workflows, supporting recruitment, and ensuring operational excellence across Artikin.",
    responsibilities: [
      "Assist in streamlining internal communication and processes",
      "Support recruitment and onboarding activities",
      "Coordinate global team retreats and office events",
      "Manage administrative tasks for the creative hub"
    ],
    requirements: [
      "Strong organizational skills and attention to detail.",
      "Problem-solving mindset and pro-active attitude.",
      "Interest in high-growth startup operations."
    ],
    perks: ["Operational Insights", "Bengaluru Hub Access", "Team Offsites", "Stipend"]
  }
};

const JobDetails = () => {
  const { id } = useParams();
  const defaultJob = jobData[id as keyof typeof jobData] || jobData["eng-1"];
  const [job, setJob] = useState(defaultJob);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchJobDetail = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setJob({
            title: data.title || "",
            department: data.dept || data.department || "",
            location: data.loc || data.location || "",
            type: data.type || "",
            meta: data.meta || {
              "Employment Type": data.type || "",
              "Salary": data.info || "Industry Standard"
            },
            summary: data.summary || "",
            responsibilities: data.responsibilities || [],
            requirements: data.requirements || [],
            perks: data.perks || []
          });
        }
      } catch (err) {
        console.error("Error fetching job details from Firestore, using fallback:", err);
      }
    };
    fetchJobDetail();
  }, [id, defaultJob]);

  return (
    <div className="bg-white min-h-screen selection:bg-primary/10 text-slate-900">
      <Header isScrolled={true} />
      
      <main className="pt-20 pb-0">
        <JobHero 
          title={job.title} 
          department={job.department} 
          location={job.location} 
          type={job.type} 
        />

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-24">
              <Link to="/careers" className="inline-flex items-center gap-2 text-primary font-bold group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Opportunities
              </Link>

              <section>
                <h3 className="text-4xl font-bold mb-12 text-slate-900">Job Description</h3>
                <div className="space-y-8">
                  {Object.entries(job.meta).map(([key, value]) => (
                    <p key={key} className="text-2xl text-slate-600">
                      <span className="font-bold text-slate-900">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-3xl font-bold mb-12 text-slate-900 uppercase tracking-widest">Role Summary</h3>
                <p className="text-slate-600 text-2xl leading-relaxed font-medium">
                  {job.summary}
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-10 text-slate-900 uppercase tracking-widest">Key Responsibilities</h3>
                <ul className="space-y-6">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex gap-6 items-center text-slate-600 text-lg font-medium">
                      <div className="w-2 h-2 bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <div id="apply" className="pt-20 border-t border-slate-100">
                <ApplicationForm jobTitle={job.title} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-40 space-y-12">
                <div className="bg-slate-900 p-12 shadow-2xl relative overflow-hidden border border-slate-800">
                  <h4 className="text-xl font-bold mb-10 uppercase tracking-widest text-primary">Perks & Benefits</h4>
                  <ul className="space-y-5 mb-12">
                    {job.perks.map((perk, i) => (
                      <li key={i} className="flex gap-4 items-center text-slate-400 font-medium">
                        <div className="w-1.5 h-1.5 bg-primary" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white h-16 rounded-none font-bold text-lg uppercase tracking-widest"
                    onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Apply Now
                  </Button>
                </div>

                <div className="bg-slate-50 p-12 border border-slate-100">
                   <HiringTimeline />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetails;
