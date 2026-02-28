import { useState } from "react";
import { useRouter } from "next/router";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";
import Select from "@/components/Select";

enum SignupStep {
  Start = 1,
  Profile = 4,
  Safety = 5,
}

const studyOptions = ["School", "University", "College", "Other"];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>(SignupStep.Start);
  const [name, setName] = useState("");
  const [studyType, setStudyType] = useState(studyOptions[0]);

  function continueToProfile() {
    setStep(SignupStep.Profile);
  }

  function saveProfileAndContinue() {
    localStorage.setItem(
      "tracex:onboarding",
      JSON.stringify({
        name,
        studyType,
      }),
    );
    setStep(SignupStep.Safety);
  }

  function acceptAndOpenTheme() {
    router.push("/theme");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg">
        {step === SignupStep.Start && (
          <>
            <h1 className="text-center text-4xl font-bold mb-6">
              Welcome to <span className="text-cyan-400">TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-10">Your ultimate study companion</p>

            <div className="flex flex-col gap-3">
              <Button onClick={continueToProfile}>Continue with Email</Button>
              <Button variant="secondary" onClick={continueToProfile}>
                Continue with Phone
              </Button>
              <Button variant="secondary" onClick={continueToProfile}>
                Continue with Apple
              </Button>
              <Button variant="secondary" onClick={continueToProfile}>
                Continue with Facebook
              </Button>
              <p className="text-center mt-4 cursor-pointer text-slate-400" onClick={continueToProfile}>
                Create a full TraceX account
              </p>
            </div>
          </>
        )}

        {step === SignupStep.Profile && (
          <SectionCard title="Profile Details" description="Tell us about yourself">
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />

            <label className="mt-4 mb-2 block text-sm text-slate-300">Where are you studying?</label>
            <Select
              className="w-full rounded-lg px-4 py-2 bg-slate-900 border border-slate-700 text-white"
              value={studyType}
              onChange={(e) => setStudyType(e.target.value)}
            >
              {studyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <Button className="mt-4" disabled={!name.trim()} onClick={saveProfileAndContinue}>
              Continue
            </Button>
          </SectionCard>
        )}

        {step === SignupStep.Safety && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">
              No harmful, abusive, or vulgar content. Violations lead to immediate suspension.
            </p>

            <Button className="mt-4" onClick={acceptAndOpenTheme}>
              I Accept
            </Button>
          </SectionCard>
        )}
      </div>
    </div>
  );
}