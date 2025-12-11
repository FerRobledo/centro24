import { Component, OnInit } from '@angular/core';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ EstadisticasComponent ],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
