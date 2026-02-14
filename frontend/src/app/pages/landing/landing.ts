import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  encapsulation: ViewEncapsulation.None
})
export class LandingComponent {

  selectedRole: 'user' | 'volunteer' | 'admin' | '' = '';

  constructor(private router: Router) {}

  // select role
  selectRole(role: 'user' | 'volunteer' | 'admin') {
    this.selectedRole = role;
  }

  // role name
  getRoleName(): string {
    switch (this.selectedRole) {
      case 'user':
        return 'Community Member';
      case 'volunteer':
        return 'Volunteer';
      case 'admin':
        return 'Administrator';
      default:
        return '';
    }
  }

  // role description
  getRoleDescription(): string {
    switch (this.selectedRole) {
      case 'user':
        return 'As a Community Member, you can report cleanliness issues, track their resolution, and stay informed about local initiatives.';
      case 'volunteer':
        return 'As a Volunteer, you can join cleanup events, participate in green projects, and make a direct impact in your community.';
      case 'admin':
        return 'As an Administrator, you can manage reports, coordinate volunteer activities, and oversee community cleanliness projects.';
      default:
        return '';
    }
  }

  // 🔥 UPDATED LOGIC (STEP 4)
  continueWithRole() {
    if (!this.selectedRole) {
      alert('Please select a role first');
      return;
    }

    // optional: store role
    localStorage.setItem('role', this.selectedRole);

    // navigate based on role
    this.router.navigate([`/login/${this.selectedRole}`]);
  }

  // scroll helper
  scrollToCards() {
    document
      .getElementById('role-cards')
      ?.scrollIntoView({ behavior: 'smooth' });
  }
}
