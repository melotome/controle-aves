
import { User, EggRecord, UserRole, AppSheetConfig } from '../types';

const STORAGE_KEYS = {
  RECORDS: 'agro_geral_records',
  USERS: 'agro_geral_users',
  CURRENT_USER: 'agro_geral_session',
  APPSHEET_CONFIG: 'agro_geral_appsheet'
};

const DEFAULT_ADMIN: User = {
  id: 'admin-0',
  username: 'admin',
  password: '123',
  name: 'Administrador Geral',
  role: UserRole.ADMIN
};

const TIAGO_ADMIN: User = {
  id: 'admin-tiago',
  username: 'tiago',
  password: '123',
  name: 'Tiago',
  role: UserRole.ADMIN
};

export const DataService = {
  // --- CONFIG METHODS ---
  getAppSheetConfig: (): AppSheetConfig => {
    const data = localStorage.getItem(STORAGE_KEYS.APPSHEET_CONFIG);
    return data ? JSON.parse(data) : { appId: '', accessKey: '', tableName: 'Records', isEnabled: true };
  },

  setAppSheetConfig: (config: AppSheetConfig): void => {
    localStorage.setItem(STORAGE_KEYS.APPSHEET_CONFIG, JSON.stringify(config));
  },

  // --- USER METHODS ---
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      const initial = [DEFAULT_ADMIN, TIAGO_ADMIN];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveUser: (user: User): void => {
    const users = DataService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  deleteUser: (userId: string): boolean => {
    if (userId === 'admin-0' || userId === 'admin-tiago') return false; 
    const users = DataService.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // --- RECORD METHODS ---
  getRecords: (): EggRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },

  addRecord: async (record: Omit<EggRecord, 'postureRate' | 'lossRate' | 'totalFeed'>): Promise<void> => {
    const totalFeed = record.feedAm + record.feedPm;
    const postureRate = (record.totalEggs / record.birdCount) * 100;
    const lossRate = record.totalEggs > 0 ? (record.brokenEggs / record.totalEggs) * 100 : 0;

    const fullRecord: EggRecord = {
      ...record,
      postureRate,
      lossRate,
      totalFeed,
      synced: false
    };

    const records = DataService.getRecords();
    records.push(fullRecord);
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));

    const config = DataService.getAppSheetConfig();
    if (config.isEnabled && config.appId && config.accessKey) {
      try {
        await DataService.syncToAppSheet(fullRecord, config);
        DataService.markAsSynced(fullRecord.id);
      } catch (err: any) {
        console.error("AppSheet Sync Error:", err.message);
      }
    }
  },

  markAsSynced: (id: string) => {
    const records = DataService.getRecords();
    const idx = records.findIndex(r => r.id === id);
    if (idx > -1) {
      records[idx].synced = true;
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    }
  },

  syncAllRecords: async (): Promise<{ success: number; failed: number }> => {
    const config = DataService.getAppSheetConfig();
    if (!config.appId || !config.accessKey) throw new Error("Configurações da API ausentes.");

    const records = DataService.getRecords();
    const toSync = records.filter(r => !r.synced);
    let success = 0;
    let failed = 0;

    for (const record of toSync) {
      try {
        await DataService.syncToAppSheet(record, config);
        DataService.markAsSynced(record.id);
        success++;
      } catch (err: any) {
        failed++;
        console.error(`Falha no registro ${record.id}:`, err.message);
      }
    }
    return { success, failed };
  },

  syncToAppSheet: async (record: EggRecord, config: AppSheetConfig) => {
    // Importante: encodeURIComponent para tratar nomes de tabela com espaços ou acentos
    const tablePath = encodeURIComponent(config.tableName);
    const url = `https://api.appsheet.com/api/v2/apps/${config.appId}/tables/${tablePath}/Action`;
    
    const body = {
      Action: "Add",
      Properties: {
        Locale: "pt-BR",
        Timezone: "E. South America Standard Time"
      },
      Rows: [{
        "ID": record.id,
        "Date": record.date,
        "BirdCount": record.birdCount,
        "TotalEggs": record.totalEggs,
        "BrokenEggs": record.brokenEggs,
        "FeedAM": record.feedAm,
        "FeedPM": record.feedPm,
        "Responsible": record.responsible,
        "Notes": record.notes || "",
        "PostureRate": parseFloat(record.postureRate.toFixed(2)),
        "LossRate": parseFloat(record.lossRate.toFixed(2)),
        "TotalFeed": parseFloat(record.totalFeed.toFixed(2))
      }]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'ApplicationAccessKey': config.accessKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      // Se a resposta HTTP for erro (4xx ou 5xx)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result?.RestApiResponse || result?.Error || 'Erro de conexão'}`);
      }

      // Tratamento específico de erros retornados pelo AppSheet dentro do JSON
      if (result && typeof result === 'object') {
        // AppSheet às vezes retorna erro em campos específicos
        const error = result.RestApiResponse || result.Error;
        if (error) {
          throw new Error(`AppSheet diz: ${error}`);
        }

        // Se o resultado for uma lista vazia, geralmente significa que o ID já existe ou as colunas não batem
        if (Array.isArray(result) && result.length === 0) {
           throw new Error("A API retornou uma lista vazia. Verifique se o ID já existe na planilha ou se os nomes das colunas estão corretos (ID, Date, BirdCount, etc).");
        }
      }

      return result;
    } catch (err: any) {
      // Repassa o erro para ser capturado no loop ou no formulário
      throw new Error(err.message || "Erro desconhecido na comunicação com AppSheet");
    }
  },

  deleteRecord: (id: string): void => {
    const records = DataService.getRecords().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }
};
