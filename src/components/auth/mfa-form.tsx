"use client";

import { useEffect, useState } from "react";
import { getMFAFactors, verifyMFA } from "@/actions/auth/mfa";
import { Factor } from "@supabase/auth-js";

import { FormError } from "@/components/auth/form-error";
import { CardWrapper } from "@/components/auth/card-wrapper";

import { CheckCircle, Smartphone } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export function MfaForm() {
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [selectedFactorId, setSelectedFactorId] = useState<string>("");
  const [loadingFactors, setLoadingFactors] = useState(true);

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    try {
      const result = await getMFAFactors();
      if (result.error) {
        setError(result.error);
        setFactors([]);
      } else {
        const totpFactors = result.factors;
        setFactors(totpFactors);

        // If there's only one factor, select it automatically
        if (totpFactors.length === 1) {
          setSelectedFactorId(totpFactors[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading MFA factors:", err);
      setError("Failed to load authentication devices");
    } finally {
      setLoadingFactors(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFactorId) {
      setError("Please select an authentication device");
      return;
    }

    if (verifyCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await verifyMFA({
        factorId: selectedFactorId,
        code: verifyCode,
      });

      if (result.error) {
        setError(result.error);
      } else {
        // MFA verified successfully, redirect to app
        window.location.href = "/app/";
      }
    } catch (err) {
      console.error("MFA verification error:", err);
      setError("Failed to verify MFA code");
    } finally {
      setLoading(false);
    }
  };

  if (loadingFactors) {
    return (
      <CardWrapper
        header="Confirm Your Identity"
        headerLabel="Loading authentication devices..."
        backButtonLabel="Back to Login"
        backButtonHref="/login"
      >
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CardWrapper>
    );
  }

  if (factors.length === 0) {
    return (
      <CardWrapper
        header="Confirm Your Identity"
        headerLabel="No authentication devices found"
        backButtonLabel="Return to Login"
        backButtonHref="/login"
      >
        <FormError
          message={"No authentication devices found. Please contact support."}
        />
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      header="Confirm Your Identity"
      headerLabel="Please enter the verification code from your authenticator app."
      backButtonLabel="Return to Login"
      backButtonHref="/login"
    >
      <form onSubmit={handleVerification} className="space-y-4">
        {error && <FormError message={error} />}

        {factors.length > 1 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Authentication Device
            </label>
            <div className="grid gap-3">
              {factors.map((factor) => (
                <button
                  key={factor.id}
                  type="button"
                  onClick={() => setSelectedFactorId(factor.id)}
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                    selectedFactorId === factor.id
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-gray-200 hover:border-primary hover:bg-gray-50"
                  }`}
                >
                  <Smartphone className="h-5 w-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">
                      {factor.friendly_name || "Authenticator Device"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Added on{" "}
                      {new Date(factor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedFactorId === factor.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            type="text"
            value={verifyCode}
            onChange={(e) =>
              setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            placeholder="Enter 6-digit code"
            maxLength={6}
            disabled={loading}
          />
          <p className="text-sm text-gray-500">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || verifyCode.length !== 6 || !selectedFactorId}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {loading ? <Spinner /> : "Verify"}
        </Button>
      </form>
    </CardWrapper>
  );
}
