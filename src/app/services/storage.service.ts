import { Injectable } from '@angular/core';
import { ListResult, Storage, getDownloadURL, listAll, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
	providedIn: 'root'
})
export class StorageService {
	constructor(private storage: Storage) { }

	async uploadImage(image: File, path: string): Promise<string> {
		const imgRef = ref(this.storage, `images/${path}`);

		try {
			await uploadBytes(imgRef, image);
			return await getDownloadURL(imgRef);
		} catch (error) {
			throw Error('Hubo un problema al subir la imagen.');
		}
	}

  async getFileDownloadUrl(path: string): Promise<string> {
    const fileRef = ref(this.storage, path);
    return await getDownloadURL(fileRef);
  }

  async getAllFiles(path: string): Promise<ListResult> {
    const listRef = ref(this.storage, path);
    return await listAll(listRef)
  }
}