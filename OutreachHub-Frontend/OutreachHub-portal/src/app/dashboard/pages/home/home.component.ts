import { Component } from '@angular/core';
import { ChartOptions, ChartData, ChartConfiguration, ChartType } from 'chart.js';


//   lineChartData = {
//   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
//   datasets: [
//     { data: [10, 20, 15, 30, 25], label: 'Sales', fill: true, tension: 0.4 }
//   ]
// };

// pieChartData = {
//   labels: ['Product A', 'Product B', 'Product C'],
//   datasets: [
//     { data: [30, 50, 20], backgroundColor: ['#f59e0b', '#6366f1', '#ec4899'] }
//   ]
// };

// chartOptions = {
//   responsive: true,
//   plugins: {
//     legend: { display: true, position: 'top' }
//   }
// };
 // Line Chart Data

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Date range models for each chart
  campaignsDateRange: string = '';
  messagesDateRange: string = '';
  contactsDateRange: string = '';

  // Chart data and options
  campaignsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [12, 19, 3, 5, 2, 3, 7], label: 'Campaigns', backgroundColor: '#6366f1' }
    ]
  };

  messagesChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Email', 'SMS', 'WhatsApp', 'LinkedIn'],
    datasets: [
      { data: [120, 90, 60, 30], label: 'Messages Sent', borderColor: '#f59e42', backgroundColor: 'rgba(245,158,66,0.2)', fill: true }
    ]
  };

  contactsChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [50, 60, 70, 80, 90, 100, 110], label: 'Contacts Reached', borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)', fill: true }
    ]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true }
    },
    scales: {
      x: {},
      y: { beginAtZero: true }
    }
  };

  pieChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' },
    tooltip: { enabled: true }
  }
  // No scales for pie chart
};
contacts = [
  { name: 'John Doe', email: 'john@example.com', company: 'ABC Corp' },
  { name: 'Jane Smith', email: 'jane@example.com', company: 'XYZ Inc' }
];

campaigns = [
  { name: 'Campaign 1', status: 'Active', leads: 120 },
  { name: 'Campaign 2', status: 'Paused', leads: 80 }
];
}
