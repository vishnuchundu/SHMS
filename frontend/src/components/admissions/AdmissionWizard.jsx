import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UploadCloud, CheckCircle, FileText, ArrowRight, ArrowLeft, User, KeyRound, Copy, CheckCheck } from 'lucide-react';
import api from '../../api/axiosInstance';
import { Loader } from '../Loader';

// Structural schemas isolating constraints globally
const step1Schema = z.object({
  studentName: z.string().min(3, "Applicant Name must span at minimum 3 characters."),
  roomType: z.enum(['SINGLE', 'TWIN'], { required_error: "Room Type Preference is strictly obligated for DB query limits." })
});

const step2Schema = z.object({
  photoFilePath: z.string().min(1, "A photograph file must be structurally uploaded."),
});

export const AdmissionWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [allotmentPdfBase64, setAllotmentPdfBase64] = useState(null);
  const [credentials, setCredentials] = useState(null); // { username, password }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [copied, setCopied]   = useState({ user: false, pass: false });

  // Separate validation contexts explicitly tracking linear mappings
  const form1 = useForm({ resolver: zodResolver(step1Schema) });
  const form2 = useForm({ resolver: zodResolver(step2Schema) });

  const onStep1Next = (data) => {
    setCurrentStep(2);
  };

  const handleSimulatedDrop = (e) => {
    e.preventDefault();
    // Dynamically mocks explicit structural file variables
    form2.setValue("photoFilePath", "simulated_s3_path/photo_" + Date.now() + ".jpg", { shouldValidate: true });
  };

  const onFinalSubmit = async (data) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const payload = {
        studentName: form1.getValues().studentName,
        roomType: form1.getValues().roomType,
        photoFilePath: data.photoFilePath,
      };
      const response = await api.post('/api/admissions/register', payload);
      setAllotmentPdfBase64(response.data.allotmentLetterBase64);
      setCredentials({
        username: response.data.generatedUsername,
        password: response.data.defaultPassword,
      });
      setCurrentStep(3); // Show credentials first
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Backend Allocation Exception: Validate DB constraint arrays.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied((p) => ({ ...p, [key]: true }));
    setTimeout(() => setCopied((p) => ({ ...p, [key]: false })), 2000);
  };

  // Step 3: Credentials Panel
  if (currentStep === 3 && credentials) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-primary">Admission Authorized!</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Hand these credentials to <span className="font-black text-primary">{form1.getValues().studentName}</span>. They will be asked to change their password on first login.</p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-4">
          {/* Username */}
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><User size={18} className="text-primary" /></div>
              <div>
                <p className="text-xs text-gray-400 font-bold tracking-widest">USERNAME</p>
                <p className="font-black text-primary text-lg">{credentials.username}</p>
              </div>
            </div>
            <button onClick={() => copyToClipboard(credentials.username, 'user')} className="text-gray-400 hover:text-primary transition p-2">
              {copied.user ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10"><KeyRound size={18} className="text-accent" /></div>
              <div>
                <p className="text-xs text-gray-400 font-bold tracking-widest">TEMPORARY PASSWORD</p>
                <p className="font-black text-accent text-lg font-mono">{credentials.password}</p>
              </div>
            </div>
            <button onClick={() => copyToClipboard(credentials.password, 'pass')} className="text-gray-400 hover:text-accent transition p-2">
              {copied.pass ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4 font-medium">⚠ This password is shown only once. Please record it securely or provide it directly to the student.</p>

        <div className="mt-6 flex gap-3">
          <button onClick={() => setCurrentStep(4)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-md">
            View Allotment Letter PDF
          </button>
          <button onClick={() => window.location.reload()} className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">
            Admit Another
          </button>
        </div>
      </div>
    );
  }

  // Step 4: PDF viewer
  if (currentStep === 4 && allotmentPdfBase64) {
    return (
      <div className="flex flex-col h-[70vh] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
        <div className="bg-green-500 text-white p-4 flex items-center justify-center gap-2 font-bold select-none border-b border-green-600">
          <CheckCircle className="animate-bounce" />
          <span>Allotment Letter — {form1.getValues().studentName}</span>
        </div>
        <iframe
          src={`data:application/pdf;base64,${allotmentPdfBase64}`}
          className="w-full flex-1 border-none"
          title="Allotment Letter"
        />
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end">
           <button
             onClick={() => window.location.reload()}
             className="px-6 py-2 bg-primary text-white font-bold rounded shadow-sm hover:bg-gray-800 transition"
           >
             Admit Another Student
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      
      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-8 select-none">
        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-100'}`}>1</div>
          <span className="font-bold text-sm uppercase tracking-wide">Applicant</span>
        </div>
        <div className="flex-1 h-1 mx-4 bg-gray-100 rounded">
          <div className={`h-full bg-primary rounded transition-all w-${currentStep >= 2 ? 'full' : '0'}`}></div>
        </div>
        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-100'}`}>2</div>
          <span className="font-bold text-sm uppercase tracking-wide">Documents</span>
        </div>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-danger/10 border-l-4 border-danger rounded">
          <p className="text-danger font-bold text-sm">{globalError}</p>
        </div>
      )}

      {/* STEP 1: Applicant Details */}
      {currentStep === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1Next)} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div>
            <label className="block text-sm font-bold text-gray-700 tracking-wide mb-2">Student Full Name</label>
            <input
              {...form1.register("studentName")}
              className={`w-full p-4 border rounded-xl outline-none transition focus:ring-2 ${form1.formState.errors.studentName ? 'border-danger focus:ring-danger' : 'border-gray-300 focus:ring-primary'}`}
              placeholder="Enter exact matched credentials..."
            />
            {form1.formState.errors.studentName && <span className="text-danger text-xs font-bold mt-2 block">{form1.formState.errors.studentName.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 tracking-wide mb-2">Room Type Preference</label>
            <select
              {...form1.register("roomType")}
              className={`w-full p-4 border rounded-xl outline-none transition focus:ring-2 appearance-none ${form1.formState.errors.roomType ? 'border-danger focus:ring-danger' : 'border-gray-300 focus:ring-primary'}`}
            >
              <option value="" disabled selected>Select an explicit occupancy configuration...</option>
              <option value="SINGLE">SINGLE Occupancy (Strict Privacy Constraint)</option>
              <option value="TWIN">TWIN Occupancy (Mapped Dual Boundaries)</option>
            </select>
            {form1.formState.errors.roomType && <span className="text-danger text-xs font-bold mt-2 block">{form1.formState.errors.roomType.message}</span>}
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-md">
              Proceed <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Simulated File Upload */}
      {currentStep === 2 && (
        <form onSubmit={form2.handleSubmit(onFinalSubmit)} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          
          <div 
             onDragOver={(e) => e.preventDefault()} 
             onDrop={handleSimulatedDrop}
             className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${form2.watch("photoFilePath") ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
             onClick={(e) => handleSimulatedDrop(e)} // Click simulates drop for UI testing natively
          >
             {form2.watch("photoFilePath") ? (
                <>
                  <FileText className="w-16 h-16 text-green-500 mb-4" />
                  <p className="font-bold text-green-700">Payload Masked Successfully!</p>
                  <p className="text-xs text-green-600 mt-1">{form2.getValues("photoFilePath")}</p>
                </>
             ) : (
                <>
                  <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="font-bold text-gray-600">Drag & Drop Identical Photograph</p>
                  <p className="text-sm text-gray-400 mt-1">(Or click to instantly simulate backend chunk loading)</p>
                </>
             )}
          </div>
          {form2.formState.errors.photoFilePath && <span className="text-danger text-center text-xs font-bold mt-2 block">{form2.formState.errors.photoFilePath.message}</span>}

          <div className="flex justify-between pt-4">
            <button type="button" onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">
              <ArrowLeft size={18} /> Back
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-orange-600 transition shadow-md disabled:opacity-50">
              {isSubmitting ? "Allocating Boundary..." : "Execute Allotment"} <CheckCircle size={18} />
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
