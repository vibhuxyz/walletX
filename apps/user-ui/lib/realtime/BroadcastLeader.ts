export class BroadcastLeader {
  private channelName: string;
  private channel: BroadcastChannel;
  private isLeader: boolean = false;
  private isElectionInProgress: boolean = false;
  private id: string;
  private onLeadershipChange: (isLeader: boolean) => void;
  public onMessage: (msg: any) => void;

  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private failoverTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    channelName: string,
    onLeadershipChange: (isLeader: boolean) => void,
    onMessage: (msg: any) => void
  ) {
    this.channelName = channelName;
    this.onLeadershipChange = onLeadershipChange;
    this.onMessage = onMessage;

    if (typeof window !== "undefined") {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = this.handleMessage.bind(this);
    } else {
      // Mock for SSR/Edge
      this.channel = {
        postMessage: () => {},
        close: () => {},
        onmessage: null,
      } as unknown as BroadcastChannel;
    }

    this.id = Math.random().toString(36).substring(2, 11);
    
    // Start election process
    this.startElection();
  }

  private handleMessage(event: MessageEvent) {
    const data = event.data;
    
    // Pass external signals to subscriber
    if (data.type === "WS_PAYLOAD" || data.type === "UI_SYNC") {
      this.onMessage(data);
      return;
    }

    if (data.type === "HEARTBEAT") {
      if (this.isLeader) {
        if (data.id > this.id) {
          // Relinquish leadership back to older/better tab
          this.demote();
        }
      } else {
        // Reset failover timer because leader is alive
        this.resetFailover();
      }
    }

    if (data.type === "ELECTION") {
      if (this.isLeader) {
        // Broadcast I am leader
        this.broadcastHeartbeat();
      } else if (data.id > this.id) {
        // Yield to better candidate
        this.demote();
      } else {
        // Challenge
        this.startElection();
      }
    }

    if (data.type === "RESIGN") {
      this.startElection();
    }
  }

  private startElection() {
    if (this.isLeader) return;
    this.isElectionInProgress = true;
    
    // Broadcast intent
    this.channel.postMessage({ type: "ELECTION", id: this.id });

    // Wait to see if anyone objects
    setTimeout(() => {
      if (this.isElectionInProgress) {
        this.promote();
      }
    }, 500); // Wait 500ms
  }

  private promote() {
    this.isElectionInProgress = false;
    this.isLeader = true;
    this.onLeadershipChange(true);
    
    // Start sending heartbeats every 2s
    this.heartbeatInterval = setInterval(() => this.broadcastHeartbeat(), 2000);
    this.clearFailover();
  }

  private demote() {
    this.isElectionInProgress = false;
    if (this.isLeader) {
      this.isLeader = false;
      this.onLeadershipChange(false);
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    }
    this.resetFailover();
  }

  private broadcastHeartbeat() {
    this.channel.postMessage({ type: "HEARTBEAT", id: this.id });
  }

  private resetFailover() {
    this.clearFailover();
    // Failover if no heartbeat within 5 seconds
    this.failoverTimeout = setTimeout(() => {
      this.startElection();
    }, 5000);
  }

  private clearFailover() {
    if (this.failoverTimeout) clearTimeout(this.failoverTimeout);
  }

  public broadcast(type: string, payload: any) {
    this.channel.postMessage({ type, payload });
  }

  public destroy() {
    if (this.isLeader) {
      this.channel.postMessage({ type: "RESIGN", id: this.id });
    }
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.clearFailover();
    this.channel.close();
  }
}
