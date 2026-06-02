export enum SyncActionType {
  CREATE_SITE = 'CREATE_SITE',
  CREATE_RESELLER = 'CREATE_RESELLER',
  VISIT_SITE = 'VISIT_SITE'
}

export const offlineService = {
  queueAction: async (type: SyncActionType, data: any) => {
    console.log(`[Offline] Queued action ${type}`, data);
    const queue = JSON.parse(localStorage.getItem('sorepco_sync_queue') || '[]');
    queue.push({ type, data, timestamp: Date.now() });
    localStorage.setItem('sorepco_sync_queue', JSON.stringify(queue));
  },
  getQueue: () => {
    return JSON.parse(localStorage.getItem('sorepco_sync_queue') || '[]');
  },
  clearQueue: () => {
    localStorage.removeItem('sorepco_sync_queue');
  }
};
