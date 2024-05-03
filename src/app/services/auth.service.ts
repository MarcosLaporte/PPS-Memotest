import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from './database.service';
import { User, UserGender, UserType } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

//#region Properties, Subjects and Observables
private _userInSessionSub = new BehaviorSubject<User | null>(null);
public userInSessionObs = this._userInSessionSub.asObservable();
public get UserInSession(): User | null {
  return this._userInSessionSub.getValue();
}
public set UserInSession(value: User | null) {
  if (value) {
    sessionStorage.setItem('userInSession', JSON.stringify(value));
  } else {
    sessionStorage.removeItem('userInSession');
    if (this.auth.currentUser)
      this.auth.signOut();
  }

  this._userInSessionSub.next(value);
}
//#endregion

constructor(private auth: Auth, private db: DatabaseService) { }

async createAccount(name: string, lastName: string, email: string, type: UserType, gender: UserGender, password: string): Promise<string> {
  try {
    await createUserWithEmailAndPassword(this.auth, email, password);

    const userId: number = (await this.db.getData<User>('users')).length +1;
    const newUser: User = { id: '', userId: userId, name: name, lastname: lastName, email: email, type: type, gender: gender };
    const docId = await this.db.addData('users', newUser, true);

    this.UserInSession = newUser;

    return docId;
  } catch (error: any) {
    throw new Error(this.parseError(error));
  }
}

async signInToFirebase(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(this.auth, email, password);
    const userObj = await this.db.searchUserByEmail(this.auth.currentUser?.email!)

    if (userObj) this.UserInSession = userObj;
  } catch (error) {
    throw new Error(this.parseError(error));
  }
}

signOut() {
  this.UserInSession = null;
}

private parseError(error: any): string {
  let message: string = error.message;
  switch (error.code) {
    case `auth/invalid-credential`:
      message = `La dirección de correo o contraseña no son válidos.`;
      break;
    case `auth/invalid-email`:
      message = `La dirección de correo no es válida.`;
      break;
    case `auth/user-not-found`:
      message = `Esta dirección de correo no está registrada.`;
      break;
    case `auth/wrong-password`:
      message = `La contraseña es incorrecta.`;
      break;
    case `auth/email-already-in-use`:
      message = `Esta dirección de correo ya está registrada.`;
      break;
    case `auth/weak-password`:
      message = `La contraseña es muy débil.`;
      break;
    case `auth/operation-not-allowed`:
      message = `Esta operación de autentificación no está permitida.`;
      break;
  }

  return message;
}}
