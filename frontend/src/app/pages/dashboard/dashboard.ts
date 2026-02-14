import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Complaint {
  id: number;
  title: string;
  issueType: string;
  location: string;
  dateSubmitted: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  // User data (static for now)
  userName = 'Suman';
  userEmail = 'suman@example.com';
  userPhone = '+91 98765 43210';
  userAddress = '123 Green Street, Eco City';
  
  // Sidebar state
  isSidebarOpen = true;
  
  // Mobile menu state
  isMobileMenuOpen = false;
  
  // Summary statistics
  totalComplaints = 8;
  pendingComplaints = 3;
  inProgressComplaints = 2;
  resolvedComplaints = 3;
  
  // Sample complaints data
  complaints: Complaint[] = [
    {
      id: 1,
      title: 'Garbage Accumulation',
      issueType: 'Waste Management',
      location: 'Park Street',
      dateSubmitted: '2023-10-15',
      status: 'Resolved',
      description: 'Large pile of garbage near park entrance'
    },
    {
      id: 2,
      title: 'Broken Street Light',
      issueType: 'Infrastructure',
      location: 'Main Road',
      dateSubmitted: '2023-10-18',
      status: 'In Progress',
      description: 'Street light not working for 3 days'
    },
    {
      id: 3,
      title: 'Drainage Blockage',
      issueType: 'Sanitation',
      location: 'Lane 5',
      dateSubmitted: '2023-10-20',
      status: 'Pending',
      description: 'Water logging due to blocked drain'
    },
    {
      id: 4,
      title: 'Illegal Dumping',
      issueType: 'Waste Management',
      location: 'River Side',
      dateSubmitted: '2023-10-22',
      status: 'Pending',
      description: 'Construction waste dumped illegally'
    },
    {
      id: 5,
      title: 'Public Toilet Maintenance',
      issueType: 'Sanitation',
      location: 'Market Area',
      dateSubmitted: '2023-10-25',
      status: 'Resolved',
      description: 'Toilet facilities not clean'
    }
  ];
  
  // Get status badge class
  getStatusClass(status: string): string {
    switch(status) {
      case 'Pending': return 'status-pending';
      case 'In Progress': return 'status-inprogress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  }
  
  // Toggle sidebar
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  
  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  // Logout function
  logout(): void {
    alert('Logging out... In a real app, this would clear session and redirect to login.');
    // In real app: localStorage.clear(); this.router.navigate(['/login']);
  }
  
  // Navigate to raise complaint
  raiseComplaint(): void {
    alert('Redirecting to Raise Complaint form...');
    // In real app: this.router.navigate(['/raise-complaint']);
  }

    viewComplaintDetails(complaint: any): void {
    alert(
      'Complaint Details:\n\n' +
      'Title: ' + complaint.title + '\n' +
      'Status: ' + complaint.status + '\n' +
      'Location: ' + complaint.location + '\n' +
      'Description: ' + complaint.description
    );
  }

}