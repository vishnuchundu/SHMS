import { AdmissionWizard } from '../components/admissions/AdmissionWizard';

export const AdmissionsPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Title Header mapped strictly */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
         <h1 className="text-3xl font-extrabold text-primary tracking-tight">Hall Admissions Wizard</h1>
         <p className="text-gray-500 font-medium mt-1">
           Execute linear applicant pipelines. Allotments are calculated dynamically utilizing remaining visual grids natively pushing strictly generated explicit OpenPDF arrays completely securely.
         </p>
      </div>

      <AdmissionWizard />

    </div>
  );
};
