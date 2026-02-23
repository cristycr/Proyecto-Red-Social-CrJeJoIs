import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { Admin } from './pages/admin/admin';
import { Feed } from './pages/feed/feed';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { Landing } from './pages/landing/landing';
import { Register } from './pages/register/register';
import { redirectionGuard } from './guards/redirection-guard';
import { adminGuardGuard } from './guards/admin-guard-guard';

export const routes: Routes = [
    { path: 'about', component: About },
    { path: 'admin', component: Admin, canActivate: [redirectionGuard,adminGuardGuard] },
    { path: 'feed', component: Feed },
    { path: 'login', component: Login },
    { path: 'profile', component: Profile, canActivate: [redirectionGuard] },
    { path: 'profile/:id', component: Profile },
    { path: 'landing', component: Landing },
    { path: 'register', component: Register },
    { path: '', redirectTo: 'landing', pathMatch: 'full' }
];
