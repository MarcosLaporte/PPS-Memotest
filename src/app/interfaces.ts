export interface User {
  id: string
  userId: number,
  email: string,
  name: string,
  lastname: string,
  type: UserType,
  gender: UserGender,
}

export type UserType = 'admin' | 'tester' | 'invitado' | 'usuario';
export type UserGender = 'femenino' | 'masculino';

export type Difficulty = 'easy' | 'mid' | 'hard';
export interface Score {
  id: string,
  userDocId: string,
  difficulty: Difficulty,
  seconds: number,
  date: Date
}