// app/services/bible/meditationJournalService.ts
import { firebaseSyncService } from '../firebase/firebaseSyncService';

export interface MeditationEntry {
  id: string;
  date: string;
  durationSeconds: number;
  verse?: { text: string; reference: string };
  note?: string;
  mood?: string; // 'calm', 'grateful', etc. (pour le futur)
}

class MeditationJournalService {
  private readonly COLLECTION = 'meditationJournal';

  async getEntries(userId: string): Promise<MeditationEntry[]> {
    try {
      const data = await firebaseSyncService.syncRead<{ entries: MeditationEntry[] }>(
        userId,
        this.COLLECTION,
        'history',
        { entries: [] }
      );
      return data?.entries || [];
    } catch (error) {
      console.error('Failed to get meditation journal:', error);
      return [];
    }
  }

  async addEntry(userId: string, entry: Omit<MeditationEntry, 'id'>): Promise<void> {
    try {
      const entries = await this.getEntries(userId);
      
      const newEntry: MeditationEntry = {
        ...entry,
        id: Date.now().toString(),
      };

      // Ajout au début (plus récent en premier)
      const updatedEntries = [newEntry, ...entries];

      await firebaseSyncService.syncWrite(
        userId,
        this.COLLECTION,
        'history',
        { entries: updatedEntries },
        { immediate: true, merge: false } // Force l'écriture pour ne pas perdre la pensée
      );
    } catch (error) {
      console.error('Failed to add meditation entry:', error);
    }
  }
}

export const meditationJournalService = new MeditationJournalService();
