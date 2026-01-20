import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { Admin } from './pages/admin/admin';
import { Feed } from './pages/feed/feed';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
    { path: 'about', component: About },
    { path: 'admin', component: Admin },
    { path: 'feed', component: Feed },
    { path: 'login', component: Login },
    { path: 'profile', component: Profile },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
