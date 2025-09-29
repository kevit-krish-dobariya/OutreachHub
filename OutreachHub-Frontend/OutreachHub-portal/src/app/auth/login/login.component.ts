import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service'
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage = '';
  isDarkMode = false;
  private themeSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(){
    
     // Subscribe to theme changes to update the icon
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = (theme === 'dark');
      });
  }

   ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  /**
   * Toggles the application's theme between light and dark mode.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     this.authService.login(this.loginForm.value).subscribe({
  //       next: (res) => {
  //          console.log('✅ User Payload:', res.user);
  //         localStorage.setItem('token', res.access_token);
  //         console.log('🔑 JWT Token:', res.access_token);// store token
  //         this.authService.setAuthData(res);
  //         this.router.navigate(['/dashboard']).then(success => {
  //           console.log('👉 Router navigation result:', success);
  //         }).catch(err => {
  //           console.error('❌ Router navigation error:', err);
  //         });  // redirect to portal
  //       },
  //       error: (err) => {
  //         this.errorMessage = 'Invalid username or password';
  //         console.error(err);
  //       }
  //     });
  //   }
  // }
  onSubmit() {
  if (this.loginForm.valid) {
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log('✅ User Payload:', res.user);
        console.log('🏢 Workspaces:', res.workspaces);

        // 1. Store token
        localStorage.setItem('token', res.access_token);
        console.log('🔑 JWT Token:', res.access_token);

        // 2. Store user and workspaces
        this.authService.setAuthData(res);

        // 3. Handle workspace selection
        if (res.workspaces && res.workspaces.length > 0) {
          if (res.workspaces.length === 1) {
            // auto-select if only one workspace
            localStorage.setItem('workspaceId', res.workspaces[0].id); // ✅ fixed
            console.log('✅ Selected workspace:', res.workspaces[0].id);

            // navigate to dashboard
            this.router.navigate(['/dashboard']).then(success => {
              console.log('👉 Router navigation result:', success);
            }).catch(err => {
              console.error('❌ Router navigation error:', err);
            });

          } else {
            // multiple workspaces → show selection UI
            alert('Please select a workspace after login.');
            // Example: temporarily pick the first one
            localStorage.setItem('workspaceId', res.workspaces[0].id); // ✅ fixed
            console.log('✅ Defaulted to workspace:', res.workspaces[0].id);

            this.router.navigate(['/dashboard']);
          }
        } else {
          console.warn('⚠️ No workspaces assigned to this user yet');
          this.router.navigate(['/dashboard']); // maybe redirect to empty state
        }
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
        console.error(err);
      }
    });
  }
}




}
