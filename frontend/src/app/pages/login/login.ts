import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;

  isLoading = false;
  showError = false;
  errorMessage = '';
  showForgotPasswordForm = false;

  forgotPasswordLoading = false;
  forgotPasswordSuccess = false;
  forgotPasswordError = false;
  forgotPasswordMessage = '';

  loginType: 'user' | 'volunteer' | 'admin' = 'user';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {

    const url = this.router.url;

    if (url.includes('volunteer')) {
      this.loginType = 'volunteer';
    } else if (url.includes('admin')) {
      this.loginType = 'admin';
    } else {
      this.loginType = 'user';
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    this.forgotPasswordForm = this.fb.group({
      forgotEmail: ['', [Validators.required, Validators.email]]
    });
  }

  // ================= LOGIN =================
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill all fields correctly';
      this.showError = true;
      return;
    }

    this.isLoading = true;
    this.showError = false;

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.http.post<any>('/api/users/login', loginData).subscribe({
      next: (response) => {
        console.log('LOGIN SUCCESS RESPONSE:', response);

        this.isLoading = false;

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // 🔥 FIX HERE
        const role = response.user?.role?.toLowerCase() || 'user';
        console.log('EXTRACTED ROLE:', role);
        this.redirectBasedOnRole(role);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed';
        this.showError = true;
      }
    });
  }

  // ================= REDIRECT =================
  redirectBasedOnRole(role: string): void {
    console.log('REDIRECT FUNCTION CALLED');
    console.log('ROLE RECEIVED:', role);

    // 🔧 FIX: normalize role
    const normalizedRole = role.toLowerCase();
    console.log('NORMALIZED ROLE:', normalizedRole);

    if (normalizedRole === 'user') {
      console.log('NAVIGATING TO DASHBOARD');
      this.router.navigateByUrl('/dashboard').then(success => {
        console.log('Navigation result:', success);
      }).catch(error => {
        console.error('Navigation error:', error);
      });
    } else if (normalizedRole === 'volunteer') {
      alert('Volunteer dashboard coming soon');
    } else if (normalizedRole === 'admin') {
      alert('Admin dashboard coming soon');
    } else {
      console.error('UNKNOWN ROLE AFTER NORMALIZE:', normalizedRole);
    }
  }

  // ================= FORM CONTROL GETTERS =================
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get forgotEmail() {
    return this.forgotPasswordForm.get('forgotEmail');
  }

  // ================= FORGOT PASSWORD =================
  toggleForgotPassword(): void {
    this.showForgotPasswordForm = !this.showForgotPasswordForm;
    this.forgotPasswordError = false;
    this.forgotPasswordSuccess = false;
    this.forgotPasswordMessage = '';
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordMessage = 'Please enter a valid email';
      this.forgotPasswordError = true;
      return;
    }

    this.forgotPasswordLoading = true;
    this.forgotPasswordError = false;
    this.forgotPasswordSuccess = false;

    const resetData = {
      email: this.forgotPasswordForm.value.forgotEmail
    };

    this.http.post<any>('/api/users/forgot-password', resetData).subscribe({
      next: (response) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordSuccess = true;
        this.forgotPasswordMessage = response.message || 'Password reset link sent to your email';
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordError = true;
        this.forgotPasswordMessage = error.error?.message || 'Failed to send reset link';
      }
    });
  }

}
