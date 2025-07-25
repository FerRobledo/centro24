import { Component, OnInit } from '@angular/core';
import { Log } from 'src/assets/dto/log';
import { LogsService } from 'src/app/services/logs.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent implements OnInit {
  
  // Variable para controlar si el modal está abierto o cerrado
  mostrarModal: boolean = false;

  // Array para almacenar los logs
  logs: Log[] = [];
  logsFiltrados: Log[] = [];

  // Variables para filtros
  filtroFecha: string = '';
  filtroAccion: string = '';

  // Variable para estado de carga
  cargando: boolean = false;


  constructor(private logsService: LogsService) {}

  ngOnInit() {
    // No cargar logs al inicializar, solo cuando se abra el modal
  }

  // Método para abrir el modal
  abrirModal() {
    this.mostrarModal = true;
    this.cargarLogs(); // Carga los logs cuando se abre el modal  
  }

  // Método para cerrar el modal
  cerrarModal() {
    this.mostrarModal = false;
    this.limpiarFiltros();
  }

  // Método que se ejecuta cuando se hace clic fuera del modal
  cerrarModalFuera(event: Event) {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
      this.limpiarFiltros();
    }
  }

  // Método para cargar los logs desde el backend
  cargarLogs() {
    this.cargando = true;
    this.limpiarFiltros();
    this.logsService.getLogs().subscribe({
      next: (logs) => {
        this.logs = logs;
        this.logsFiltrados = logs;
        this.cargando = false;
        console.log('Logs cargados:', logs); // Para debug
      },
      error: (error: any) => {
        console.error('Error al cargar logs:', error);
        this.cargando = false;
      }
    });
  }

  // Método para aplicar filtros (fecha y accion)
  aplicarFiltros() {
    this.logsFiltrados = this.logs.filter(log => {
      let cumpleFiltros = true;

      // Filtro por fecha
      if (this.filtroFecha) {
        const fechaString = log.fecha_y_hora;
        if (fechaString) {
          // Convertir la fecha del log a formato YYYY-MM-DD
          const fechaLog = new Date(fechaString);
          const fechaLogFormatted = fechaLog.getFullYear() + '-' + 
                                   String(fechaLog.getMonth() + 1).padStart(2, '0') + '-' + 
                                   String(fechaLog.getDate()).padStart(2, '0');
          cumpleFiltros = cumpleFiltros && fechaLogFormatted === this.filtroFecha;
        }
      }

      // Filtro por acción
      if (this.filtroAccion) {
        cumpleFiltros = cumpleFiltros && log.accion === this.filtroAccion;
      }

      return cumpleFiltros;
    });
  }

  // Método para limpiar filtros
  limpiarFiltros() {
    this.filtroFecha = '';
    this.filtroAccion = '';
    this.logsFiltrados = this.logs;
  }

  
}
