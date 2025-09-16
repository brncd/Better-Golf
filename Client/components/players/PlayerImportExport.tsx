'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, FileText, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { usePlayers, useCreatePlayer } from '@/hooks/usePlayers';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import type { PlayerPostDTO } from '@/types';

interface PlayerImportExportProps {
  onImportComplete?: (count: number) => void;
}

interface ImportResult {
  success: number;
  errors: string[];
  duplicates: number;
}

export function PlayerImportExport({ onImportComplete }: PlayerImportExportProps = {}) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: playersData } = usePlayers();
  const createPlayerMutation = useCreatePlayer();
  const { toast } = useToast();

  const players = playersData?.items || [];

  // CSV Template for download
  const csvTemplate = [
    'firstName,lastName,email,handicap,gender,dateOfBirth,phoneNumber,membershipNumber',
    'John,Doe,john.doe@example.com,15,Male,1985-06-15,+1234567890,M001',
    'Jane,Smith,jane.smith@example.com,8,Female,1990-03-22,+1234567891,M002'
  ].join('\n');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      setImportResult(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (csvText: string): PlayerPostDTO[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const requiredHeaders = ['firstName', 'lastName', 'email', 'handicap', 'gender', 'dateOfBirth', 'phoneNumber', 'membershipNumber'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const players: PlayerPostDTO[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;
      
      const player: any = {};
      headers.forEach((header, index) => {
        player[header] = values[index];
      });
      
      // Convert handicap to number
      player.handicap = parseFloat(player.handicap) || 0;
      
      // Validate required fields
      if (player.firstName && player.lastName && player.email) {
        players.push(player as PlayerPostDTO);
      }
    }
    
    return players;
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      const csvText = await importFile.text();
      const playersToImport = parseCSV(csvText);
      
      const result: ImportResult = {
        success: 0,
        errors: [],
        duplicates: 0
      };

      // Check for existing emails
      const existingEmails = new Set(players.map((p: any) => p.email.toLowerCase()));
      
      for (let i = 0; i < playersToImport.length; i++) {
        const player = playersToImport[i];
        setImportProgress(((i + 1) / playersToImport.length) * 100);
        
        try {
          // Check for duplicates
          if (existingEmails.has(player.email.toLowerCase())) {
            result.duplicates++;
            continue;
          }
          
          await createPlayerMutation.mutateAsync(player);
          result.success++;
          existingEmails.add(player.email.toLowerCase());
          
          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          result.errors.push(`${player.firstName} ${player.lastName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResult(result);
      onImportComplete?.(result.success);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.success} players.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import players.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const csvHeaders = 'firstName,lastName,email,handicap,gender,dateOfBirth,phoneNumber,membershipNumber';
      const csvRows = players.map((player: any) => [
        player.firstName,
        player.lastName,
        player.email,
        player.handicap,
        player.gender,
        player.dateOfBirth,
        player.phoneNumber,
        player.membershipNumber
      ].join(','));
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `players-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Exported ${players.length} players to CSV file.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export players.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'player-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded.",
    });
  };

  return (
    <div className="flex gap-2">
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Players from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Upload a CSV file with player information. Make sure it includes all required columns.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isImporting}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>

            {importFile && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium">{importFile.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(importFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
            )}

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Importing players...</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            {importResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {importResult.success} players imported successfully
                  </span>
                </div>
                
                {importResult.duplicates > 0 && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {importResult.duplicates} duplicates skipped
                    </span>
                  </div>
                )}
                
                {importResult.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {importResult.errors.length} errors occurred
                      </span>
                    </div>
                    <div className="max-h-20 overflow-y-auto text-xs text-muted-foreground">
                      {importResult.errors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!importFile || isImporting}
              >
                {isImporting ? 'Importing...' : 'Import Players'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Players to CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Export all {players.length} players to a CSV file for backup or external use.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm font-medium mb-2">Export will include:</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Player names and contact information</li>
                <li>• Handicap and category data</li>
                <li>• Membership numbers</li>
                <li>• Registration dates</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={isExporting || players.length === 0}
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
