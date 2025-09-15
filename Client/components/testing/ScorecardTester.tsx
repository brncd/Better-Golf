"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { 
  useTournamentScorecards, 
  useScorecard, 
  useCreateScorecard, 
  useUpdateScorecard 
} from "@/hooks/useScorecardService";
import { useCreateScorecard as useCreateScorecardOld, useUpdateScorecard as useUpdateScorecardOld } from "@/hooks/useScorecards";
import { ScorecardPostDTO, ScorecardResultPostDTO } from "@/types";
import { TestTube, Play, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScorecardTesterProps {
  tournamentId: number;
}

export function ScorecardTester({ tournamentId }: ScorecardTesterProps) {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testPlayerId, setTestPlayerId] = useState<string>("1");
  const [testHandicap, setTestHandicap] = useState<string>("18");
  const [isRunningTests, setIsRunningTests] = useState(false);

  const { toast } = useToast();
  
  // Test queries
  const { data: scorecards, isLoading: scorecardsLoading, error: scorecardsError } = useTournamentScorecards(tournamentId);
  const { data: singleScorecard, isLoading: singleLoading } = useScorecard(scorecards?.items?.[0]?.id || 0);
  
  // Test mutations
  const createScorecardMutation = useCreateScorecard();
  const updateScorecardMutation = useUpdateScorecard();
  
  // Old hooks for comparison
  const createScorecardOldMutation = useCreateScorecardOld();
  const updateScorecardOldMutation = useUpdateScorecardOld();

  const updateTestResult = (testName: string, result: 'success' | 'error') => {
    setTestResults(prev => ({ ...prev, [testName]: result }));
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults({});

    // Test 1: Fetch tournament scorecards
    try {
      setTestResults(prev => ({ ...prev, 'fetch-scorecards': 'pending' }));
      if (scorecardsError) {
        throw new Error('Failed to fetch scorecards');
      }
      updateTestResult('fetch-scorecards', 'success');
    } catch (error) {
      updateTestResult('fetch-scorecards', 'error');
    }

    // Test 2: Create new scorecard
    try {
      setTestResults(prev => ({ ...prev, 'create-scorecard': 'pending' }));
      
      const testScorecard: ScorecardPostDTO = {
        playerId: parseInt(testPlayerId),
        tournamentId,
        playingHandicap: parseInt(testHandicap),
        scorecardResults: [
          { holeId: 1, strokes: 4, roundNumber: 1 },
          { holeId: 2, strokes: 5, roundNumber: 1 },
          { holeId: 3, strokes: 3, roundNumber: 1 },
        ]
      };

      await createScorecardMutation.mutateAsync(testScorecard);
      updateTestResult('create-scorecard', 'success');
    } catch (error) {
      updateTestResult('create-scorecard', 'error');
      console.error('Create scorecard test failed:', error);
    }

    // Test 3: Compare old vs new hooks
    try {
      setTestResults(prev => ({ ...prev, 'hooks-comparison': 'pending' }));
      
      // Test that both hooks exist and are callable
      if (typeof createScorecardOldMutation.mutateAsync === 'function' && 
          typeof updateScorecardOldMutation.mutateAsync === 'function') {
        updateTestResult('hooks-comparison', 'success');
      } else {
        throw new Error('Old hooks not properly implemented');
      }
    } catch (error) {
      updateTestResult('hooks-comparison', 'error');
    }

    setIsRunningTests(false);
    
    toast({
      title: "Tests Completed",
      description: "Scorecard API integration tests have finished running.",
    });
  };

  const getTestIcon = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'pending':
        return <LoadingSpinner className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTestBadge = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Running</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="outline">Not Run</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Scorecard API Integration Tester
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test scorecard functionality with real API endpoints
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testPlayerId">Test Player ID</Label>
              <Input
                id="testPlayerId"
                value={testPlayerId}
                onChange={(e) => setTestPlayerId(e.target.value)}
                placeholder="Enter player ID"
              />
            </div>
            <div>
              <Label htmlFor="testHandicap">Test Handicap</Label>
              <Input
                id="testHandicap"
                value={testHandicap}
                onChange={(e) => setTestHandicap(e.target.value)}
                placeholder="Enter handicap"
              />
            </div>
          </div>

          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests}
            className="w-full flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test 1: Fetch Scorecards */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults['fetch-scorecards'])}
              <div>
                <p className="font-medium">Fetch Tournament Scorecards</p>
                <p className="text-sm text-muted-foreground">
                  GET /api/Scorecards/Tournament/{tournamentId}
                </p>
              </div>
            </div>
            {getTestBadge(testResults['fetch-scorecards'])}
          </div>

          {/* Test 2: Create Scorecard */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults['create-scorecard'])}
              <div>
                <p className="font-medium">Create New Scorecard</p>
                <p className="text-sm text-muted-foreground">
                  POST /api/Scorecards
                </p>
              </div>
            </div>
            {getTestBadge(testResults['create-scorecard'])}
          </div>

          {/* Test 3: Hooks Comparison */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults['hooks-comparison'])}
              <div>
                <p className="font-medium">Hooks Integration</p>
                <p className="text-sm text-muted-foreground">
                  Compare old vs new scorecard hooks
                </p>
              </div>
            </div>
            {getTestBadge(testResults['hooks-comparison'])}
          </div>
        </CardContent>
      </Card>

      {/* API Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Live API Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Tournament Scorecards</h4>
            {scorecardsLoading ? (
              <LoadingSpinner />
            ) : scorecardsError ? (
              <p className="text-red-500">Error: {scorecardsError.message}</p>
            ) : scorecards ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Found {scorecards.totalCount} scorecards (Page {scorecards.pageNumber} of {scorecards.totalPages})
                </p>
                {scorecards.items.map((scorecard) => (
                  <div key={scorecard.id} className="p-2 bg-muted rounded">
                    <p className="text-sm">
                      <strong>Player:</strong> {scorecard.playerName} | 
                      <strong> Round:</strong> {scorecard.roundNumber} | 
                      <strong> Strokes:</strong> {scorecard.totalStrokes} |
                      <strong> Locked:</strong> {scorecard.isLocked ? 'Yes' : 'No'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Single Scorecard Details</h4>
            {singleLoading ? (
              <LoadingSpinner />
            ) : singleScorecard ? (
              <div className="p-2 bg-muted rounded">
                <p className="text-sm">
                  <strong>ID:</strong> {singleScorecard.id} | 
                  <strong> Handicap:</strong> {singleScorecard.playingHandicap} | 
                  <strong> Total Strokes:</strong> {singleScorecard.totalStrokes} |
                  <strong> Results:</strong> {singleScorecard.scorecardResults.length} holes
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No scorecard selected</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
