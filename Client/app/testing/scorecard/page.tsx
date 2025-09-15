"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout"
import { useAuth } from "@/context/AuthContext";
import { ScorecardTester } from "@/components/testing/ScorecardTester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TestTube } from "lucide-react";

export default function ScorecardTestPage() {
  const { user } = useAuth();
  const [showScorecard, setShowScorecard] = useState(false)
  const [showTester, setShowTester] = useState(false)
  const tournamentId = "1"

  return (
    <MainLayout user={user}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <TestTube className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Scorecard Testing</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Development Testing Page</h3>
              <p className="mt-1 text-sm text-yellow-700">
                This page is for testing scorecard functionality during development. 
                It will be removed in production.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => setShowTester(!showTester)}
            variant={showTester ? "secondary" : "default"}
          >
            {showTester ? "Hide" : "Show"} Scorecard Tester
          </Button>
        </div>

        {showTester && (
          <ScorecardTester tournamentId={parseInt(tournamentId)} />
        )}
      </div>
    </MainLayout>
  );
}