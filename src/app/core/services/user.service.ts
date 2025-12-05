import { Injectable } from '@angular/core';
import { User, UserRole } from '@models/user.model';
import { delay, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private users: Record<string, { password: string; role: UserRole }> = {
    admin: { password: 'admin', role: 'admin' },
    user: { password: 'user', role: 'user' },
  };

  login(username: string, password: string): Observable<User> {
    const found = this.users[username];

    if (found && found.password === password) {
      const user: User = { username, role: found.role };
      return of(user).pipe(delay(400)); // Simulate delay
    } else {
      return throwError(() => new Error('Invalid credentials'));
    }
  }
}
