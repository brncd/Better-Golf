import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';
import type { MatchPlayBracket, Match, BracketSetup, RoundAdvancement } from '@/types/matchPlay';

// Query Keys
export const matchPlayKeys = {
  all: ['matchPlay'] as const,
  tournament: (tournamentId: string) => [...matchPlayKeys.all, 'tournament', tournamentId] as const,
  bracket: (bracketId: string) => [...matchPlayKeys.all, 'bracket', bracketId] as const,
  match: (matchId: string) => [...matchPlayKeys.all, 'match', matchId] as const,
};

// Mock service functions (to be replaced with actual API calls)
const matchPlayService = {
  getBracket: async (tournamentId: string): Promise<MatchPlayBracket | null> => {
    // Match Play functionality is not yet implemented in the API
    return null;
  },
  
  createBracket: async (setup: BracketSetup): Promise<MatchPlayBracket> => {
    // Match Play functionality is not yet implemented in the API
    return Promise.reject(new Error('Match Play bracket creation is not yet available. This feature is coming soon.'));
  },
  
  updateMatch: async (matchId: string, score: any): Promise<Match> => {
    // Match Play functionality is not yet implemented in the API
    return Promise.reject(new Error('Match result updates are not yet available. This feature is coming soon.'));
  },
  
  advanceRound: async (bracketId: string, advancement: RoundAdvancement): Promise<MatchPlayBracket> => {
    // Match Play functionality is not yet implemented in the API
    return Promise.reject(new Error('Round advancement is not yet available. This feature is coming soon.'));
  },
};

// Get Match Play bracket for tournament
export const useMatchPlayBracket = (tournamentId: string) => {
  return useQuery({
    queryKey: matchPlayKeys.tournament(tournamentId),
    queryFn: () => matchPlayService.getBracket(tournamentId),
    enabled: !!tournamentId,
  });
};

// Create Match Play bracket
export const useCreateMatchPlayBracket = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useCreateMatchPlayBracket' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: (setup: BracketSetup) => matchPlayService.createBracket(setup),
    onSuccess: (bracket) => {
      // Invalidate tournament brackets
      queryClient.invalidateQueries({ queryKey: matchPlayKeys.tournament(bracket.tournamentId) });
      
      toast({
        title: "Bracket Created",
        description: `Match Play bracket "${bracket.name}" has been created successfully.`,
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to create Match Play bracket');
      toast({
        title: "Creation Failed",
        description: "Failed to create Match Play bracket. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update match result
export const useUpdateMatch = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUpdateMatch' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ matchId, score }: { matchId: string; score: any }) => 
      matchPlayService.updateMatch(matchId, score),
    onSuccess: (match) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: matchPlayKeys.match(match.id) });
      queryClient.invalidateQueries({ queryKey: matchPlayKeys.bracket(match.bracketId) });
      
      toast({
        title: "Match Updated",
        description: "Match result has been recorded successfully.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to update match');
      toast({
        title: "Update Failed",
        description: "Failed to update match result. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Advance to next round
export const useAdvanceRound = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useAdvanceRound' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ bracketId, advancement }: { bracketId: string; advancement: RoundAdvancement }) =>
      matchPlayService.advanceRound(bracketId, advancement),
    onSuccess: (bracket) => {
      // Invalidate bracket queries
      queryClient.invalidateQueries({ queryKey: matchPlayKeys.bracket(bracket.id) });
      queryClient.invalidateQueries({ queryKey: matchPlayKeys.tournament(bracket.tournamentId) });
      
      toast({
        title: "Round Advanced",
        description: `Advanced to Round ${bracket.currentRound + 1}.`,
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to advance round');
      toast({
        title: "Advancement Failed",
        description: "Failed to advance to next round. Please try again.",
        variant: "destructive",
      });
    },
  });
};
