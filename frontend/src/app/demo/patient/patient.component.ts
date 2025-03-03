import { Component, OnInit } from '@angular/core';
import { UtilisateurService, Utilisateur } from 'src/app/service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient',
  imports: [CommonModule , FormsModule],
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {
  patients: Utilisateur[] = [];


  searchTerm: string = '';
  filteredPatients: Utilisateur[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;

  constructor(private utilisateurService: UtilisateurService ) {}

 
  ngOnInit(): void {
    this.utilisateurService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des patients', error);
      }
    });
  }
  
  // Recherche par nom et prénom
  filterPatients(): void {
    this.filteredPatients = this.patients.filter(patient =>
      (patient.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
    this.currentPage = 1;
  }
  
  // Pagination
  paginatedPatients(): Utilisateur[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPatients.slice(start, start + this.itemsPerPage);
  }
  
  totalPages(): number {
    return Math.ceil(this.filteredPatients.length / this.itemsPerPage);
  }
  
  getPages(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
  }










  

  // Fonction pour calculer l'âge à partir de la date de naissance
  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    // Si l'anniversaire n'est pas encore passé cette année, diminuer l'âge d'un an
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }


  // Fonction pour supprimer un patient avec confirmation via SweetAlert2
  deletePatient(id: string): void {
    // Utilisation de SweetAlert2 pour confirmation
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir suppimer ce patient?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si l'utilisateur confirme, on supprime le patient
        this.utilisateurService.deleteUtilisateur(id).subscribe({
          next: () => {
            console.log('Patient supprimé avec succès !');
  
            // SweetAlert pour succès
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Patient supprimé avec succès !',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK'
            }).then(() => {
              // Recharger la liste des patients après le clic sur "OK"
              this.ngOnInit();
            });
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du patient', error);
  
            // SweetAlert pour erreur
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression du patient !',
              confirmButtonColor: '#d33',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }



  

  
}



