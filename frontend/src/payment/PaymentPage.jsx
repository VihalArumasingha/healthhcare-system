import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPayment, confirmPayment } from "./paymentService";
import { CreditCard, ShieldCheck, Loader2 } from "lucide-react";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { appointmentId = "APT-DEMO", amount = 2000 } = location.state || {};

    const [paymentId, setPaymentId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const initPayment = async () => {
            try {
                const payloadAmount = amount || 2000;
                const payloadId = appointmentId === "APT-DEMO" ? null : appointmentId;

                if (payloadId) {
                    const res = await createPayment({
                        appointmentId: payloadId,
                        patientId: "patient123",
                        amount: payloadAmount,
                    });
                    setPaymentId(res.paymentId);
                } else {
                    // For demo purposes when navigating directly without state
                    setPaymentId("mock_payment_id");
                }
            } catch (err) {
                console.error("Payment initialization error:", err);
            } finally {
                setInitializing(false);
            }
        };

        if (appointmentId) initPayment();
    }, [appointmentId, amount]);

    const handlePayment = async () => {
        try {
            setLoading(true);

            if (appointmentId !== "APT-DEMO" && paymentId !== "mock_payment_id") {
                await confirmPayment({ paymentId });
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            navigate("/payment-success");
        } catch (err) {
            console.error(err);
            alert("Payment Failed. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Initializing secure payment...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 pb-20">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white text-center shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
                    
                    <div className="flex justify-center mb-6 relative z-10">
                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                            <CreditCard className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight relative z-10">Complete Payment</h2>
                    <p className="text-blue-100 mt-2 text-sm max-w-xs mx-auto relative z-10">
                        Secure checkout to confirm your upcoming consultation
                    </p>
                </div>
                
                <div className="p-8 md:p-10">
                    <div className="space-y-5 mb-10">
                        <div className="flex justify-between items-center pb-5 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Appointment Ref</span>
                            <span className="font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                {appointmentId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-5 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Consultation Fee</span>
                            <span className="font-semibold text-gray-800">LKR {amount}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3">
                            <span className="text-lg font-medium text-gray-800">Total to Pay</span>
                            <span className="text-3xl font-extrabold text-blue-600">LKR {amount}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePayment} 
                        disabled={loading || !paymentId}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all transform active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                Processing Payment...
                            </>
                        ) : (
                            "Pay Securely Now"
                        )}
                    </button>
                    
                    <div className="mt-8 flex items-center justify-center text-sm text-gray-500 bg-green-50 p-3 rounded-xl border border-green-100">
                        <ShieldCheck className="w-5 h-5 mr-no-2 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">256-bit encrypted secure transaction</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;