import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;
  isLoading = false;
  showError = false;
  showSuccess = false;
  errorMessage = '';
  successMessage = '';
  passwordStrength = '';
  passwordStrengthText = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z]+$')]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      neighborhood: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required],
      agreedToTerms: [false, Validators.requiredTrue],
      subscribeNewsletter: [true],
      volunteerInterest: [false]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.registrationForm.get('password')?.valueChanges.subscribe(
      password => this.checkPasswordStrength(password)
    );
  }

  // Custom validators
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers) {
      return null;
    }
    
    return { weakPassword: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = '';
      this.passwordStrengthText = '';
      return;
    }

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 3) {
      this.passwordStrength = 'weak';
      this.passwordStrengthText = 'Weak';
    } else if (strength < 5) {
      this.passwordStrength = 'medium';
      this.passwordStrengthText = 'Medium';
    } else {
      this.passwordStrength = 'strong';
      this.passwordStrengthText = 'Strong';
    }
  }

  getPasswordStrengthClass(): string {
    switch (this.passwordStrength) {
      case 'weak': return 'strength-weak';
      case 'medium': return 'strength-medium';
      case 'strong': return 'strength-strong';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.markFormGroupTouched(this.registrationForm);
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.showError = true;
      return;
    }

    this.isLoading = true;
    this.showError = false;
    this.showSuccess = false;

    // Prepare user data
    const userData = {
  name: `${this.registrationForm.value.firstName} ${this.registrationForm.value.lastName}`,
  email: this.registrationForm.value.email,
  password: this.registrationForm.value.password
};


    
    // Call backend API
    this.http.post('/api/users/register', userData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Registration successful! Welcome to CleanStreet Community.';
        this.showSuccess = true;
        
        // Reset form
        this.registrationForm.reset({
          subscribeNewsletter: true,
          volunteerInterest: false,
          agreedToTerms: false
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.showError = true;
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  showTerms(): void {
    alert(`TERMS AND CONDITIONS

1. By registering as a Community Member, you agree to use CleanStreet responsibly.
2. You may report cleanliness issues in your neighborhood.
3. All reports should be accurate and respectful.
4. CleanStreet reserves the right to remove inappropriate content.
5. You are responsible for maintaining the confidentiality of your account.`);
  }

  showPrivacy(): void {
    alert(`PRIVACY POLICY

1. We collect your personal information only for the purpose of providing CleanStreet services.
2. Your address information helps us locate issues in your neighborhood.
3. We will never share your personal information with third parties without your consent.
4. You can opt out of newsletters at any time.
5. We implement security measures to protect your data.`);
  }

  // Form control getters
  get firstName() { return this.registrationForm.get('firstName'); }
  get lastName() { return this.registrationForm.get('lastName'); }
  get email() { return this.registrationForm.get('email'); }
  get phone() { return this.registrationForm.get('phone'); }
  get address() { return this.registrationForm.get('address'); }
  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }
  get agreedToTerms() { return this.registrationForm.get('agreedToTerms'); }
}