import { deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Delete all user data from Firestore
 */
export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    const collections = ['transactions', 'categories', 'budgets', 'userSettings'];

    for (const collectionName of collections) {
      const q = query(collection(db, collectionName), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, collectionName, document.id))
      );

      await Promise.all(deletePromises);
    }

    console.log('All user data deleted successfully');
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw new Error('Failed to delete user data');
  }
};

/**
 * Delete user authentication account
 */
export const deleteUserAccount = async (user: any): Promise<void> => {
  try {
    await deleteUser(user);
    console.log('User account deleted successfully');
  } catch (error: any) {
    console.error('Error deleting user account:', error);

    // Handle re-authentication required error
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security reasons, please sign out and sign back in before deleting your account.');
    }

    throw new Error('Failed to delete user account');
  }
};

/**
 * Complete account deletion (data + auth)
 */
export const deleteCompleteAccount = async (user: any): Promise<void> => {
  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    // Delete all Firestore data first
    await deleteUserData(user.uid);

    // Then delete the authentication account
    await deleteUserAccount(user);

    console.log('Account completely deleted');
  } catch (error) {
    console.error('Error during complete account deletion:', error);
    throw error;
  }
};
