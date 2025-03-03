// rendez-vous.component.ts
import { Component, NgModule, OnInit } from '@angular/core';
import { RendezVousService, RendezVous } from '../../service/rendez-vous.service';
import { formatDate } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RendezVousExtended extends RendezVous {
  patientNom?: string;
  patientPrenom?: string;
  medecinNom?: string;
}

@Component({
  selector: 'app-rendez-vous',
  imports: [ CommonModule , FormsModule ],
  templateUrl: './rendez-vous.component.html',
  styleUrls: ['./rendez-vous.component.scss']
})
export class RendezVousComponent implements OnInit {
  allRendezVous: RendezVousExtended[] = [];
  filteredRendezVous: RendezVousExtended[] = [];
  
  dateFilter: string = '';
  statusFilter: string = '';
  viewMode: 'jour' | 'semaine' | 'mois' = 'jour';
  
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // ID du médecin connecté (à remplacer par votre mécanisme d'authentification)
  medecinId: string = 'id-du-medecin-connecte';

  constructor(private rendezVousService: RendezVousService ) {}

  ngOnInit(): void {
    // Initialiser avec la date d'aujourd'hui
    this.dateFilter = formatDate(new Date(), 'yyyy-MM-dd', 'fr');
    this.loadMedecinRendezVous();
  }

  loadMedecinRendezVous(): void {
    this.rendezVousService.getByMedecin(this.medecinId).subscribe({
      next: (response) => {
        // Dans une vraie application, vous récupéreriez les informations patient
        // à partir d'un autre service ou API
        this.allRendezVous = response.rendezVous.map(rdv => {
          return {
            ...rdv,
            patientNom: 'Nom Patient', // À remplacer par les vraies données
            patientPrenom: 'Prénom Patient', // À remplacer par les vraies données
            medecinNom: 'Dr. Connecté' // À remplacer par les vraies données
          };
        });
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous', error);
      }
    });
  }

  loadPendingRequests(): void {
    this.rendezVousService.getPendingRequests(this.medecinId).subscribe({
      next: (response) => {
        this.allRendezVous = response.demandes.map(rdv => {
          return {
            ...rdv,
            patientNom: 'Nom Patient', // À remplacer par les vraies données
            patientPrenom: 'Prénom Patient', // À remplacer par les vraies données
            medecinNom: 'Dr. Connecté' // À remplacer par les vraies données
          };
        });
        this.statusFilter = 'en_attente';
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des demandes en attente', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allRendezVous];
    
    // Filtre par date
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter).toISOString().split('T')[0];
      filtered = filtered.filter(rdv => {
        const rdvDate = new Date(rdv.date).toISOString().split('T')[0];
        return rdvDate === filterDate;
      });
    }
    
    // Filtre par statut
    if (this.statusFilter) {
      filtered = filtered.filter(rdv => rdv.status === this.statusFilter);
    }
    
    // Appliquer la pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredRendezVous = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  filterByStatus(status: string): void {
    if (status === 'en_attente') {
      this.loadPendingRequests();
    } else {
      this.statusFilter = status;
      this.currentPage = 1;
      this.applyFilters();
    }
  }

  acceptRendezVous(id: string): void {
    this.rendezVousService.acceptRequest(id).subscribe({
      next: (response) => {
        console.log('Rendez-vous accepté:', response.message);
        // Mettre à jour l'UI
        const rdvIndex = this.allRendezVous.findIndex(rdv => rdv._id === id);
        if (rdvIndex !== -1) {
          this.allRendezVous[rdvIndex].status = 'confirme';
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'acceptation du rendez-vous', error);
      }
    });
  }

  refuseRendezVous(id: string): void {
    // Note: Votre API ne semble pas avoir d'endpoint spécifique pour refuser
    // On utilise donc la méthode update pour changer le statut à 'annule'
    this.rendezVousService.update(id, { status: 'annule' }).subscribe({
      next: (response) => {
        console.log('Rendez-vous refusé');
        // Mettre à jour l'UI
        const rdvIndex = this.allRendezVous.findIndex(rdv => rdv._id === id);
        if (rdvIndex !== -1) {
          this.allRendezVous[rdvIndex].status = 'annule';
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Erreur lors du refus du rendez-vous', error);
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'confirme': return 'Confirmé';
      case 'annule': return 'Annulé';
      case 'termine': return 'Terminé';
      default: return status;
    }
  }

  filterByDate(): void {
    this.loadMedecinRendezVous(); // Recharger les RDV avec le filtre de date
    this.applyFilters();
  }
}