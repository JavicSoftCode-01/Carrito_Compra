import { LocalStorageManager } from "../../../../../BackEnd/src/utils/localStorageManager.js"; // Ajusta la ruta según tu configuración

class AdminPanel {
  constructor() {
    // Seleccionamos elementos del DOM
    this.usuarioLogueado = document.getElementById("usuario-logueado");
    this.logoutMenu = document.getElementById("logout-menu");
    this.widgetTotalProductos = document.getElementById("widget-total-productos");
    this.widgetTotalCapital = document.getElementById("widget-total-capital");

    // Ejemplo de datos para los widgets (estos podrían provenir de una API o de localStorage)
    this.data = {
      totalProductos: 120,
      totalCapital: 3500.50
    };
  }

  init() {
    this.bindEvents();
    this.loadWidgets();
    this.initCharts();
  }

  bindEvents() {
    // Maneja la visibilidad del menú de logout
    this.usuarioLogueado.addEventListener("click", () => {
      this.toggleLogoutMenu();
    });

    // Ejemplo: cerrar sesión
    const btnLogout = document.getElementById("btn-logout");
    if(btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  toggleLogoutMenu() {
    this.logoutMenu.style.display = (this.logoutMenu.style.display === "none" || this.logoutMenu.style.display === "") ? "block" : "none";
  }

  loadWidgets() {
    // Actualiza los widgets con datos (podrías extraer esto de localStorage o un servicio)
    this.widgetTotalProductos.textContent = this.data.totalProductos;
    this.widgetTotalCapital.textContent = this.data.totalCapital.toFixed(2);
  }

  initCharts() {
    // Inicializa los gráficos usando Chart.js
    const ctxBar = document.getElementById("chart-barras").getContext("2d");
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Producto A', 'Producto B', 'Producto C'],
        datasets: [{
          label: 'Ventas',
          data: [30, 50, 70],
          backgroundColor: ['#ff9aa2', '#ffb7b2', '#ffdac1']
        }]
      }
    });

    const ctxLine = document.getElementById("chart-linea").getContext("2d");
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo'],
        datasets: [{
          label: 'Capital',
          data: [1000, 1500, 3500],
          borderColor: '#b5ead7',
          fill: false
        }]
      }
    });
  }

  logout() {
    // Borra datos del usuario y redirige (ejemplo utilizando localStorage)
    LocalStorageManager.clearData();
    window.location.href = "./login.html"; // Redirige a la página de login
  }
}

export default AdminPanel;
