import { Component, OnInit } from '@angular/core';
import { UtilisateurService, Utilisateur } from 'src/app/service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personnel-medical',
  templateUrl: './personnel-medical.component.html',
  styleUrls: ['./personnel-medical.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule ]
})
export class PersonnelMedicalComponent implements OnInit {
  // Données
  personnel_medical: Utilisateur[] = [];
  filteredPersonnel: Utilisateur[] = [];
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  
  // Filtrage
  searchTerm: string = '';
  
  // Sélection
  selectedItems: Set<string> = new Set();
  allSelected: boolean = false;

  constructor(private utilisateurService: UtilisateurService , private router : Router) {}

  ngOnInit() {
    this.loadPersonnel();
  }

  loadPersonnel() {
    this.utilisateurService.getUtilisateursParRoles(['MEDECIN', 'INFIRMIER' , 'SAGE_FEMME']).subscribe({
      next: (data) => {
        console.log("Utilisateurs reçus :", data);
        this.personnel_medical = Array.isArray(data) ? data : [];
        this.applyFilter();
        this.calculateTotalPages();
      },
      error: (error) => {
        console.error("Erreur lors du chargement des utilisateurs", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger la liste du personnel médical',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // Pagination
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.filteredPersonnel.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPaginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPersonnel.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  // Filtrage
  applyFilter() {
    if (!this.searchTerm) {
      this.filteredPersonnel = [...this.personnel_medical];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredPersonnel = this.personnel_medical.filter(person => 
        person.nom?.toLowerCase().includes(search) || 
        person.role?.toLowerCase().includes(search)
      );
    }
    this.calculateTotalPages();
    this.currentPage = 1;
  }

  // Sélection
  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    
    if (this.allSelected) {
      // Sélectionner tous les éléments affichés
      this.getPaginatedData().forEach(person => {
        if (person.id) this.selectedItems.add(person.id);
      });
    } else {
      // Désélectionner tous les éléments
      this.selectedItems.clear();
    }
  }

  toggleSelect(id: string | undefined) {
    if (!id) return;
    
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
      this.allSelected = false;
    } else {
      this.selectedItems.add(id);
      
      // Vérifier si tous les éléments de la page sont sélectionnés
      const allPageItemsSelected = this.getPaginatedData().every(person => 
        !person.id || this.selectedItems.has(person.id)
      );
      
      this.allSelected = allPageItemsSelected;
    }
  }

  isSelected(id: string | undefined): boolean {
    return id ? this.selectedItems.has(id) : false;
  }

  // Supprimer une personne
  deletePersonnel(id: string): void {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer cette personne?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.deleteUtilisateur(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Suppression effectuée avec succès !',
              confirmButtonColor: '#3085d6'
            });
            this.loadPersonnel();
            this.selectedItems.delete(id);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression !',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  // Supprimer plusieurs personnes
  deleteMultiple(): void {
    if (this.selectedItems.size === 0) return;
    
    Swal.fire({
      title: `Êtes-vous sûr de vouloir supprimer ${this.selectedItems.size} utilisateur(s)?`,
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        let completedCount = 0;
        let errorCount = 0;
        const totalToDelete = this.selectedItems.size;
        
        this.selectedItems.forEach(id => {
          this.utilisateurService.deleteUtilisateur(id).subscribe({
            next: () => {
              completedCount++;
              if (completedCount + errorCount === totalToDelete) {
                this.finishBulkDelete(completedCount, errorCount);
              }
            },
            error: () => {
              errorCount++;
              if (completedCount + errorCount === totalToDelete) {
                this.finishBulkDelete(completedCount, errorCount);
              }
            }
          });
        });
      }
    });
  }

  finishBulkDelete(completed: number, errors: number) {
    if (errors === 0) {
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: `${completed} élément(s) supprimé(s) avec succès !`,
        confirmButtonColor: '#3085d6'
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Résultat mixte',
        text: `${completed} élément(s) supprimé(s), ${errors} erreur(s)`,
        confirmButtonColor: '#3085d6'
      });
    }
    
    this.loadPersonnel();
    this.selectedItems.clear();
    this.allSelected = false;
  }


  editPersonnel(id: string): void {
    this.router.navigate(['/edit/personnel', id]);
  }


  showDetails(person: Utilisateur) {
    Swal.fire({
      title: `${person.nom} ${person.prenom}`,
      html: `
        <div style="text-align: left;">
          <p><strong>Matricule:</strong> ${person.matricule || 'N/A'}</p>
          <p><strong>Email:</strong> ${person.email || 'N/A'}</p>
          <p><strong>Téléphone:</strong> ${person.telephone || 'N/A'}</p>
          <p><strong>Adresse:</strong> ${person.adresse || 'N/A'}</p>
          <p><strong>Date de naissance:</strong> ${person.dateNaissance || 'N/A'}</p>
          <p><strong>Groupe sanguin:</strong> ${person.groupeSanguin || 'N/A'}</p>
          <p><strong>Fonction:</strong> ${person.role || 'N/A'}</p>
          ${person.photo ? `<img src="assets/images/user/avatar-2.jpg" alt="Photo de ${person.nom}" style="max-width: 100px; border-radius: 5px;">` : ''}
        </div>
      `,
      showCloseButton: true,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#3085d6'
    });
  }
  



}