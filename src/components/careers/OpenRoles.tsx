import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    id: "eng-1",
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote / Bengaluru",
    type: "Full Time",
    experience: "5+ Years"
  },
  {
    id: "des-1",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full Time",
    experience: "3+ Years"
  },
  {
    id: "mkt-1",
    title: "Community Manager",
    department: "Marketing",
    location: "Mumbai",
    type: "Full Time",
    experience: "2+ Years"
  },
  {
    id: "ops-1",
    title: "Operations Associate",
    department: "Operations",
    location: "Bengaluru",
    type: "Internship",
    experience: "Fresher"
  }
];

const OpenRoles = () => {
  const [activeTab, setActiveTab] = useState("All");
  const departments = ["All", "Engineering", "Design", "Marketing", "Operations"];

  const filteredRoles = activeTab === "All" 
    ? roles 
    : roles.filter(role => role.department === activeTab);

  return (
    <section id="roles" className="py-24 bg-white px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">Open Roles</h2>
          <p className="text-[#0F172A]/60">Join our world-class team and build the future of creativity.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveTab(dept)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === dept 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRoles.map((role) => (
              <motion.div
                key={role.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Link 
                  to={`/careers/jobs/${role.id}`}
                  className="group block p-8 rounded-[32px] border border-slate-200/50 bg-white hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all border-transparent hover:border-primary/20"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-primary uppercase mb-2 block">{role.department}</span>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">{role.title}</h3>
                      <div className="flex flex-wrap gap-4 text-[#0F172A]/40 text-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {role.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {role.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <span className="text-slate-400 font-bold">{role.experience}</span>
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default OpenRoles;
