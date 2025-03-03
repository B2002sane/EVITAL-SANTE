// Angular import
import { Component, OnInit, ViewChild } from '@angular/core';

// Third-party import
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-income-overview-chart',
  imports: [CardComponent, NgApexchartsModule],
  templateUrl: './income-overview-chart.component.html',
  styleUrls: ['./income-overview-chart.component.scss'] // Correction ici (styleUrl → styleUrls)
})
export class IncomeOverviewChartComponent implements OnInit {
  // ViewChild pour accéder au composant Chart
  @ViewChild('chart') chart!: ChartComponent;
  
  // Options du diagramme
  chartOptions!: Partial<ApexOptions>;

  // Life cycle hook
  ngOnInit() {
    this.chartOptions = {
      chart: {
        type: 'donut',
        height: 300,
        toolbar: {
          show: false
        },
        background: 'transparent'
      },
      labels: ['Femme', 'Homme', 'Enfants'], // Catégories
      series: [45, 35, 20], // Données fictives
      colors: ['#FF4560', '#008FFB', '#00E396'], // Couleurs personnalisées

      plotOptions: {
        pie: {
          donut: {
            size: '60%' // Ajuste la taille du donut
          }
        }
      },
      dataLabels: {
        enabled: true, // Active les labels sur les tranches
        style: {
          fontSize: '14px',
          fontWeight: 'bold'
        }
      },
      legend: {
        position: 'bottom'
      },
      tooltip: {
        theme: 'light'
      }
    };
  }
}
