import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, FileText } from "lucide-react";

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50 pb-20">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center transform transition-all border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-green-50 p-5 shadow-inner border border-green-100">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">Payment Successful!</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Your appointment has been successfully confirmed. A receipt has been sent to your email.
                </p>

                <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left border border-blue-100 shadow-sm">
                    <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-no-2 text-blue-500 mr-2" />
                        Next Steps
                    </h3>
                    <ul className="space-y-4 text-sm text-blue-800">
                        <li className="flex items-start">
                            <span className="w-2 h-2 mt-1.5 mr-3 rounded-full bg-blue-500 flex-shrink-0 shadow"></span>
                            Please arrive 15 minutes before your scheduled appointment time.
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 mt-1.5 mr-3 rounded-full bg-blue-500 flex-shrink-0 shadow"></span>
                            Bring your previous medical records if applicable.
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={() => navigate("/patient/dashboard")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center shadow-md hover:shadow-blue-500/30"
                    >
                        Go to Dashboard
                    </button>
                    <button 
                        onClick={() => navigate("/")}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center border border-gray-200"
                    >
                        Back to Home
                        <ArrowRight className="w-4 h-4 ml-2 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;