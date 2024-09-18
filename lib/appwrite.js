import { Account, Avatars, Client, Databases, ID, Query, Storage, } from "react-native-appwrite";
import SignIn from "../app/(auth)/sign-in";


export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    plastform: 'com.jsm.aora_david_bautista',
    projectId: '66eb45dd0034ed7d12c5',
    databaseId: '66eb45dd0034ed7d12c5',
    usersCollectionId: '66eb4613000e64f83c15',
    videosCollectionId: '66eb46ad00201d8e759e',
    storage: '66eb489f0001e91e588f'
}


// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projecId) // Your project ID
  .setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.usersCollectionId,
      ID.unique(),
      {
        accountid: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    // Intentar obtener la sesión actual
    await account.getSession("current");
    console.log("User already has an active session.");
    return;
  } catch (error) {
    if (error.code !== 401) {
      // Re-throw error if it's not due to unauthorized access
      throw new Error("Error checking session status: " + error.message);
    }
  }

  try {
    // Si no hay sesión activa, crear una nueva sesión
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error("Error signing in:", error.message);
    throw new Error("Sign in failed: " + error.message);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw new Error("No account found");

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.usersCollectionId,
      [Query.equal("accountid", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error("No user found");

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error getting current user:", error.message);
    return null; // Ensure that you return null if there's an error
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videosCollectionId
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      config.database,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt", Query.limit(7))]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
    1;
  }
};