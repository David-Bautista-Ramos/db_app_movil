import { Account, Avatars, Client, Databases, ID, Query, Storage, } from "react-native-appwrite";
import SignIn from "../app/(auth)/sign-in";


export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    plastform: 'com.jsm.aora_david_bautista',
    projectId: '66eaf5b8000868ae3bfe',
    databaseId: '66eaf944002cfbc9625f',
    usersCollectionId: '66eaf9e10034c7552fbf',
    videosCollectionId: '66eafa49001a4560a964',
    storage: '66eafce200341b422a4e'
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

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID,unique(),
            email,
           password,
           username 
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await SignIn(email, password)

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
        throw new Error(error);
    }
};

// sign in 
export async function signIn(email, password) {
    try {
        const session = await account.createEmailPasswordSession(email, password);

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

//Get currentuser
export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.usersCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}