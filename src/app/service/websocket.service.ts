import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private bpmSubject = new BehaviorSubject<number>(0); // Observable pour stocker le BPM avec valeur initiale
  private tempSubject = new BehaviorSubject<number>(36.5); // Observable pour stocker la température avec valeur initiale
  private connectionStatus = new BehaviorSubject<boolean>(false);
  
  private reconnectTimer: any;
  private isConnecting = false;
  private BPM_CRITIQUE = 20;  //seuil pour les notification du battement cardiaque

  constructor(private notificationService: NotificationService) {
    this.connect();
  }

  private connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;
    
    // Remplacez par l'adresse IP de votre ESP8266
    this.socket = new WebSocket('ws://192.168.1.140:81');

    this.socket.onopen = () => {
      console.log('WebSocket connecté');
      this.connectionStatus.next(true);
      this.isConnecting = false;
      // Effacer tout timer de reconnexion en cours
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        console.log('Message reçu:', event.data);
        const data = JSON.parse(event.data);
        
        if (data.bpm !== undefined && !isNaN(data.bpm)) {
          const bpm = parseInt(data.bpm);
          // Vérifier que le BPM est dans une plage raisonnable
          if (bpm >= 0 && bpm <= 220) {
            this.bpmSubject.next(bpm);
            this.checkBpm(bpm);//pour les notification du battement cardiaque
          }
        }
        
        if (data.temperature !== undefined && !isNaN(data.temperature)) {
          const temp = parseFloat(data.temperature);
          // Vérifier que la température est dans une plage raisonnable
          if (temp >= 10 && temp <= 50) {
            this.tempSubject.next(temp);
          }
        }
      } catch (error) {
        console.error('Erreur de parsing JSON:', error, 'Données reçues:', event.data);
      }
    };

    this.socket.onclose = () => {
      console.warn('WebSocket fermé, reconnexion...');
      this.connectionStatus.next(false);
      this.isConnecting = false;
      
      // Reconnexion automatique avec backoff exponentiel
      const reconnectDelay = 3000; // 3 secondes
      this.reconnectTimer = setTimeout(() => this.connect(), reconnectDelay);
    };

    this.socket.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
      // La connexion sera fermée automatiquement, ce qui déclenchera onclose
    };
  }

  getBpmUpdates(): Observable<number> {
    return this.bpmSubject.asObservable(); // Retourne les BPM sous forme d'observable
  }

  getTemperatureUpdates(): Observable<number> {
    return this.tempSubject.asObservable(); // Retourne la température sous forme d'observable
  }
  

  //pour les notification du battement cardiaque
  private checkBpm(bpm: number): void {
    if (bpm > this.BPM_CRITIQUE) {
      this.notificationService.sendNotification(
        "🚨 Urgence Médicale !",
        `Le BPM du patient est critique : ${bpm}`
      );
    }
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable(); // Retourne l'état de connexion
  }

  // Méthode pour forcer une reconnexion manuelle
  reconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}