import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ApplicationForm = () => {
  return (
    <div id="apply" className="bg-slate-50 p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-sm">
      <h3 className="text-3xl font-bold text-slate-900 mb-8">Apply for this position</h3>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" required placeholder="John Doe" className="rounded-xl h-12 bg-white border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" required type="email" placeholder="john@example.com" className="rounded-xl h-12 bg-white border-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" required type="tel" placeholder="+1 (555) 000-0000" className="rounded-xl h-12 bg-white border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="college">College / University *</Label>
            <Input id="college" required placeholder="University Name" className="rounded-xl h-12 bg-white border-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
            <Input id="linkedin" required placeholder="https://linkedin.com/in/..." className="rounded-xl h-12 bg-white border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL (Optional)</Label>
            <Input id="portfolio" placeholder="https://behance.net/..." className="rounded-xl h-12 bg-white border-slate-200" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume">Resume / CV (PDF) <span className="text-red-500">*</span></Label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white hover:border-primary/30 transition-colors cursor-pointer">
            <p className="text-slate-400 font-bold">Click to upload or drag and drop</p>
          </div>
          <input type="file" id="resume" required className="hidden" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Why join Artikin? <span className="text-red-500">*</span></Label>
          <Textarea id="message" required placeholder="Tell us what excites you about Artikin..." className="rounded-xl min-h-[150px] bg-white border-slate-200" />
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20 transition-all">
          Submit Application
        </Button>
      </form>
    </div>
  );
};

export default ApplicationForm;
