import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, setDoc, deleteDoc, updateDoc, onSnapshot, query, QuerySnapshot, orderBy, Query, limit, DocumentSnapshot, getDoc } from '@angular/fire/firestore';
import { User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private firestore: Firestore) { }

  async getData<T>(colPath: string, fieldOrderBy?: string): Promise<Array<T>> {
    const col = collection(this.firestore, colPath);

    let q: Query;
    if (fieldOrderBy)
      q = query(col, orderBy(fieldOrderBy));
    else
      q = query(col)

    const querySnapshot = await getDocs(q);
    const arrAux: Array<T> = [];

    querySnapshot.forEach((doc) => {
      arrAux.push(doc.data() as T);
    });

    return arrAux;
  }

  async getDataFromDoc<T>(colPath: string, docId: string): Promise<T> {
    const docRef = doc(this.firestore, colPath, docId);

    const data = (await getDoc(docRef)).data();
    return data as T;
  }

  async addData(colPath: string, data: any, setDocId: boolean = true): Promise<string> {
    const col = collection(this.firestore, colPath);
    const newDoc = doc(col);
    if (setDocId)
      data.id = newDoc.id;

    try {
      await setDoc(newDoc, { ...data });
    } catch (error) {
      deleteDoc(newDoc);
      throw new Error('Hubo un problema al subir los datos.');
    }

    return newDoc.id;
  }

  updateDoc(colPath: string, docId: string, data: any) {
    const docRef = doc(this.firestore, colPath, docId);

    return updateDoc(docRef, { ...data });
  }

  listenColChanges<T extends { id: string }>(
    colPath: string,
    arrayPointer: Array<T>,
    filterFunc?: (item: T) => boolean,
    sortFunc?: (a: any, b: any) => number,
    transform?: (item: T) => Promise<T>
  ) {
    const col = collection(this.firestore, colPath);
    const q = query(col);

    onSnapshot(q, async (addSnap: QuerySnapshot) => {
      for (const change of addSnap.docChanges()) {
        const data = change.doc.data();
        const newData = transform ? await transform(data as T) : data as T;
        if (!filterFunc || filterFunc(newData)) {
          if (change.type === 'added') {
            arrayPointer.push(newData);
          } else {
            const index = arrayPointer.findIndex(t => t.id === newData.id);
            if (change.type === 'modified')
              arrayPointer[index] = newData;
            else
              arrayPointer.splice(index, 1);
          }
        }
      }

      if (sortFunc)
        arrayPointer.sort(sortFunc);
    });
  }

  async searchUserByEmail(email: string): Promise<User> {
    const arrayUsers = await this.getData<User>('users');
    const index = arrayUsers.findIndex(u => u.email === email);
    if (index === -1) throw new Error('Esta dirección de correo no está registrada.');

    return arrayUsers[index];
  }
}
